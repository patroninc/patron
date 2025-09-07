#![allow(clippy::unused_async)]

use actix_session::Session;
use actix_web::{web, HttpResponse, Result};
use chrono::Utc;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::{Deserialize, Serialize};
use shared::{
    errors::{ErrorResponse, ServiceError},
    models::auth::{AuthCallbackQuery, EmailVerificationToken, User, UserInfo, UserInfoResponse},
    services::{auth::GoogleOAuthService, email::EmailService},
};
use std::collections::HashMap;
use utoipa::ToSchema;
use uuid::Uuid;

// Simple password hashing using Argon2
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use md5;
use redis::{aio::ConnectionManager, AsyncCommands};

/// Request body for user registration.
#[derive(Debug, Deserialize, ToSchema)]
#[schema(example = json!({
    "email": "user@example.com",
    "password": "password123"
}))]
pub struct RegisterRequest {
    /// Email address for new user registration
    pub email: String,
    /// User's password (minimum 8 characters)
    pub password: String,
    /// Optional display name for the user
    pub display_name: Option<String>,
}

/// Response for successful user registration
#[derive(Serialize, ToSchema, Debug)]
#[schema(example = json!({
    "message": "Registration successful. Please check your email for verification.",
    "user_id": "d290f1ee-6c54-4b01-90e6-d701748f0851"
}))]
pub struct RegisterResponse {
    /// Registration confirmation message
    pub message: String,
    /// Unique identifier of the registered user
    pub user_id: Uuid,
}

/// Request body for user login
#[derive(Deserialize, ToSchema, Debug)]
#[schema(example = json!({
    "email": "user@example.com",
    "password": "password123"
}))]
pub struct LoginRequest {
    /// Email address for login authentication
    pub email: String,
    /// User's password
    pub password: String,
}

/// Response for successful user login
#[derive(Serialize, ToSchema, Debug)]
#[schema(example = json!({
    "message": "Login successful",
    "user": {
        "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "email": "user@example.com",
        "display_name": "John Doe",
        "auth_provider": "email",
        "email_verified": true
    }
}))]
pub struct LoginResponse {
    /// Login success message
    pub message: String,
    /// User information
    pub user: UserInfo,
}

/// Response for successful logout
#[derive(Serialize, ToSchema, Debug)]
#[schema(example = json!({
    "message": "Logged out successfully"
}))]
pub struct LogoutResponse {
    /// Logout confirmation message
    pub message: String,
}

/// Request body for checking if email exists
#[derive(Deserialize, ToSchema, Debug)]
#[schema(example = json!({
    "email": "user@example.com"
}))]
pub struct CheckEmailRequest {
    /// Email address to check
    #[schema(example = "user@example.com")]
    pub email: String,
}

/// Request body for password reset
#[derive(Deserialize, ToSchema, Debug)]
#[schema(example = json!({
    "email": "user@example.com"
}))]
pub struct ForgotPasswordRequest {
    /// Email address to send password reset link to
    #[schema(example = "user@example.com")]
    pub email: String,
}

/// Response for password reset request
#[derive(Serialize, ToSchema, Debug)]
#[schema(example = json!({
    "message": "If the email exists in our system, a password reset link has been sent."
}))]
pub struct ForgotPasswordResponse {
    /// Password reset request status message
    pub message: String,
}

/// Request body for password reset confirmation
#[derive(Deserialize, ToSchema, Debug)]
#[schema(example = json!({
    "token": "550e8400-e29b-41d4-a716-446655440000",
    "new_password": "newpassword123"
}))]
pub struct ResetPasswordRequest {
    /// Password reset token
    pub token: String,
    /// User ID associated with the reset token
    pub user_id: Uuid,
    /// New password (minimum 8 characters)
    pub new_password: String,
}

/// Response for successful password reset
#[derive(Serialize, ToSchema, Debug)]
#[schema(example = json!({
    "message": "Password has been reset successfully"
}))]
pub struct ResetPasswordResponse {
    /// Password reset confirmation message
    pub message: String,
}

/// Helper function to validate password (simple 8+ character check)
const fn validate_password(password: &str) -> Result<(), &'static str> {
    if password.len() < 8 {
        return Err("Password must be at least 8 characters long");
    }
    Ok(())
}

