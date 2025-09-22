#![allow(clippy::unused_async)]

use actix_multipart::Multipart;
use actix_web::{web, HttpResponse, Result};
use chrono::Utc;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use shared::{
    errors::{ErrorResponse, ServiceError},
    models::{
        auth::User,
        user_files::{
            FileStatus, UpdateUserFileRequest, UserFile, UserFileInfo, UserFileResponse,
            UserFilesResponse,
        },
    },
    services::s3::S3Service,
};
use std::path::Path;
use utoipa::ToSchema;
use uuid::Uuid;

/// Request query parameters for listing user files with pagination
#[derive(Debug, Clone, Copy, Deserialize, ToSchema, utoipa::IntoParams)]
#[schema(example = json!({
    "offset": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "limit": 50
}))]
pub struct ListFilesQuery {
    /// UUID offset for cursor-based pagination
    #[schema(example = "d290f1ee-6c54-4b01-90e6-d701748f0851")]
    pub offset: Option<Uuid>,
    /// Maximum number of files to return (default: 50, max: 100)
    #[schema(example = 50)]
    pub limit: Option<i64>,
}

/// Response for file upload operations
#[derive(Serialize, ToSchema, Debug)]
#[schema(example = json!({
    "message": "File uploaded successfully",
    "file": {
        "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "filename": "document.pdf",
        "original_filename": "My Important Document.pdf",
        "file_size": 1_048_576,
        "mime_type": "application/pdf",
        "status": "uploaded"
    }
}))]
pub struct FileUploadResponse {
    /// Upload confirmation message
    pub message: String,
    /// Uploaded file information
    pub file: UserFileInfo,
}

