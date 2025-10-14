use crate::errors::ServiceError;
use crate::schema::{email_verification_tokens, users};
use crate::services::db::DbService;
use actix_session::Session;
use actix_web::{dev::Payload, error::Error, web, FromRequest, HttpRequest};
use chrono::{NaiveDateTime, Utc};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::pin::Pin;
use utoipa::ToSchema;

/// Custom serde module for optional `NaiveDateTime` to RFC3339 string conversion
pub mod optional_datetime_format {
    use chrono::{DateTime, NaiveDateTime, Utc};
    use serde::{Deserialize, Deserializer, Serialize, Serializer};

    /// Serializes an optional `NaiveDateTime` to RFC3339 string format
    ///
    /// # Errors
    /// Returns serialization error if the datetime cannot be serialized
    #[allow(clippy::trivially_copy_pass_by_ref)]
    #[allow(clippy::pattern_type_mismatch)]
    #[allow(clippy::ref_option)]
    pub fn serialize<S>(dt: &Option<NaiveDateTime>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match dt {
            Some(datetime) => {
                let utc_dt: DateTime<Utc> = DateTime::from_naive_utc_and_offset(*datetime, Utc);
                utc_dt.to_rfc3339().serialize(serializer)
            }
            None => serializer.serialize_none(),
        }
    }

    /// Deserializes an RFC3339 string to optional `NaiveDateTime`
    ///
    /// # Errors
    /// Returns deserialization error if the string is not a valid RFC3339 datetime
    pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<NaiveDateTime>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let opt_string: Option<String> = Option::deserialize(deserializer)?;
        match opt_string {
            Some(s) => {
                let dt = DateTime::parse_from_rfc3339(&s)
                    .map_err(serde::de::Error::custom)?
                    .naive_utc();
                Ok(Some(dt))
            }
            None => Ok(None),
        }
    }
}

/// `OAuth` callback query parameters from Google `OAuth` flow
#[derive(Debug, Deserialize, ToSchema)]
#[schema(example = json!({
    "code": "4/P7q7W91a-oMsCeLvIaQm6bTrgtp7",
    "state": "3d6f3e72-7e68-4f53-a8e7-2c5e8f7b3f1a"
}))]
pub struct AuthCallbackQuery {
    /// Authorization code from `OAuth` provider
    #[schema(example = "4/P7q7W91a-oMsCeLvIaQm6bTrgtp7")]
    pub code: String,
    /// State parameter for CSRF protection
    #[schema(example = "3d6f3e72-7e68-4f53-a8e7-2c5e8f7b3f1a")]
    pub state: String,
}

/// User session data for maintaining authentication state
#[derive(Debug, Serialize, Deserialize)]
pub struct UserSession {
    /// The authenticated user
    pub user: User,
    /// Session expiration timestamp
    pub exp: i64,
}

/// Authentication provider types supported by the system
#[derive(Debug, Clone, Copy, Serialize, Deserialize, ToSchema)]
pub enum AuthProvider {
    /// Google `OAuth` authentication
    #[serde(rename = "google")]
    Google,
    /// Email/password authentication
    #[serde(rename = "email")]
    Email,
    /// Both Google and email authentication enabled
    #[serde(rename = "both")]
    Both,
}

impl From<String> for AuthProvider {
    #[inline]
    fn from(s: String) -> Self {
        match s.as_str() {
            "google" => Self::Google,
            "both" => Self::Both,
            _ => Self::Email,
        }
    }
}

impl From<AuthProvider> for String {
    #[inline]
    fn from(provider: AuthProvider) -> Self {
        match provider {
            AuthProvider::Google => "google".to_owned(),
            AuthProvider::Email => "email".to_owned(),
            AuthProvider::Both => "both".to_owned(),
        }
    }
}

/// User entity representing a user in the database
#[derive(Debug, Clone, Serialize, Deserialize, Insertable, Queryable, Selectable, ToSchema)]
#[diesel(table_name = users)]
pub struct User {
    /// Unique user identifier
    pub id: uuid::Uuid,
    /// User's email address
    pub email: String,
    /// Hashed password (None for OAuth-only users)
    pub password_hash: Option<String>,
    /// Timestamp when user was created
    pub created_at: Option<NaiveDateTime>,
    /// Timestamp when user was last updated
    pub updated_at: Option<NaiveDateTime>,
    /// User's display name
    pub display_name: Option<String>,
    /// URL to user's avatar image
    pub avatar_url: Option<String>,
    /// Authentication provider used by the user
    pub auth_provider: String,
    /// Whether the user's email has been verified
    pub email_verified: bool,
    /// Timestamp of user's last login
    pub last_login: Option<NaiveDateTime>,
    /// User's description or bio
    pub description: Option<String>,
    /// URL to user's banner image
    pub banner: Option<String>,
}