/// Helper function to hash password using Argon2
fn hash_password(password: &str) -> Result<String, ServiceError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| ServiceError::Unknown(format!("Failed to hash password: {e}")))?;
    Ok(password_hash.to_string())
}

/// Helper function to verify password using Argon2
fn verify_password(password: &str, hash: &str) -> Result<bool, ServiceError> {
    let parsed_hash = PasswordHash::new(hash)
        .map_err(|e| ServiceError::Unknown(format!("Invalid password hash: {e}")))?;
    let argon2 = Argon2::default();
    match argon2.verify_password(password.as_bytes(), &parsed_hash) {
        Ok(()) => Ok(true),
        Err(argon2::password_hash::Error::Password) => Ok(false),
        Err(e) => Err(ServiceError::Unknown(format!(
            "Password verification error: {e}"
        ))),
    }
}

/// Helper function to create a JSON error response
fn json_error(message: &str) -> HttpResponse {
    HttpResponse::BadRequest().json(ErrorResponse {
        error: message.to_owned(),
        code: None,
    })
}

/// Helper function to generate Gravatar URL from email
fn generate_gravatar_url(email: &str) -> String {
    let email_hash = format!("{:x}", md5::compute(email.trim().to_lowercase().as_bytes()));
    format!("https://www.gravatar.com/avatar/{email_hash}?d=identicon&s=200")
}

/// Helper function to verify `OAuth` state
fn verify_oauth_state(session: &Session, received_state: &str) -> Result<(), HttpResponse> {
    let stored_state: Option<String> = session
        .get("oauth_state")
        .map_err(|e| json_error(&format!("Failed to get OAuth state from session: {e}")))
        .map_err(|_session_err| json_error("Session error"))?;

    let Some(stored_oauth_state) = stored_state else {
        return Err(json_error("Invalid OAuth state"));
    };

    if stored_oauth_state != received_state {
        return Err(json_error("OAuth state mismatch"));
    }

    Ok(())
}

/// Helper function to update existing user with Google info
async fn update_existing_user_with_google_info(
    mut existing_user: User,
    google_user_info: &shared::services::auth::GoogleUserInfo,
    conn: &mut diesel_async::AsyncPgConnection,
) -> Result<User, ServiceError> {
    use shared::schema::users::dsl as users_dsl;

    if existing_user.display_name.is_none() && !google_user_info.name.is_empty() {
        existing_user.display_name = Some(google_user_info.name.clone());
    }
    if existing_user.avatar_url.is_none() {
        if google_user_info.picture.is_empty() {
            existing_user.avatar_url = Some(generate_gravatar_url(&existing_user.email));
        } else {
            existing_user.avatar_url = Some(google_user_info.picture.clone());
        }
    }

    let new_auth_provider = match existing_user.auth_provider.as_str() {
        "email" => "both".to_owned(),
        _ => existing_user.auth_provider.clone(),
    };

    let _ = diesel::update(users_dsl::users.filter(users_dsl::id.eq(&existing_user.id)))
        .set((
            users_dsl::display_name.eq(&existing_user.display_name),
            users_dsl::avatar_url.eq(&existing_user.avatar_url),
            users_dsl::auth_provider.eq(&new_auth_provider),
            users_dsl::email_verified.eq(true),
            users_dsl::last_login.eq(Some(Utc::now().naive_utc())),
        ))
        .execute(conn)
        .await
        .map_err(ServiceError::from)?;

    existing_user.auth_provider = new_auth_provider;
    existing_user.email_verified = true;
    existing_user.last_login = Some(Utc::now().naive_utc());

    Ok(existing_user)
}

/// Helper function to create new user from Google info
async fn create_new_user_from_google_info(
    google_user_info: &shared::services::auth::GoogleUserInfo,
    conn: &mut diesel_async::AsyncPgConnection,
) -> Result<User, ServiceError> {
    use shared::schema::users::dsl as users_dsl;

    let new_user = User {
        id: Uuid::new_v4(),
        email: google_user_info.email.clone(),
        display_name: Some(google_user_info.name.clone()),
        avatar_url: Some(if google_user_info.picture.is_empty() {
            generate_gravatar_url(&google_user_info.email)
        } else {
            google_user_info.picture.clone()
        }),
        auth_provider: "google".to_owned(),
        email_verified: true,
        password_hash: None,
        created_at: None,
        updated_at: None,
        last_login: Some(Utc::now().naive_utc()),
    };

    let _ = diesel::insert_into(users_dsl::users)
        .values(&new_user)
        .execute(conn)
        .await
        .map_err(ServiceError::from)?;

    Ok(new_user)
}

