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

/// File upload request schema for multipart form data
#[derive(Debug, Serialize, Deserialize, ToSchema)]
pub struct FileUploadRequest {
    /// The file to upload
    #[schema(
        format = "binary",
        example = "Binary file content (PDF, image, document, etc.)"
    )]
    pub file: String,
}

/// Request query parameters for listing user files with pagination
#[derive(Debug, Clone, Copy, Deserialize, ToSchema, utoipa::IntoParams)]
#[schema(example = json!({
    "offset": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "limit": 50
}))]
pub struct ListFilesQuery {
    /// UUID offset for cursor-based files pagination
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
        "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "filename": "document.pdf",
        "originalFilename": "My Important Document.pdf",
        "fileSize": 1_048_576,
        "mimeType": "application/pdf",
        "fileHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "status": "uploaded",
        "metadata": {"description": "Important document"},
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-01T00:00:00Z"
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
    path = "/api/files/actions/upload",
    tag = "Files",
    request_body(
        content = FileUploadRequest,
        description = "Multipart form data with file field",
        content_type = "multipart/form-data",
        example = json!({
            "file": "Binary file content - upload any file type (PDF, image, document, etc.)"
        })
    ),
    responses(
        (status = 201, description = "File uploaded successfully", body = FileUploadResponse),
        (status = 400, description = "Invalid file upload request or malformed file data", body = ErrorResponse),
        (status = 401, description = "Authentication required for file upload", body = ErrorResponse),
        (status = 413, description = "Uploaded file exceeds maximum size limit", body = ErrorResponse),
        (status = 500, description = "Server error during file upload or storage", body = ErrorResponse)
    ),
    security(
        ("cookieAuth" = [], "bearerAuth" = [])
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
        filename: original_name.clone(),
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
    tag = "Files",
    params(ListFilesQuery),
    responses(
        (status = 200, description = "User files retrieved with pagination support", body = UserFilesResponse),
        (status = 401, description = "Authentication required to access files", body = ErrorResponse),
        (status = 500, description = "Database error while retrieving user files", body = ErrorResponse)
    ),
    security(
        ("cookieAuth" = [], "bearerAuth" = [])
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
    tag = "Files",
    params(
        ("file_id" = Uuid, Path, description = "UUID of the file to retrieve details for")
    ),
    responses(
        (status = 200, description = "File details retrieved with download URL", body = UserFileResponse),
        (status = 404, description = "Requested file does not exist or was deleted", body = ErrorResponse),
        (status = 401, description = "User authentication required to view file", body = ErrorResponse),
        (status = 403, description = "File access denied - user does not own this file", body = ErrorResponse),
        (status = 500, description = "Server error generating file download URL", body = ErrorResponse)
    ),
    security(
        ("cookieAuth" = [], "bearerAuth" = [])
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

/// Update file metadata and properties
///
/// # Errors
/// Returns an error if validation fails, file not found, or database operations fail.
#[utoipa::path(
    put,
    path = "/api/files/{file_id}",
    tag = "Files",
    params(
        ("file_id" = Uuid, Path, description = "UUID of the file to update metadata for")
    ),
    request_body(content = UpdateUserFileRequest, description = "Updated file metadata, filename, or status"),
    responses(
        (status = 200, description = "File metadata updated successfully", body = UserFileResponse),
        (status = 404, description = "Target file not found for update", body = ErrorResponse),
        (status = 401, description = "Authentication required to modify files", body = ErrorResponse),
        (status = 403, description = "Permission denied - cannot modify file owned by another user", body = ErrorResponse),
        (status = 500, description = "Database error while updating file information", body = ErrorResponse)
    ),
    security(
        ("cookieAuth" = [], "bearerAuth" = [])
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

    // Log the incoming request body

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

    let now = Utc::now().naive_utc();

    if let Some(ref filename) = body.filename {
        current_file = diesel::update(files_dsl::user_files.filter(files_dsl::id.eq(file_id)))
            .set((
                files_dsl::filename.eq(filename),
                files_dsl::updated_at.eq(now),
            ))
            .get_result(&mut conn)
            .await
            .map_err(|e| ServiceError::Database(e.to_string()))?;
    }

    if let Some(ref status) = body.status {
        current_file = diesel::update(files_dsl::user_files.filter(files_dsl::id.eq(file_id)))
            .set((
                files_dsl::status.eq(String::from(*status)),
                files_dsl::updated_at.eq(now),
            ))
            .get_result(&mut conn)
            .await
            .map_err(|e| ServiceError::Database(e.to_string()))?;
    }

    // Handle metadata update - distinguish between missing field and explicit null
    if let Some(ref value) = body.metadata {
        let metadata_value = if value.is_null() {
            None
        } else {
            Some(value.clone())
        };

        current_file = diesel::update(files_dsl::user_files.filter(files_dsl::id.eq(file_id)))
            .set((
                files_dsl::metadata.eq(metadata_value),
                files_dsl::updated_at.eq(now),
            ))
            .get_result(&mut conn)
            .await
            .map_err(|e| ServiceError::Database(e.to_string()))?;
    }

    let updated_file = current_file;

    Ok(HttpResponse::Ok().json(UserFileResponse::from(updated_file)))
}

/// Permanently delete a user file
///
/// # Errors
/// Returns an error if file not found, permission denied, or storage operations fail.
#[utoipa::path(
    delete,
    path = "/api/files/{file_id}",
    tag = "Files",
    params(
        ("file_id" = Uuid, Path, description = "UUID of the file to permanently delete")
    ),
    responses(
        (status = 204, description = "File permanently deleted from storage and database"),
        (status = 404, description = "File to delete not found or already removed", body = ErrorResponse),
        (status = 401, description = "User authentication needed for file deletion", body = ErrorResponse),
        (status = 403, description = "Delete operation forbidden - file belongs to another user", body = ErrorResponse),
        (status = 500, description = "Storage system error during file deletion", body = ErrorResponse)
    ),
    security(
        ("cookieAuth" = [], "bearerAuth" = [])
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

    let _rows_affected = diesel::delete(files_dsl::user_files.filter(files_dsl::id.eq(file_id)))
        .execute(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    Ok(HttpResponse::NoContent().finish())
}

/// Serve file content with user authentication
///
/// This endpoint is designed to be used to get file content with proper authentication.
/// It verifies user access to the file and returns the file content with proper cache headers.
/// The file content is streamed directly from S3 to minimize memory usage for large files.
///
/// # Errors
/// Returns an error if file not found, access denied, or S3 operations fail.
#[utoipa::path(
    get,
    path = "/api/cdn/files/{file_id}",
    tag = "Files",
    params(
        ("file_id" = Uuid, Path, description = "UUID of the file to stream via CDN")
    ),
    responses(
        (status = 200, description = "Streaming file content with CDN-optimized headers", content_type = "application/octet-stream",
            example = "Binary file content with appropriate Content-Type and Cache-Control headers"),
        (status = 404, description = "CDN file not found or access denied", body = ErrorResponse),
        (status = 401, description = "Authentication required for CDN file access", body = ErrorResponse),
        (status = 403, description = "CDN access forbidden - user cannot access this file", body = ErrorResponse),
        (status = 500, description = "CDN streaming error from storage backend", body = ErrorResponse)
    ),
    security(
        ("cookieAuth" = [], "bearerAuth" = [])
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

    let file: UserFile = files_dsl::user_files
        .filter(files_dsl::id.eq(file_id))
        .filter(files_dsl::user_id.eq(user.id))
        .filter(files_dsl::deleted_at.is_null())
        .first(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::NotFound => {
                actix_web::error::ErrorNotFound("File not found or access denied")
            }
            _ => actix_web::error::ErrorInternalServerError(format!("Database error: {e}")),
        })?;

    let file_stream = s3_service
        .get_object_stream(&file.file_path)
        .await
        .map_err(|e| {
            actix_web::error::ErrorInternalServerError(format!("Failed to fetch file from S3: {e}"))
        })?;

    let actix_stream = file_stream.map(|chunk_result| {
        chunk_result.map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))
    });

    Ok(HttpResponse::Ok()
        .content_type(file.mime_type.as_str())
        .insert_header(("Cache-Control", "public, max-age=86400, immutable"))
        .insert_header(("ETag", format!("\"{}\"", file.file_hash)))
        .insert_header((
            "Content-Disposition",
            format!("inline; filename=\"{}\"", file.original_filename),
        ))
        .streaming(actix_stream))
}