/// User information for API responses and internal use
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[schema(example = json!({
    "id": "a7b8c9d0-1234-5678-a123-567890123456",
    "email": "user@example.com",
    "displayName": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "authProvider": "email",
    "emailVerified": true,
    "createdAt": "2023-01-01T00:00:00",
    "lastLogin": "2023-01-02T12:00:00",
    "description": "A brief bio about myself",
    "banner": "https://example.com/banner.jpg"
}))]
pub struct UserInfo {
    /// User's unique identifier
    #[schema(example = "a7b8c9d0-1234-5678-a123-567890123456")]
    pub id: uuid::Uuid,
    /// User's registered email address
    #[schema(example = "user@example.com")]
    pub email: String,
    /// User's display name
    #[schema(example = "John Doe")]
    #[serde(rename = "displayName")]
    pub display_name: Option<String>,
    /// URL to user's avatar image
    #[schema(example = "https://example.com/avatar.jpg")]
    #[serde(rename = "avatarUrl")]
    pub avatar_url: Option<String>,
    /// Authentication provider used by the user
    #[schema(example = "email")]
    #[serde(rename = "authProvider")]
    pub auth_provider: AuthProvider,
    /// Whether the user's email has been verified
    #[schema(example = true)]
    #[serde(rename = "emailVerified")]
    pub email_verified: bool,
    /// User account creation timestamp
    #[schema(example = "2023-01-01T00:00:00Z")]
    #[serde(with = "optional_datetime_format", rename = "createdAt")]
    pub created_at: Option<NaiveDateTime>,
    /// Timestamp of user's last login
    #[schema(example = "2023-01-02T12:00:00Z")]
    #[serde(with = "optional_datetime_format", rename = "lastLogin")]
    pub last_login: Option<NaiveDateTime>,
    /// User's description or bio
    #[schema(example = "A brief bio about myself")]
    pub description: Option<String>,
    /// URL to user's banner image
    #[schema(example = "https://example.com/banner.jpg")]
    pub banner: Option<String>,
}

impl FromRequest for User {
    type Error = Error;
    type Future = Pin<Box<dyn std::future::Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
        let req_clone = req.clone();
        let session_result = Session::from_request(&req_clone, payload).into_inner();

        Box::pin(async move {
            if let Ok(session) = session_result {
                if let Ok(Some(user)) = session.get::<Self>("user") {
                    return Ok(user);
                }
            }

            if let Some(auth_header) = req_clone.headers().get("authorization") {
                if let Ok(auth_str) = auth_header.to_str() {
                    if let Some(token) = auth_str.strip_prefix("Bearer ") {
                        if let Some(db_service) = req_clone.app_data::<web::Data<DbService>>() {
                            match verify_api_key_auth(db_service, token).await {
                                Ok(Some(user)) => return Ok(user),
                                Ok(None) => {
                                    return Err(actix_web::error::ErrorUnauthorized(
                                        "Invalid API key",
                                    ))
                                }
                                Err(_) => {
                                    return Err(actix_web::error::ErrorUnauthorized(
                                        "API key verification failed",
                                    ))
                                }
                            }
                        }
                    }
                }
            }

            Err(actix_web::error::ErrorUnauthorized("Not authenticated"))
        })
    }
}

impl From<User> for UserInfo {
    #[inline]
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            auth_provider: user.auth_provider.into(),
            email_verified: user.email_verified,
            created_at: user.created_at,
            last_login: user.last_login,
            description: user.description,
            banner: user.banner,
        }
    }
}

/// Email verification token for validating user email addresses
#[derive(Debug, Clone, Serialize, Deserialize, Insertable, Queryable, Selectable)]
#[diesel(table_name = email_verification_tokens)]
pub struct EmailVerificationToken {
    /// Unique token identifier
    pub id: uuid::Uuid,
    /// User ID this token belongs to
    pub user_id: uuid::Uuid,
    /// The verification token string
    pub token: String,
    /// When this token expires
    pub expires_at: NaiveDateTime,
    /// When this token was created
    pub created_at: NaiveDateTime,
}

/// Hash an API key for secure storage and verification
fn hash_api_key(key: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(key.as_bytes());
    format!("{:x}", hasher.finalize())
}

/// Verify an API key and return the associated user for authentication
async fn verify_api_key_auth(
    db_service: &DbService,
    api_key: &str,
) -> Result<Option<User>, ServiceError> {
    use crate::schema::{api_keys::dsl as api_keys_dsl, users::dsl as users_dsl};

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let key_hash = hash_api_key(api_key);

    let result: Result<User, diesel::result::Error> = api_keys_dsl::api_keys
        .inner_join(users_dsl::users.on(api_keys_dsl::user_id.eq(users_dsl::id)))
        .filter(api_keys_dsl::key_hash.eq(&key_hash))
        .filter(api_keys_dsl::is_active.eq(true))
        .filter(
            api_keys_dsl::expires_at
                .is_null()
                .or(api_keys_dsl::expires_at.gt(Utc::now().naive_utc())),
        )
        .select(users_dsl::users::all_columns())
        .first(&mut conn)
        .await;

    match result {
        Ok(user) => {
            if let Err(e) = update_api_key_last_used_background(db_service, &key_hash).await {
                eprintln!("Failed to update API key last used timestamp: {e}");
            }
            Ok(Some(user))
        }
        Err(diesel::result::Error::NotFound) => Ok(None),
        Err(e) => Err(ServiceError::Database(e.to_string())),
    }
}

/// Update last used timestamp for an API key (background operation)
async fn update_api_key_last_used_background(
    db_service: &DbService,
    key_hash: &str,
) -> Result<(), ServiceError> {
    use crate::schema::api_keys::dsl as api_keys_dsl;

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

/// Type alias for user information responses returned by the API.
pub type UserInfoResponse = UserInfo;