/// Google `OAuth` redirect
///
/// # Errors
/// Returns an error if session operations fail or `OAuth` service configuration is invalid.
#[utoipa::path(
    get,
    path = "/auth/google",
    context_path = "/api",
    tag = "Auth",
    responses(
        (status = 302, description = "Redirect to Google OAuth consent screen"),
        (status = 500, description = "OAuth initialization failed or session storage error", body = ErrorResponse,
            example = json!({
                "error": "Failed to initialize OAuth session",
                "code": "OAUTH_SESSION_ERROR"
            })
        ),
    )
)]
pub async fn google_auth_redirect(
    session: Session,
    google_oauth_service: web::Data<GoogleOAuthService>,
) -> Result<HttpResponse, actix_web::Error> {
    let state = Uuid::new_v4().to_string();
    let auth_url = google_oauth_service.get_authorization_url(Some(&state));

    session
        .insert("oauth_state", &state)
        .map_err(|e| ServiceError::Unknown(format!("Failed to store OAuth state: {e}")))?;
    session
        .insert("oauth_redirect_uri", &google_oauth_service.frontend_url)
        .map_err(|e| ServiceError::Unknown(format!("Failed to store redirect URI: {e}")))?;

    Ok(HttpResponse::Found()
        .append_header(("Location", auth_url))
        .finish())
}

/// Google `OAuth` callback
///
/// # Errors
/// Returns an error if `OAuth` state verification fails, token exchange fails, or database operations fail.
#[utoipa::path(
    get,
    path = "/auth/google/callback",
    context_path = "/api",
    tag = "Auth",
    params(
        ("code" = String, Query, description = "Authorization code from Google"),
        ("state" = String, Query, description = "State parameter for CSRF protection")
    ),
    responses(
        (status = 302, description = "Redirect to frontend application"),
        (status = 400, description = "Invalid authorization code or state", body = ErrorResponse,
            example = json!({
                "error": "Invalid authorization code",
                "code": "OAUTH_INVALID_CODE"
            })
        ),
        (status = 500, description = "OAuth service error or database connection failed", body = ErrorResponse,
            example = json!({
                "error": "OAuth provider connection failed",
                "code": "OAUTH_PROVIDER_ERROR"
            })
        ),
    )
)]
pub async fn google_auth_callback(
    session: Session,
    db_service: web::Data<shared::services::db::DbService>,
    google_oauth_service: web::Data<GoogleOAuthService>,
    query: web::Query<AuthCallbackQuery>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::users::dsl as users_dsl;

    if let Err(response) = verify_oauth_state(&session, &query.state) {
        return Ok(response);
    }

    let redirect_uri: String = session
        .get("oauth_redirect_uri")
        .map_err(|e| {
            ServiceError::Unknown(format!("Failed to get redirect URI from session: {e}"))
        })?
        .unwrap_or_else(|| google_oauth_service.frontend_url.clone());

    let token_response = google_oauth_service
        .exchange_code_for_token(&query.code)
        .await?;
    let google_user_info = google_oauth_service
        .get_user_info(&token_response.access_token)
        .await?;

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let user = match users_dsl::users
        .filter(users_dsl::email.eq(&google_user_info.email))
        .first::<User>(&mut conn)
        .await
    {
        Ok(existing_user) => {
            update_existing_user_with_google_info(existing_user, &google_user_info, &mut conn)
                .await?
        }
        Err(diesel::result::Error::NotFound) => {
            create_new_user_from_google_info(&google_user_info, &mut conn).await?
        }
        Err(e) => return Err(ServiceError::from(e).into()),
    };

    session
        .insert("user", user)
        .map_err(|e| ServiceError::Unknown(format!("Failed to set session: {e}")))?;

    let _ = session.remove("oauth_state");
    let _ = session.remove("oauth_redirect_uri");

    Ok(HttpResponse::Found()
        .append_header(("Location", format!("{redirect_uri}/dashboard")))
        .finish())
}

