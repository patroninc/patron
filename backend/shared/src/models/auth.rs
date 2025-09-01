use crate::schema::users;
use actix_session::Session;
use actix_web::{dev::Payload, error::Error, FromRequest, HttpRequest};
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use std::future::{ready, Ready};
use utoipa::ToSchema;

/// OAuth callback query parameters from Google OAuth flow
#[derive(Debug, Deserialize, ToSchema)]
#[schema(example = json!({
    "code": "4/P7q7W91a-oMsCeLvIaQm6bTrgtp7",
    "state": "3d6f3e72-7e68-4f53-a8e7-2c5e8f7b3f1a"
}))]
pub struct AuthCallbackQuery {
    /// Authorization code from OAuth provider
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

// Removed: OAuth sessions and provider associations are now handled via actix-session

/// Authentication provider types supported by the system
#[derive(Debug, Clone, Copy, Serialize, Deserialize, ToSchema)]
pub enum AuthProvider {
    /// Google OAuth authentication
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
    pub auth_provider: String, // Maps to AuthProvider enum
    /// Whether the user's email has been verified
    pub email_verified: bool,
    /// Timestamp of user's last login
    pub last_login: Option<NaiveDateTime>,
}

/// User information for API responses and internal use
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UserInfo {
    /// Unique user identifier
    pub id: uuid::Uuid,
    /// User's email address
    pub email: String,
    /// User's display name
    pub display_name: Option<String>,
    /// URL to user's avatar image
    pub avatar_url: Option<String>,
    /// Authentication provider used by the user
    pub auth_provider: AuthProvider,
    /// Whether the user's email has been verified
    pub email_verified: bool,
    /// Timestamp when user was created
    pub created_at: Option<NaiveDateTime>,
    /// Timestamp of user's last login
    pub last_login: Option<NaiveDateTime>,
}

impl FromRequest for User {
    type Error = Error;
    type Future = Ready<Result<Self, Error>>;

    #[inline]
    fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
        let session_result = Session::from_request(req, payload).into_inner();
        
        ready(match session_result {
            Ok(session) => {
                match session.get::<Self>("user") {
                    Ok(Some(user)) => Ok(user),
                    Ok(None) => Err(actix_web::error::ErrorUnauthorized("Not authenticated")),
                    Err(_) => Err(actix_web::error::ErrorUnauthorized("Invalid session")),
                }
            },
            Err(_) => Err(actix_web::error::ErrorUnauthorized("Session error")),
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
        }
    }
}

// Removed: Email verification and password reset tokens are now handled via actix-session

/// Simplified user information for public API responses
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UserInfoResponse {
    /// Unique user identifier
    #[schema(example = "d290f1ee-6c54-4b01-90e6-d701748f0851")]
    pub id: uuid::Uuid,
    /// User's email address
    #[schema(example = "user@example.com")]
    pub email: String,
    /// Timestamp when user was created
    #[schema(example = "2023-01-01T00:00:00")]
    pub created_at: Option<NaiveDateTime>,
}

impl From<UserInfo> for UserInfoResponse {
    #[inline]
    fn from(user: UserInfo) -> Self {
        Self {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
        }
    }
}
