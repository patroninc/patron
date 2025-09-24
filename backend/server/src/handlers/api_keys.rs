#![allow(clippy::unused_async)]

use actix_web::{web, HttpResponse, Result};
use chrono::Utc;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use rand::Rng;
use serde::Deserialize;
use sha2::{Digest, Sha256};
use shared::{
    errors::{ErrorResponse, ServiceError},
    models::{
        api_keys::{
            ApiKey, ApiKeyResponse, ApiKeysListResponse, CreateApiKeyRequest, CreateApiKeyResponse,
            UpdateApiKeyRequest,
        },
        auth::User,
    },
};
use utoipa::ToSchema;
use uuid::Uuid;

/// Query parameters for listing API keys with pagination
#[derive(Debug, Clone, Copy, Deserialize, ToSchema, utoipa::IntoParams)]
#[schema(example = json!({
    "offset": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "limit": 50
}))]
pub struct ListApiKeysQuery {
    /// Starting point UUID for paginated API key results
    #[schema(example = "d290f1ee-6c54-4b01-90e6-d701748f0851")]
    pub offset: Option<Uuid>,
    /// Number of API keys to return per page (default: 50, max: 100)
    #[schema(example = 50)]
    pub limit: Option<i64>,
    /// Only show active or inactive API keys
    #[schema(example = true)]
    #[serde(rename = "isActive")]
    pub is_active: Option<bool>,
}

/// Generate a random API key with the given prefix
fn generate_api_key(prefix: &str) -> String {
    let mut rng = rand::rng();
    let charset = b"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let random_part: String = (0_i32..32_i32)
        .map(|_| {
            let idx = rng.random_range(0..62);
            char::from(*charset.get(idx).unwrap_or(&b'0'))
        })
        .collect();
    format!("{prefix}{random_part}")
}

/// Hash an API key for secure storage
fn hash_api_key(key: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(key.as_bytes());
    format!("{:x}", hasher.finalize())
}

/// Create a new API key
///
/// # Errors
/// Returns error if permissions are invalid, database error, or key generation fails
#[utoipa::path(
    post,
    path = "/api/api-keys",
    tag = "API Keys",
    request_body(content = CreateApiKeyRequest, description = "API key creation data"),
    responses(
        (status = 201, description = "API key created successfully", body = CreateApiKeyResponse),
        (status = 400, description = "Invalid API key data", body = ErrorResponse),
        (status = 401, description = "Authentication required to create API keys", body = ErrorResponse),
        (status = 500, description = "Server error during API key creation", body = ErrorResponse)
    ),
    security(("cookieAuth" = [], "bearerAuth" = []))
)]
pub async fn create_api_key(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    body: web::Json<CreateApiKeyRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::api_keys::dsl as api_keys_dsl;

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let key_prefix = "pk_live_";
    let api_key = generate_api_key(key_prefix);
    let key_hash = hash_api_key(&api_key);

    let permissions_vec = body.permissions.clone().unwrap_or_default();
    let permissions_option: Option<Vec<Option<String>>> = if permissions_vec.is_empty() {
        None
    } else {
        Some(permissions_vec.into_iter().map(Some).collect())
    };

    let new_api_key = ApiKey {
        id: Uuid::new_v4(),
        user_id: user.id,
        name: body.name.clone(),
        key_hash: key_hash.clone(),
        key_prefix: key_prefix.to_owned(),
        permissions: permissions_option,
        last_used_at: None,
        expires_at: body.expires_at,
        is_active: true,
        created_at: Some(Utc::now().naive_utc()),
        updated_at: Some(Utc::now().naive_utc()),
    };

    let inserted_api_key: ApiKey = diesel::insert_into(api_keys_dsl::api_keys)
        .values(&new_api_key)
        .get_result(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::DatabaseError(
                diesel::result::DatabaseErrorKind::UniqueViolation,
                _,
            ) => ServiceError::Conflict("API key hash collision (extremely rare)".to_owned()),
            _ => ServiceError::Database(e.to_string()),
        })?;

    let response = CreateApiKeyResponse {
        id: inserted_api_key.id,
        name: inserted_api_key.name,
        key: api_key,
        key_prefix: inserted_api_key.key_prefix,
        permissions: inserted_api_key
            .permissions
            .unwrap_or_default()
            .into_iter()
            .flatten()
            .collect(),
        expires_at: inserted_api_key.expires_at,
        is_active: inserted_api_key.is_active,
        created_at: inserted_api_key.created_at,
    };

    Ok(HttpResponse::Created().json(response))
}