/// User registration
///
/// # Errors
/// Returns an error if input validation fails, user already exists, or database operations fail.
#[utoipa::path(
    post,
    path = "/auth/register",
    context_path = "/api",
    tag = "Auth",
    request_body(content = RegisterRequest, description = "User registration data including email and password"),
    responses(
        (status = 200, description = "Registration successful", body = RegisterResponse),
        (status = 400, description = "Invalid input or email already exists", body = ErrorResponse,
            example = json!({
                "error": "Email address already registered",
                "code": "AUTH_EMAIL_EXISTS"
            })
        ),
        (status = 500, description = "Registration service error or email delivery failed", body = ErrorResponse,
            example = json!({
                "error": "Database connection failed",
                "code": "DATABASE_ERROR"
            })
        ),
    )
)]
pub async fn register(
    _session: Session,
    email_service: web::Data<EmailService>,
    db_service: web::Data<shared::services::db::DbService>,
    google_oauth_service: web::Data<GoogleOAuthService>,
    body: web::Json<RegisterRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::email_verification_tokens::dsl as tokens_dsl;
    use shared::schema::users::dsl as users_dsl;

    if body.email.is_empty() {
        return Ok(json_error("Email is required"));
    }
    if let Err(msg) = validate_password(&body.password) {
        return Ok(json_error(msg));
    }

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    if users_dsl::users
        .filter(users_dsl::email.eq(&body.email))
        .first::<User>(&mut conn)
        .await
        .is_ok()
    {
        return Ok(json_error("Email address already registered"));
    }

    let password_hash = hash_password(&body.password)?;

    let avatar_url = generate_gravatar_url(&body.email);

    let new_user = User {
        id: Uuid::new_v4(),
        email: body.email.clone(),
        display_name: body.display_name.clone(),
        avatar_url: Some(avatar_url),
        auth_provider: "email".to_owned(),
        email_verified: false,
        password_hash: Some(password_hash),
        created_at: None,
        updated_at: None,
        last_login: None,
    };

    let _ = diesel::insert_into(users_dsl::users)
        .values(&new_user)
        .execute(&mut conn)
        .await
        .map_err(ServiceError::from)?;

    let verification_token = Uuid::new_v4().to_string();
    let expires_at = Utc::now()
        .naive_utc()
        .checked_add_signed(chrono::Duration::hours(24))
        .ok_or_else(|| ServiceError::Unknown("Failed to compute expiration time".to_owned()))?;

    let new_verification_token = EmailVerificationToken {
        id: Uuid::new_v4(),
        user_id: new_user.id,
        token: verification_token.clone(),
        expires_at,
        created_at: Utc::now().naive_utc(),
    };

    let _ = diesel::insert_into(tokens_dsl::email_verification_tokens)
        .values(&new_verification_token)
        .execute(&mut conn)
        .await
        .map_err(ServiceError::from)?;

    let verification_link = format!(
        "{}/api/auth/verify-email?token={}",
        google_oauth_service.backend_url, verification_token
    );

    let email_body = format!(
        "<h1>Welcome to Patron!</h1>
        <p>Please click the link below to verify your email address:</p>
        <p><a href=\"{verification_link}\">Verify Email</a></p>
        <p>This link will expire in 24 hours.</p>"
    );

    email_service
        .send_html_email(shared::services::email::HtmlEmailContent {
            to: &body.email,
            subject: "Please verify your email address",
            html_body: &email_body,
            text_body: None,
            from: None,
        })
        .await?;

    Ok(HttpResponse::Ok().json(RegisterResponse {
        message: "Registration successful. Please check your email for verification.".to_owned(),
        user_id: new_user.id,
    }))
}