/// Upload a file
///
/// # Errors
/// Returns an error if file upload, database operations, or file system operations fail.
#[utoipa::path(
    post,
    path = "/api/files/upload",
    tag = "files",
    request_body(
        content = String,
        description = "Multipart form data with file field",
        content_type = "multipart/form-data"
    ),
    responses(
        (status = 201, description = "File uploaded successfully", body = FileUploadResponse),
        (status = 400, description = "Invalid request or file", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 413, description = "File too large", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    security(
        ("session" = [])
    )
)]
pub async fn upload_file(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    s3_service: web::Data<S3Service>,
    mut payload: Multipart,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::user_files::dsl as files_dsl;

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let mut file_data: Option<Vec<u8>> = None;
    let mut original_filename: Option<String> = None;
    let mut content_type: Option<String> = None;

    while let Some(payload_field) = payload.next().await {
        let mut field = payload_field.map_err(|e| {
            actix_web::error::ErrorBadRequest(format!("Failed to process multipart field: {e}"))
        })?;

        let field_name = field.name().to_owned();

        if field_name.as_str() == "file" {
            let content_disposition = field.content_disposition();
            original_filename = content_disposition.get_filename().map(ToString::to_string);

            content_type = Some(field.content_type().to_string());

            let mut file_bytes = Vec::new();
            while let Some(chunk_field) = field.next().await {
                let chunk = chunk_field.map_err(|e| {
                    actix_web::error::ErrorBadRequest(format!("Failed to read file chunk: {e}"))
                })?;
                file_bytes.extend_from_slice(&chunk);
            }
            file_data = Some(file_bytes);
        }
    }

    let file_bytes =
        file_data.ok_or_else(|| actix_web::error::ErrorBadRequest("No file uploaded"))?;

    if file_bytes.is_empty() {
        return Ok(HttpResponse::BadRequest().json(ErrorResponse {
            error: "Uploaded file is empty".to_owned(),
            code: None,
        }));
    }

    let file_id = Uuid::new_v4();
    let original_name = original_filename.unwrap_or_else(|| "unknown".to_owned());
    let mime_type = content_type.unwrap_or_else(|| "application/octet-stream".to_owned());

    let mut hasher = Sha256::new();
    hasher.update(&file_bytes);
    let file_hash = format!("{:x}", hasher.finalize());

    let extension = Path::new(&original_name)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("bin");

    let s3_key = format!("user_files/{}/{}.{}", user.id, file_id, extension);

    let s3_url = s3_service
        .put_object(&s3_key, file_bytes.clone())
        .await
        .map_err(|e| {
            actix_web::error::ErrorInternalServerError(format!("Failed to upload to S3: {e}"))
        })?;

    let new_file = UserFile {
        id: file_id,
        user_id: user.id,
        filename: format!("{file_id}.{extension}"),
        original_filename: original_name,
        file_path: s3_key.clone(),
        file_size: i64::try_from(file_bytes.len())
            .map_err(|_err| actix_web::error::ErrorBadRequest("File size too large"))?,
        mime_type,
        file_hash,
        status: FileStatus::Uploaded.into(),
        metadata: Some(serde_json::json!({
            "s3_url": s3_url,
            "s3_key": s3_key
        })),
        created_at: Some(Utc::now().naive_utc()),
        updated_at: Some(Utc::now().naive_utc()),
        deleted_at: None,
    };

    let inserted_file: UserFile = diesel::insert_into(files_dsl::user_files)
        .values(&new_file)
        .get_result(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    Ok(HttpResponse::Created().json(FileUploadResponse {
        message: "File uploaded successfully".to_owned(),
        file: inserted_file.into(),
    }))
}

/// List user's files with cursor-based pagination
///
/// # Errors
/// Returns an error if database operations fail.
#[utoipa::path(
    get,
    path = "/api/files",
    tag = "files",
    params(ListFilesQuery),
    responses(
        (status = 200, description = "Files retrieved successfully", body = UserFilesResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    security(
        ("session" = [])
    )
)]
pub async fn list_files(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    query: web::Query<ListFilesQuery>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::user_files::dsl as files_dsl;

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let limit = query.limit.unwrap_or(50).min(100);

    let mut query_builder = files_dsl::user_files
        .filter(files_dsl::user_id.eq(user.id))
        .filter(files_dsl::deleted_at.is_null())
        .order(files_dsl::created_at.desc())
        .limit(limit)
        .into_boxed();

    if let Some(offset_id) = query.offset {
        let offset_created_at: chrono::NaiveDateTime = files_dsl::user_files
            .filter(files_dsl::id.eq(offset_id))
            .select(files_dsl::created_at)
            .first::<Option<chrono::NaiveDateTime>>(&mut conn)
            .await
            .map_err(|e| ServiceError::Database(e.to_string()))?
            .unwrap_or_else(|| Utc::now().naive_utc());

        query_builder = query_builder.filter(files_dsl::created_at.lt(offset_created_at));
    }

    let files: Vec<UserFile> = query_builder
        .load(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    let file_infos: UserFilesResponse = files.into_iter().map(UserFileInfo::from).collect();

    Ok(HttpResponse::Ok().json(file_infos))
}

/// Get a specific file by ID
///
/// # Errors
/// Returns an error if database operations fail or file not found.
#[utoipa::path(
    get,
    path = "/api/files/{file_id}",
    tag = "files",
    params(
        ("file_id" = Uuid, Path, description = "File unique identifier")
    ),
    responses(
        (status = 200, description = "File retrieved successfully", body = UserFileResponse),
        (status = 404, description = "File not found", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Access forbidden", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    security(
        ("session" = [])
    )
)]
pub async fn get_file(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    s3_service: web::Data<S3Service>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::user_files::dsl as files_dsl;

    let file_id = path.into_inner();
    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let file: UserFile = files_dsl::user_files
        .filter(files_dsl::id.eq(file_id))
        .filter(files_dsl::user_id.eq(user.id))
        .filter(files_dsl::deleted_at.is_null())
        .first(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    let presigned_url = s3_service
        .get_presigned_url(&file.file_path, 3600)
        .await
        .map_err(|e| {
            actix_web::error::ErrorInternalServerError(format!(
                "Failed to generate presigned URL: {e}"
            ))
        })?;

    let mut file_info = UserFileInfo::from(file);

    let mut metadata = file_info.metadata.unwrap_or_else(|| serde_json::json!({}));
    if let Some(obj) = metadata.as_object_mut() {
        let _old_url = obj.insert(
            "download_url".to_owned(),
            serde_json::Value::String(presigned_url),
        );
        let _old_expires = obj.insert(
            "expires_in_seconds".to_owned(),
            serde_json::Value::Number(serde_json::Number::from(3_600_i32)),
        );
    }
    file_info.metadata = Some(metadata);

    Ok(HttpResponse::Ok().json(file_info))
}

/// Update file metadata
///
/// # Errors
/// Returns an error if database operations fail or file not found.
#[utoipa::path(
    put,
    path = "/api/files/{file_id}",
    tag = "files",
    params(
        ("file_id" = Uuid, Path, description = "File unique identifier")
    ),
    request_body = UpdateUserFileRequest,
    responses(
        (status = 200, description = "File updated successfully", body = UserFileResponse),
        (status = 404, description = "File not found", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Access forbidden", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    security(
        ("session" = [])
    )
)]
pub async fn update_file(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    path: web::Path<Uuid>,
    body: web::Json<UpdateUserFileRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::user_files::dsl as files_dsl;

    let file_id = path.into_inner();
    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let existing_file: UserFile = files_dsl::user_files
        .filter(files_dsl::id.eq(file_id))
        .filter(files_dsl::user_id.eq(user.id))
        .filter(files_dsl::deleted_at.is_null())
        .first(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::NotFound => ServiceError::NotFound("File not found".to_owned()),
            _ => ServiceError::Database(e.to_string()),
        })?;

    let mut current_file = existing_file;

    if let Some(ref filename) = body.filename {
        current_file = diesel::update(files_dsl::user_files.filter(files_dsl::id.eq(file_id)))
            .set((
                files_dsl::filename.eq(filename),
                files_dsl::updated_at.eq(Utc::now().naive_utc()),
            ))
            .get_result(&mut conn)
            .await
            .map_err(|e| ServiceError::Database(e.to_string()))?;
    }

    if let Some(ref status) = body.status {
        current_file = diesel::update(files_dsl::user_files.filter(files_dsl::id.eq(file_id)))
            .set((
                files_dsl::status.eq(String::from(*status)),
                files_dsl::updated_at.eq(Utc::now().naive_utc()),
            ))
            .get_result(&mut conn)
            .await
            .map_err(|e| ServiceError::Database(e.to_string()))?;
    }

    if let Some(ref metadata) = body.metadata {
        current_file = diesel::update(files_dsl::user_files.filter(files_dsl::id.eq(file_id)))
            .set((
                files_dsl::metadata.eq(metadata),
                files_dsl::updated_at.eq(Utc::now().naive_utc()),
            ))
            .get_result(&mut conn)
            .await
            .map_err(|e| ServiceError::Database(e.to_string()))?;
    }

    let updated_file = current_file;

    Ok(HttpResponse::Ok().json(UserFileResponse::from(updated_file)))
}

