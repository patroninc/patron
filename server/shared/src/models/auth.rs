use crate::schema::users;
use actix_session::Session;
use actix_web::{dev::Payload, error::Error, FromRequest, HttpRequest};
use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use std::future::{ready, Ready};
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
#[schema(example = json!({
    "code": "4/P7q7W91a-oMsCeLvIaQm6bTrgtp7",
    "state": "3d6f3e72-7e68-4f53-a8e7-2c5e8f7b3f1a"
}))]
pub struct AuthCallbackQuery {
    pub code: String,
    pub state: String,
}

#[derive(Serialize, Deserialize)]
pub struct UserSession {
    pub user: User,
    pub exp: i64,
}

// Removed: OAuth sessions and provider associations are now handled via actix-session

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub enum AuthProvider {
    #[serde(rename = "google")]
    Google,
    #[serde(rename = "email")]
    Email,
    #[serde(rename = "both")]
    Both,
}

impl From<String> for AuthProvider {
    fn from(s: String) -> Self {
        match s.as_str() {
            "google" => AuthProvider::Google,
            "email" => AuthProvider::Email,
            "both" => AuthProvider::Both,
            _ => AuthProvider::Email,
        }
    }
}

impl From<AuthProvider> for String {
    fn from(provider: AuthProvider) -> Self {
        match provider {
            AuthProvider::Google => "google".to_string(),
            AuthProvider::Email => "email".to_string(),
            AuthProvider::Both => "both".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, Queryable, Selectable, ToSchema)]
#[diesel(table_name = users)]
pub struct User {
    pub id: uuid::Uuid,
    pub email: String,
    pub password_hash: Option<String>,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub auth_provider: String, // Maps to AuthProvider enum
    pub email_verified: bool,
    pub last_login: Option<NaiveDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UserInfo {
    pub id: uuid::Uuid,
    pub email: String,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub auth_provider: AuthProvider,
    pub email_verified: bool,
    pub created_at: Option<NaiveDateTime>,
    pub last_login: Option<NaiveDateTime>,
}

impl FromRequest for User {
    type Error = Error;
    type Future = Ready<Result<User, Error>>;

    #[inline]
    fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
        let session_result = Session::from_request(req, payload).into_inner();
        
        ready(match session_result {
            Ok(session) => {
                match session.get::<User>("user") {
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
    fn from(user: User) -> Self {
        UserInfo {
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

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct UserInfoResponse {
    pub id: uuid::Uuid,
    pub email: String,
    pub created_at: Option<chrono::NaiveDateTime>,
}

impl From<UserInfo> for UserInfoResponse {
    fn from(user: UserInfo) -> Self {
        UserInfoResponse {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
        }
    }
}