/// Email verification
///
/// # Errors
/// Returns an error if token is invalid, expired, or database operations fail.
#[utoipa::path(
    get,
    path = "/auth/verify-email",
    context_path = "/api",
    tag = "Auth",
    params(
        ("token" = String, Query, description = "Email verification token")
    ),
    responses(
        (status = 302, description = "Redirect to frontend after verification"),
        (status = 400, description = "Invalid or expired token", body = ErrorResponse,
            example = json!({
                "error": "Invalid or expired verification token",
                "code": "AUTH_INVALID_VERIFICATION_TOKEN"
            })
        ),
        (status = 500, description = "Email verification service error or database failure", body = ErrorResponse,
            example = json!({
                "error": "Email verification service unavailable",
                "code": "VERIFICATION_SERVICE_ERROR"
            })
        ),
    )
)]
#[allow(clippy::implicit_hasher)]
pub async fn verify_email(
    session: Session,
    db_service: web::Data<shared::services::db::DbService>,
    google_oauth_service: web::Data<GoogleOAuthService>,
    query: web::Query<HashMap<String, String>>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::email_verification_tokens::dsl as tokens_dsl;
    use shared::schema::users::dsl as users_dsl;

    let Some(token) = query.get("token") else {
        return Ok(json_error("Token is required"));
    };

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let verification_token: EmailVerificationToken = match tokens_dsl::email_verification_tokens
        .filter(tokens_dsl::token.eq(token))
        .first(&mut conn)
        .await
    {
        Ok(token_record) => token_record,
        Err(diesel::result::Error::NotFound) => {
            return Ok(json_error("Invalid or expired verification token"));
        }
        Err(e) => return Err(ServiceError::from(e).into()),
    };

    if verification_token.expires_at < Utc::now().naive_utc() {
        if let Err(e) = diesel::delete(
            tokens_dsl::email_verification_tokens.filter(tokens_dsl::id.eq(&verification_token.id)),
        )
        .execute(&mut conn)
        .await
        {
            tracing::warn!("Failed to clean up expired verification token: {}", e);
        }
        return Ok(json_error("Invalid or expired verification token"));
    }

    let mut user: User = users_dsl::users
        .filter(users_dsl::id.eq(&verification_token.user_id))
        .first(&mut conn)
        .await
        .map_err(ServiceError::from)?;

    if user.email_verified {
        let redirect_url = format!(
            "{}/login?verified=already",
            google_oauth_service.frontend_url
        );
        return Ok(HttpResponse::Found()
            .append_header(("Location", redirect_url))
            .finish());
    }

    let _ = diesel::update(users_dsl::users.filter(users_dsl::id.eq(&user.id)))
        .set(users_dsl::email_verified.eq(true))
        .execute(&mut conn)
        .await
        .map_err(ServiceError::from)?;

    user.email_verified = true;

    session
        .insert("user", user)
        .map_err(|e| ServiceError::Unknown(format!("Failed to set session: {e}")))?;

    if let Err(e) = diesel::delete(
        tokens_dsl::email_verification_tokens.filter(tokens_dsl::id.eq(&verification_token.id)),
    )
    .execute(&mut conn)
    .await
    {
        tracing::warn!("Failed to clean up verification token: {}", e);
    }

    let redirect_url = format!(
        "{}/dashboard?verified=success",
        google_oauth_service.frontend_url
    );
    Ok(HttpResponse::Found()
        .append_header(("Location", redirect_url))
        .finish())
}

/// User login
///
/// # Errors
/// Returns an error if credentials are invalid, email is not verified, or database operations fail.
#[utoipa::path(
    post,
    path = "/auth/login",
    context_path = "/api",
    tag = "Auth",
    request_body(content = LoginRequest, description = "User login credentials including email and password"),
    responses(
        (status = 200, description = "Login successful", body = LoginResponse),
        (status = 400, description = "Invalid credentials or email not verified", body = ErrorResponse,
            example = json!({
                "error": "Invalid email or password",
                "code": "AUTH_INVALID_CREDENTIALS"
            })
        ),
        (status = 500, description = "Login service error or database connection failed", body = ErrorResponse,
            example = json!({
                "error": "Authentication service unavailable",
                "code": "AUTH_SERVICE_ERROR"
            })
        ),
    )
)]
pub async fn login(
    session: Session,
    db_service: web::Data<shared::services::db::DbService>,
    body: web::Json<LoginRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::users::dsl as users_dsl;

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let mut user: User = match users_dsl::users
        .filter(users_dsl::email.eq(&body.email))
        .first(&mut conn)
        .await
    {
        Ok(user) => user,
        Err(diesel::result::Error::NotFound) => {
            return Ok(json_error("Invalid email or password"));
        }
        Err(e) => return Err(ServiceError::from(e).into()),
    };

    let Some(ref password_hash) = user.password_hash else {
        return Ok(json_error(
            "This account uses Google sign-in. Please use the Google login button.",
        ));
    };

    if !verify_password(&body.password, password_hash)? {
        return Ok(json_error("Invalid email or password"));
    }

    // TODO! Send a fresh verification email if not verified

    let _ = diesel::update(users_dsl::users.filter(users_dsl::id.eq(&user.id)))
        .set(users_dsl::last_login.eq(Some(Utc::now().naive_utc())))
        .execute(&mut conn)
        .await
        .map_err(ServiceError::from)?;

    user.last_login = Some(Utc::now().naive_utc());

    session
        .insert("user", user.clone())
        .map_err(|e| ServiceError::Unknown(format!("Failed to set session: {e}")))?;

    Ok(HttpResponse::Ok().json(LoginResponse {
        message: "Login successful".to_owned(),
        user: user.into(),
    }))
}