/// Delete a file (soft delete)
///
/// # Errors
/// Returns an error if database operations fail or file not found.
#[utoipa::path(
    delete,
    path = "/api/files/{file_id}",
    tag = "files",
    params(
        ("file_id" = Uuid, Path, description = "File unique identifier")
    ),
    responses(
        (status = 204, description = "File deleted successfully"),
        (status = 404, description = "File not found", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Access forbidden", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    security(
        ("session" = [])
    )
)]
pub async fn delete_file(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    s3_service: web::Data<S3Service>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::user_files::dsl as files_dsl;

    let file_id = path.into_inner();
    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let existing_file: UserFile = files_dsl::user_files
        .filter(files_dsl::id.eq(file_id))
        .filter(files_dsl::user_id.eq(user.id))
        .filter(files_dsl::deleted_at.is_null())
        .first(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::NotFound => ServiceError::NotFound("File not found".to_owned()),
            _ => ServiceError::Database(e.to_string()),
        })?;

    s3_service
        .delete_object(&existing_file.file_path)
        .await
        .map_err(|e| {
            actix_web::error::ErrorInternalServerError(format!("Failed to delete from S3: {e}"))
        })?;

    let _rows_affected = diesel::update(files_dsl::user_files.filter(files_dsl::id.eq(file_id)))
        .set((
            files_dsl::deleted_at.eq(Utc::now().naive_utc()),
            files_dsl::updated_at.eq(Utc::now().naive_utc()),
        ))
        .execute(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    Ok(HttpResponse::NoContent().finish())
}

/// Serve file content with user authentication
///
/// This endpoint is designed to be used to get file content with proper authentication.
/// It verifies user access to the file and returns the file content with proper cache headers.
///
/// # Errors
/// Returns an error if file not found, access denied, or S3 operations fail.
#[utoipa::path(
    get,
    path = "/api/cdn/files/{file_id}",
    tag = "files",
    params(
        ("file_id" = Uuid, Path, description = "File unique identifier")
    ),
    responses(
        (status = 200, description = "File content returned", content_type = "application/octet-stream"),
        (status = 404, description = "File not found", body = ErrorResponse),
        (status = 401, description = "Unauthorized", body = ErrorResponse),
        (status = 403, description = "Access forbidden", body = ErrorResponse),
        (status = 500, description = "Internal server error", body = ErrorResponse)
    ),
    security(
        ("session" = [])
    )
)]
pub async fn serve_file_cdn(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    s3_service: web::Data<S3Service>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::user_files::dsl as files_dsl;

    let file_id = path.into_inner();
    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    // Check if user has access to this file
    let file: UserFile = files_dsl::user_files
        .filter(files_dsl::id.eq(file_id))
        .filter(files_dsl::user_id.eq(user.id)) // For now, only owner access
        .filter(files_dsl::deleted_at.is_null())
        .first(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::NotFound => {
                actix_web::error::ErrorNotFound("File not found or access denied")
            }
            _ => actix_web::error::ErrorInternalServerError(format!("Database error: {e}")),
        })?;

    // Get file stream from S3
    let file_stream = s3_service
        .get_object_stream(&file.file_path)
        .await
        .map_err(|e| {
            actix_web::error::ErrorInternalServerError(format!("Failed to fetch file from S3: {e}"))
        })?;

    // Convert ServiceError stream to actix-web error stream
    let actix_stream = file_stream.map(|chunk_result| {
        chunk_result.map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))
    });

    // Return file with CDN-friendly headers using streaming body
    Ok(HttpResponse::Ok()
        .content_type(file.mime_type.as_str())
        .insert_header(("Cache-Control", "public, max-age=86400, immutable")) // 24 hour cache
        .insert_header(("ETag", format!("\"{}\"", file.file_hash)))
        .insert_header((
            "Content-Disposition",
            format!("inline; filename=\"{}\"", file.original_filename),
        ))
        .streaming(actix_stream))
}