/// List API keys with cursor-based pagination and optional filtering
///
/// # Errors
/// Returns error if API keys database query fails or connection issues occur
#[utoipa::path(
    get,
    path = "/api/api-keys",
    tag = "API Keys",
    params(ListApiKeysQuery),
    responses(
        (status = 200, description = "API keys list retrieved", body = ApiKeysListResponse),
        (status = 401, description = "Authentication required to list API keys", body = ErrorResponse),
        (status = 500, description = "Server error during API keys listing", body = ErrorResponse)
    ),
    security(("cookieAuth" = [], "bearerAuth" = []))
)]
pub async fn list_api_keys(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    query: web::Query<ListApiKeysQuery>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::api_keys::dsl as api_keys_dsl;

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let limit = query.limit.unwrap_or(50).min(100);

    let mut api_keys_query = api_keys_dsl::api_keys
        .filter(api_keys_dsl::user_id.eq(user.id))
        .order(api_keys_dsl::created_at.desc())
        .limit(limit)
        .into_boxed();

    if let Some(is_active) = query.is_active {
        api_keys_query = api_keys_query.filter(api_keys_dsl::is_active.eq(is_active));
    }

    if let Some(offset_id) = query.offset {
        let offset_created_at: chrono::NaiveDateTime = api_keys_dsl::api_keys
            .filter(api_keys_dsl::id.eq(offset_id))
            .select(api_keys_dsl::created_at)
            .first::<Option<chrono::NaiveDateTime>>(&mut conn)
            .await
            .map_err(|e| ServiceError::Database(e.to_string()))?
            .unwrap_or_else(|| Utc::now().naive_utc());

        api_keys_query = api_keys_query.filter(api_keys_dsl::created_at.lt(offset_created_at));
    }

    let api_keys_list: Vec<ApiKey> = api_keys_query
        .load(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    let api_keys_responses: Vec<ApiKeyResponse> = api_keys_list
        .into_iter()
        .map(ApiKeyResponse::from)
        .collect();
    let response = ApiKeysListResponse::from(api_keys_responses);

    Ok(HttpResponse::Ok().json(response))
}

/// Get a specific API key by ID
///
/// # Errors
/// Returns error if API key not found, access denied, or database connection error
#[utoipa::path(
    get,
    path = "/api/api-keys/{api_key_id}",
    tag = "API Keys",
    params(("api_key_id" = Uuid, Path, description = "UUID of the API key to retrieve")),
    responses(
        (status = 200, description = "API key retrieved", body = ApiKeyResponse),
        (status = 404, description = "API key not found or access denied", body = ErrorResponse),
        (status = 401, description = "Authentication required to view API keys", body = ErrorResponse),
        (status = 403, description = "Access denied - API key belongs to different user", body = ErrorResponse),
        (status = 500, description = "Server error during API key retrieval", body = ErrorResponse)
    ),
    security(("cookieAuth" = [], "bearerAuth" = []))
)]
pub async fn get_api_key(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::api_keys::dsl as api_keys_dsl;

    let api_key_id = path.into_inner();
    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let api_key: ApiKey = api_keys_dsl::api_keys
        .filter(api_keys_dsl::id.eq(api_key_id))
        .filter(api_keys_dsl::user_id.eq(user.id))
        .first(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::NotFound => {
                ServiceError::NotFound("API key not found".to_owned())
            }
            _ => ServiceError::Database(e.to_string()),
        })?;

    Ok(HttpResponse::Ok().json(ApiKeyResponse::from(api_key)))
}

/// Update an API key
///
/// # Errors
/// Returns error if API key not found, access denied, or database update error
#[utoipa::path(
    put,
    path = "/api/api-keys/{api_key_id}",
    tag = "API Keys",
    params(("api_key_id" = Uuid, Path, description = "UUID of the API key to update")),
    request_body(content = UpdateApiKeyRequest, description = "Updated API key data"),
    responses(
        (status = 200, description = "API key updated successfully", body = ApiKeyResponse),
        (status = 404, description = "API key not found for update", body = ErrorResponse),
        (status = 401, description = "Authentication required to update API keys", body = ErrorResponse),
        (status = 403, description = "Access denied - cannot update API key owned by different user", body = ErrorResponse),
        (status = 500, description = "Server error during API key update", body = ErrorResponse)
    ),
    security(("cookieAuth" = [], "bearerAuth" = []))
)]
pub async fn update_api_key(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    path: web::Path<Uuid>,
    body: web::Json<UpdateApiKeyRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::api_keys::dsl as api_keys_dsl;

    let api_key_id = path.into_inner();
    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let _existing_api_key: ApiKey = api_keys_dsl::api_keys
        .filter(api_keys_dsl::id.eq(api_key_id))
        .filter(api_keys_dsl::user_id.eq(user.id))
        .first(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::NotFound => {
                ServiceError::NotFound("API key not found".to_owned())
            }
            _ => ServiceError::Database(e.to_string()),
        })?;

    let current_time = Utc::now().naive_utc();

    let permissions_update = body.permissions.as_ref().map(|perms| {
        if perms.is_empty() {
            None
        } else {
            Some(
                perms
                    .iter()
                    .map(|p| Some(p.clone()))
                    .collect::<Vec<Option<String>>>(),
            )
        }
    });

    let updated_api_key: ApiKey =
        diesel::update(api_keys_dsl::api_keys.filter(api_keys_dsl::id.eq(api_key_id)))
            .set((
                body.name.as_ref().map(|v| api_keys_dsl::name.eq(v)),
                permissions_update.map(|v| api_keys_dsl::permissions.eq(v)),
                body.is_active.map(|v| api_keys_dsl::is_active.eq(v)),
                body.expires_at.map(|v| api_keys_dsl::expires_at.eq(v)),
                api_keys_dsl::updated_at.eq(current_time),
            ))
            .get_result(&mut conn)
            .await
            .map_err(|e| ServiceError::Database(e.to_string()))?;

    Ok(HttpResponse::Ok().json(ApiKeyResponse::from(updated_api_key)))
}