/// Get current user info
///
/// # Errors
/// Returns an error if user is not authenticated or serialization fails.
#[utoipa::path(
    get,
    path = "/auth/me",
    context_path = "/api",
    tag = "Auth",
    security(
        ("cookieAuth" = [])
    ),
    responses(
        (status = 200, description = "Current user information", body = UserInfoResponse,
            example = json!({
                "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
                "email": "user@example.com",
                "created_at": "2023-01-01T00:00:00"
            })
        ),
        (status = 401, description = "Not authenticated", body = ErrorResponse,
            example = json!({
                "error": "Not authenticated",
                "code": "AUTH_REQUIRED"
            })
        ),
    )
)]
pub async fn get_me(user: User) -> Result<HttpResponse, actix_web::Error> {
    Ok(HttpResponse::Ok().json(UserInfoResponse::from(UserInfo::from(user))))
}

/// Logout
///
/// # Errors
/// Returns an error if session operations fail.
#[utoipa::path(
    get,
    path = "/auth/logout",
    context_path = "/api",
    tag = "Auth",
    security(
        ("cookieAuth" = [])
    ),
    responses(
        (status = 200, description = "Successfully logged out", body = LogoutResponse),
    )
)]
pub async fn logout(session: Session) -> Result<HttpResponse, actix_web::Error> {
    session.purge();
    Ok(HttpResponse::Ok().json(LogoutResponse {
        message: "Logged out successfully".to_owned(),
    }))
}

/// Forgot password
///
/// # Errors
/// Returns an error if database operations fail or email service fails.
#[utoipa::path(
    post,
    path = "/auth/forgot-password",
    context_path = "/api",
    tag = "Auth",
    request_body(content = ForgotPasswordRequest, description = "Email address for password reset request"),
    responses(
        (status = 200, description = "Password reset email sent", body = ForgotPasswordResponse),
        (status = 500, description = "Password reset service error or email delivery failed", body = ErrorResponse,
            example = json!({
                "error": "Email service unavailable",
                "code": "EMAIL_SERVICE_ERROR"
            })
        ),
    )
)]
pub async fn forgot_password(
    redis_manager: web::Data<ConnectionManager>,
    email_service: web::Data<EmailService>,
    db_service: web::Data<shared::services::db::DbService>,
    google_oauth_service: web::Data<GoogleOAuthService>,
    body: web::Json<ForgotPasswordRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::users::dsl as users_dsl;

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let response = ForgotPasswordResponse {
        message: "If the email exists in our system, a password reset link has been sent."
            .to_owned(),
    };

    let user: User = match users_dsl::users
        .filter(users_dsl::email.eq(&body.email))
        .first(&mut conn)
        .await
    {
        Ok(user) => user,
        Err(diesel::result::Error::NotFound) => {
            return Ok(HttpResponse::Ok().json(response));
        }
        Err(e) => return Err(ServiceError::from(e).into()),
    };

    if user.password_hash.is_some() {
        let reset_token = Uuid::new_v4().to_string();

        // Store token in Redis with 1 hour TTL
        let mut con = redis_manager.get_ref().clone();
        let key = format!("password-reset:{}", user.id);
        let _: () = con
            .set_ex(&key, &reset_token, 3600) // 1 hour TTL
            .await
            .map_err(|e| ServiceError::Unknown(format!("Failed to store token in Redis: {e}")))?;

        let reset_link = format!(
            "{}/reset-password?token={}&user_id={}",
            google_oauth_service.frontend_url, reset_token, user.id
        );

        let email_body = format!(
            "<h1>Password Reset Request</h1>
            <p>Click the link below to reset your password:</p>
            <p><a href=\"{reset_link}\">Reset Password</a></p>
            <p>This link will expire in 2 hours.</p>"
        );

        email_service
            .send_html_email(shared::services::email::HtmlEmailContent {
                to: &body.email,
                subject: "Password Reset Request",
                html_body: &email_body,
                text_body: None,
                from: None,
            })
            .await?;
    }

    Ok(HttpResponse::Ok().json(response))
}