/// Delete an API key (hard delete for security)
///
/// # Errors
/// Returns error if API key not found, access denied, or database deletion error
#[utoipa::path(
    delete,
    path = "/api/api-keys/{api_key_id}",
    tag = "API Keys",
    params(("api_key_id" = Uuid, Path, description = "UUID of the API key to delete")),
    responses(
        (status = 204, description = "API key deleted successfully"),
        (status = 404, description = "API key not found for deletion", body = ErrorResponse),
        (status = 401, description = "Authentication required to delete API keys", body = ErrorResponse),
        (status = 403, description = "Access denied - cannot delete API key owned by different user", body = ErrorResponse),
        (status = 500, description = "Server error during API key deletion", body = ErrorResponse)
    ),
    security(("cookieAuth" = [], "bearerAuth" = []))
)]
pub async fn delete_api_key(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::api_keys::dsl as api_keys_dsl;

    let api_key_id = path.into_inner();
    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let _existing_api_key: ApiKey = api_keys_dsl::api_keys
        .filter(api_keys_dsl::id.eq(api_key_id))
        .filter(api_keys_dsl::user_id.eq(user.id))
        .first(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::NotFound => {
                ServiceError::NotFound("API key not found".to_owned())
            }
            _ => ServiceError::Database(e.to_string()),
        })?;

    let _ = diesel::delete(api_keys_dsl::api_keys.filter(api_keys_dsl::id.eq(api_key_id)))
        .execute(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    Ok(HttpResponse::NoContent().finish())
}

/// Update last used timestamp for an API key (internal use)
///
/// # Errors
/// Returns error if database connection fails or update query execution error occurs
pub async fn update_api_key_last_used(
    db_service: &shared::services::db::DbService,
    key_hash: &str,
) -> Result<(), ServiceError> {
    use shared::schema::api_keys::dsl as api_keys_dsl;

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let current_time = Utc::now().naive_utc();

    let _ = diesel::update(
        api_keys_dsl::api_keys
            .filter(api_keys_dsl::key_hash.eq(key_hash))
            .filter(api_keys_dsl::is_active.eq(true)),
    )
    .set((
        api_keys_dsl::last_used_at.eq(current_time),
        api_keys_dsl::updated_at.eq(current_time),
    ))
    .execute(&mut conn)
    .await
    .map_err(|e| ServiceError::Database(e.to_string()))?;

    Ok(())
}

/// Verify an API key and return the associated user (for authentication middleware)
///
/// # Errors
/// Returns error if database connection fails or query execution error occurs
pub async fn verify_api_key(
    db_service: &shared::services::db::DbService,
    api_key: &str,
) -> Result<Option<User>, ServiceError> {
    use shared::schema::{api_keys::dsl as api_keys_dsl, users::dsl as users_dsl};

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let key_hash = hash_api_key(api_key);

    let result: Result<(ApiKey, User), diesel::result::Error> = api_keys_dsl::api_keys
        .inner_join(users_dsl::users.on(api_keys_dsl::user_id.eq(users_dsl::id)))
        .filter(api_keys_dsl::key_hash.eq(&key_hash))
        .filter(api_keys_dsl::is_active.eq(true))
        .filter(
            api_keys_dsl::expires_at
                .is_null()
                .or(api_keys_dsl::expires_at.gt(Utc::now().naive_utc())),
        )
        .select((
            api_keys_dsl::api_keys::all_columns(),
            users_dsl::users::all_columns(),
        ))
        .first(&mut conn)
        .await;

    match result {
        Ok((_api_key, user)) => {
            if let Err(e) = update_api_key_last_used(db_service, &key_hash).await {
                eprintln!("Failed to update API key last used timestamp: {e}");
            }
            Ok(Some(user))
        }
        Err(diesel::result::Error::NotFound) => Ok(None),
        Err(e) => Err(ServiceError::Database(e.to_string())),
    }
}