/// Reset password
///
/// # Errors
/// Returns an error if token is invalid, password validation fails, or database operations fail.
#[utoipa::path(
    post,
    path = "/auth/reset-password",
    context_path = "/api",
    tag = "Auth",
    request_body(content = ResetPasswordRequest, description = "Password reset token and new password"),
    responses(
        (status = 200, description = "Password reset successful", body = ResetPasswordResponse),
        (status = 400, description = "Invalid token or password", body = ErrorResponse,
            example = json!({
                "error": "Invalid or expired password reset token",
                "code": "AUTH_INVALID_RESET_TOKEN"
            })
        ),
        (status = 500, description = "Password update service error or database connection failed", body = ErrorResponse,
            example = json!({
                "error": "Password reset service unavailable",
                "code": "RESET_SERVICE_ERROR"
            })
        ),
    )
)]
pub async fn reset_password(
    session: Session,
    redis_manager: web::Data<ConnectionManager>,
    db_service: web::Data<shared::services::db::DbService>,
    body: web::Json<ResetPasswordRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::users::dsl as users_dsl;

    if let Err(msg) = validate_password(&body.new_password) {
        return Ok(json_error(msg));
    }

    let pool = db_service.pool();
    let mut pg_conn = pool.get().await.map_err(ServiceError::from)?;

    let mut redis_conn = redis_manager.get_ref().clone();
    let stored_token = redis_conn
        .get::<_, String>(format!("password-reset:{}", body.user_id))
        .await;
    let Some(actual_token) = stored_token.ok() else {
        return Ok(json_error("Invalid or expired password reset token"));
    };
    if actual_token != body.token {
        return Ok(json_error("Invalid password reset token"));
    }

    let password_hash = hash_password(&body.new_password)?;

    let _ = diesel::update(users_dsl::users.filter(users_dsl::id.eq(&body.user_id)))
        .set(users_dsl::password_hash.eq(password_hash))
        .execute(&mut pg_conn)
        .await
        .map_err(ServiceError::from)?;

    let user: User = users_dsl::users
        .filter(users_dsl::id.eq(&body.user_id))
        .first(&mut pg_conn)
        .await
        .map_err(ServiceError::from)?;

    session
        .insert("user", user)
        .map_err(|e| ServiceError::Unknown(format!("Failed to set session: {e}")))?;

    Ok(HttpResponse::Ok().json(ResetPasswordResponse {
        message: "Password has been reset successfully".to_owned(),
    }))
}

/// Check if email exists
///
/// # Errors
/// Returns 404 if email doesn't exist, 204 if it does exist, or 500 for database errors.
#[utoipa::path(
    post,
    path = "/auth/check-email",
    context_path = "/api",
    tag = "Auth",
    request_body(content = CheckEmailRequest, description = "Email address to check for registration"),
    responses(
        (status = 204, description = "Email exists in the system"),
        (status = 404, description = "Email not found in the system"),
        (status = 500, description = "Database connection failed", body = ErrorResponse,
            example = json!({
                "error": "Database connection failed",
                "code": "DATABASE_ERROR"
            })
        ),
    )
)]
pub async fn check_email(
    db_service: web::Data<shared::services::db::DbService>,
    body: web::Json<CheckEmailRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::users::dsl as users_dsl;

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    match users_dsl::users
        .filter(users_dsl::email.eq(&body.email))
        .first::<User>(&mut conn)
        .await
    {
        Ok(_) => Ok(HttpResponse::NoContent().finish()),
        Err(diesel::result::Error::NotFound) => Ok(HttpResponse::NotFound().finish()),
        Err(e) => Err(ServiceError::from(e).into()),
    }
}
