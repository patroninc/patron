use actix_session::Session;
use actix_web::{web, HttpResponse, Result};
use chrono::Utc;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::{Deserialize, Serialize};
use shared::{
    errors::ServiceError,
    models::auth::{AuthCallbackQuery, User, UserInfo, UserInfoResponse},
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

/// Request body for user registration.
#[derive(Debug, Deserialize, ToSchema)]
#[schema(example = json!({
    "email": "user@example.com",
    "password": "password123"
}))]
pub struct RegisterRequest {
    /// User's email address
    pub email: String,
    /// User's password (minimum 8 characters)
    pub password: String,
}

/// Response for successful user registration
#[derive(Serialize, ToSchema, Debug)]
#[schema(example = json!({
    "message": "Registration successful. Please check your email for verification.",
    "user_id": "d290f1ee-6c54-4b01-90e6-d701748f0851"
}))]
pub struct RegisterResponse {
    /// Success message
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
    /// User's email address
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
        "auth_provider": "email"
    }
}))]
pub struct LoginResponse {
    /// Success message
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
    /// Success message
    pub message: String,
}

/// Request body for password reset
#[derive(Deserialize, ToSchema, Debug)]
#[schema(example = json!({
    "email": "user@example.com"
}))]
pub struct ForgotPasswordRequest {
    /// User's email address
    pub email: String,
}

/// Response for password reset request
#[derive(Serialize, ToSchema, Debug)]
#[schema(example = json!({
    "message": "If the email exists in our system, a password reset link has been sent."
}))]
pub struct ForgotPasswordResponse {
    /// Status message
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
    /// New password (minimum 8 characters)
    pub new_password: String,
}

/// Response for successful password reset
#[derive(Serialize, ToSchema, Debug)]
#[schema(example = json!({
    "message": "Password has been reset successfully"
}))]
pub struct ResetPasswordResponse {
    /// Success message
    pub message: String,
}

/// Helper function to validate password (simple 8+ character check)
fn validate_password(password: &str) -> Result<(), &'static str> {
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

/// Helper function to set user session
fn set_user_session(session: &Session, user: &User) -> Result<(), ServiceError> {
    session
        .insert("user", user)
        .map_err(|e| ServiceError::Unknown(format!("Failed to set session: {e}")))?;
    Ok(())
}

/// Google OAuth redirect
#[utoipa::path(
    get,
    path = "/auth/google",
    context_path = "/api",
    tag = "Auth",
    responses(
        (status = 302, description = "Redirect to Google OAuth consent screen"),
        (status = 500, description = "Internal server error", body = String),
    )
)]
pub async fn google_auth_redirect(
    session: Session,
    google_oauth_service: web::Data<GoogleOAuthService>,
) -> Result<HttpResponse, actix_web::Error> {
    let state = Uuid::new_v4().to_string();
    let auth_url = google_oauth_service.get_authorization_url(Some(&state));

    // Store OAuth state in session
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

/// Google OAuth callback
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
        (status = 400, description = "Invalid authorization code or state", body = String),
        (status = 500, description = "Internal server error", body = String),
    )
)]
pub async fn google_auth_callback(
    session: Session,
    db_service: web::Data<shared::services::db::DbService>,
    google_oauth_service: web::Data<GoogleOAuthService>,
    query: web::Query<AuthCallbackQuery>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::users::dsl as users_dsl;

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    // Verify the state parameter from session
    let stored_state: Option<String> = session.get("oauth_state").map_err(|e| {
        ServiceError::Unknown(format!("Failed to get OAuth state from session: {e}"))
    })?;

    let Some(stored_state) = stored_state else {
        return Ok(HttpResponse::BadRequest().json("Invalid OAuth state"));
    };

    if stored_state != query.state {
        return Ok(HttpResponse::BadRequest().json("OAuth state mismatch"));
    }

    let redirect_uri: String = session
        .get("oauth_redirect_uri")
        .map_err(|e| {
            ServiceError::Unknown(format!("Failed to get redirect URI from session: {e}"))
        })?
        .unwrap_or_else(|| google_oauth_service.frontend_url.clone());

    // Exchange code for token and get user info
    let token_response = google_oauth_service
        .exchange_code_for_token(&query.code)
        .await?;
    let google_user_info = google_oauth_service
        .get_user_info(&token_response.access_token)
        .await?;

    // Find or create user
    let user = match users_dsl::users
        .filter(users_dsl::email.eq(&google_user_info.email))
        .first::<User>(&mut conn)
        .await
    {
        Ok(mut existing_user) => {
            // Update user with Google info if missing
            if existing_user.display_name.is_none() && !google_user_info.name.is_empty() {
                existing_user.display_name = Some(google_user_info.name.clone());
            }
            if existing_user.avatar_url.is_none() && !google_user_info.picture.is_empty() {
                existing_user.avatar_url = Some(google_user_info.picture.clone());
            }

            // Update auth provider
            let new_auth_provider = match existing_user.auth_provider.as_str() {
                "email" => "both".to_string(),
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
                .execute(&mut conn)
                .await
                .map_err(ServiceError::from)?;

            existing_user.auth_provider = new_auth_provider;
            existing_user.email_verified = true;
            existing_user.last_login = Some(Utc::now().naive_utc());
            existing_user
        }
        Err(diesel::result::Error::NotFound) => {
            // Create new user
            let new_user = User {
                id: Uuid::new_v4(),
                email: google_user_info.email.clone(),
                display_name: Some(google_user_info.name.clone()),
                avatar_url: Some(google_user_info.picture.clone()),
                auth_provider: "google".to_string(),
                email_verified: true,
                password_hash: None,
                created_at: None,
                updated_at: None,
                last_login: Some(Utc::now().naive_utc()),
            };

            let _ = diesel::insert_into(users_dsl::users)
                .values(&new_user)
                .execute(&mut conn)
                .await
                .map_err(ServiceError::from)?;

            new_user
        }
        Err(e) => return Err(ServiceError::from(e).into()),
    };

    // Set user session
    set_user_session(&session, &user)?;

    // Clean up OAuth session data
    let _ = session.remove("oauth_state");
    let _ = session.remove("oauth_redirect_uri");

    // Redirect to frontend
    Ok(HttpResponse::Found()
        .append_header(("Location", format!("{redirect_uri}/dashboard")))
        .finish())
}

/// User registration
#[utoipa::path(
    post,
    path = "/auth/register",
    context_path = "/api",
    tag = "Auth",
    request_body = RegisterRequest,
    responses(
        (status = 200, description = "Registration successful", body = RegisterResponse),
        (status = 400, description = "Invalid input or email already exists", body = String),
        (status = 500, description = "Internal server error", body = String),
    )
)]
pub async fn register(
    session: Session,
    email_service: web::Data<EmailService>,
    db_service: web::Data<shared::services::db::DbService>,
    google_oauth_service: web::Data<GoogleOAuthService>,
    body: web::Json<RegisterRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::users::dsl as users_dsl;

    // Validate input
    if body.email.is_empty() {
        return Ok(HttpResponse::BadRequest().json("Email is required"));
    }
    if let Err(msg) = validate_password(&body.password) {
        return Ok(HttpResponse::BadRequest().json(msg));
    }

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    // Check if user already exists
    if users_dsl::users
        .filter(users_dsl::email.eq(&body.email))
        .first::<User>(&mut conn)
        .await
        .is_ok()
    {
        return Ok(HttpResponse::BadRequest().json("Email address already registered"));
    }

    // Hash password
    let password_hash = hash_password(&body.password)?;

    // Create new user
    let new_user = User {
        id: Uuid::new_v4(),
        email: body.email.clone(),
        display_name: None,
        avatar_url: None,
        auth_provider: "email".to_string(),
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

    // Store email verification token in session
    let verification_token = Uuid::new_v4().to_string();
    session
        .insert("email_verification_token", &verification_token)
        .map_err(|e| ServiceError::Unknown(format!("Failed to store verification token: {e}")))?;
    session
        .insert("email_verification_user_id", new_user.id)
        .map_err(|e| ServiceError::Unknown(format!("Failed to store user ID: {e}")))?;
    session
        .insert("email_verification_email", &new_user.email)
        .map_err(|e| ServiceError::Unknown(format!("Failed to store email: {e}")))?;

    // Send verification email
    let verification_link = format!(
        "{}/api/auth/verify-email?token={}",
        google_oauth_service.backend_url, verification_token
    );

    let email_body = format!(
        "<h1>Welcome to CelebAI!</h1>
        <p>Please click the link below to verify your email address:</p>
        <p><a href=\"{verification_link}\">Verify Email</a></p>
        <p>This link will expire in 24 hours.</p>"
    );

    // Send email (don't fail registration if email fails)
    if let Err(e) = email_service
        .send_html_email(
            &body.email,
            "Please verify your email address",
            &email_body,
            None,
            None,
        )
        .await
    {
        tracing::warn!("Failed to send verification email: {}", e);
    }

    Ok(HttpResponse::Ok().json(RegisterResponse {
        message: "Registration successful. Please check your email for verification.".to_string(),
        user_id: new_user.id,
    }))
}

/// Email verification
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
        (status = 400, description = "Invalid or expired token", body = String),
        (status = 500, description = "Internal server error", body = String),
    )
)]
pub async fn verify_email(
    session: Session,
    db_service: web::Data<shared::services::db::DbService>,
    google_oauth_service: web::Data<GoogleOAuthService>,
    query: web::Query<HashMap<String, String>>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::users::dsl as users_dsl;

    let Some(token) = query.get("token") else {
        return Ok(HttpResponse::BadRequest().json("Token is required"));
    };

    // Get verification data from session
    let stored_token: Option<String> = session.get("email_verification_token").map_err(|e| {
        ServiceError::Unknown(format!(
            "Failed to get verification token from session: {e}"
        ))
    })?;
    let user_id: Option<Uuid> = session
        .get("email_verification_user_id")
        .map_err(|e| ServiceError::Unknown(format!("Failed to get user ID from session: {e}")))?;

    let Some(stored_token) = stored_token else {
        return Ok(HttpResponse::BadRequest().json("Invalid or expired verification token"));
    };
    let Some(user_id) = user_id else {
        return Ok(HttpResponse::BadRequest().json("Invalid verification session"));
    };

    if stored_token != *token {
        return Ok(HttpResponse::BadRequest().json("Invalid verification token"));
    }

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    // Get and update user
    let mut user: User = users_dsl::users
        .filter(users_dsl::id.eq(&user_id))
        .first(&mut conn)
        .await
        .map_err(ServiceError::from)?;

    // Check if already verified
    if user.email_verified {
        let redirect_url = format!(
            "{}/login?verified=already",
            google_oauth_service.frontend_url
        );
        return Ok(HttpResponse::Found()
            .append_header(("Location", redirect_url))
            .finish());
    }

    // Update user
    let _ = diesel::update(users_dsl::users.filter(users_dsl::id.eq(&user.id)))
        .set(users_dsl::email_verified.eq(true))
        .execute(&mut conn)
        .await
        .map_err(ServiceError::from)?;

    user.email_verified = true;

    // Set user session
    set_user_session(&session, &user)?;

    // Clean up verification session data
    let _ = session.remove("email_verification_token");
    let _ = session.remove("email_verification_user_id");
    let _ = session.remove("email_verification_email");

    // Redirect to frontend
    let redirect_url = format!(
        "{}/dashboard?verified=success",
        google_oauth_service.frontend_url
    );
    Ok(HttpResponse::Found()
        .append_header(("Location", redirect_url))
        .finish())
}

/// User login
#[utoipa::path(
    post,
    path = "/auth/login",
    context_path = "/api",
    tag = "Auth",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = LoginResponse),
        (status = 400, description = "Invalid credentials or email not verified", body = String),
        (status = 500, description = "Internal server error", body = String),
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

    // Find user
    let mut user: User = match users_dsl::users
        .filter(users_dsl::email.eq(&body.email))
        .first(&mut conn)
        .await
    {
        Ok(user) => user,
        Err(diesel::result::Error::NotFound) => {
            return Ok(HttpResponse::BadRequest().json("Invalid email or password"));
        }
        Err(e) => return Err(ServiceError::from(e).into()),
    };

    // Check if user has password (not OAuth-only)
    let Some(password_hash) = &user.password_hash else {
        return Ok(HttpResponse::BadRequest()
            .json("This account uses Google sign-in. Please use the Google login button."));
    };

    // Verify password
    if !verify_password(&body.password, password_hash)? {
        return Ok(HttpResponse::BadRequest().json("Invalid email or password"));
    }

    // Check if email is verified
    if !user.email_verified {
        return Ok(
            HttpResponse::BadRequest().json("Please verify your email address before logging in")
        );
    }

    // Update last login
    let _ = diesel::update(users_dsl::users.filter(users_dsl::id.eq(&user.id)))
        .set(users_dsl::last_login.eq(Some(Utc::now().naive_utc())))
        .execute(&mut conn)
        .await
        .map_err(ServiceError::from)?;

    user.last_login = Some(Utc::now().naive_utc());

    // Set session
    set_user_session(&session, &user)?;

    Ok(HttpResponse::Ok().json(LoginResponse {
        message: "Login successful".to_string(),
        user: user.into(),
    }))
}

/// Get current user info
#[utoipa::path(
    get,
    path = "/auth/me",
    context_path = "/api",
    tag = "Auth",
    responses(
        (status = 200, description = "Current user information", body = UserInfoResponse),
        (status = 401, description = "Not authenticated", body = String),
    )
)]
pub async fn get_me(user: User) -> Result<HttpResponse, actix_web::Error> {
    Ok(HttpResponse::Ok().json(UserInfoResponse::from(UserInfo::from(user))))
}

/// Logout
#[utoipa::path(
    get,
    path = "/auth/logout",
    context_path = "/api",
    tag = "Auth",
    responses(
        (status = 200, description = "Successfully logged out", body = LogoutResponse),
    )
)]
pub async fn logout(session: Session) -> Result<HttpResponse, actix_web::Error> {
    session.purge();
    Ok(HttpResponse::Ok().json(LogoutResponse {
        message: "Logged out successfully".to_string(),
    }))
}

/// Forgot password
#[utoipa::path(
    post,
    path = "/auth/forgot-password",
    context_path = "/api",
    tag = "Auth",
    request_body = ForgotPasswordRequest,
    responses(
        (status = 200, description = "Password reset email sent", body = ForgotPasswordResponse),
    )
)]
pub async fn forgot_password(
    session: Session,
    email_service: web::Data<EmailService>,
    db_service: web::Data<shared::services::db::DbService>,
    google_oauth_service: web::Data<GoogleOAuthService>,
    body: web::Json<ForgotPasswordRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::users::dsl as users_dsl;

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    // Always return same response to prevent user enumeration
    let response = ForgotPasswordResponse {
        message: "If the email exists in our system, a password reset link has been sent."
            .to_string(),
    };

    // Check if user exists
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

    // Only send reset email if user has a password (not OAuth-only)
    if user.password_hash.is_some() {
        // Store password reset token in session
        let reset_token = Uuid::new_v4().to_string();
        session
            .insert("password_reset_token", &reset_token)
            .map_err(|e| ServiceError::Unknown(format!("Failed to store reset token: {e}")))?;
        session
            .insert("password_reset_user_id", user.id)
            .map_err(|e| ServiceError::Unknown(format!("Failed to store user ID: {e}")))?;

        // Send reset email
        let reset_link = format!(
            "{}/reset-password?token={}",
            google_oauth_service.frontend_url, reset_token
        );

        let email_body = format!(
            "<h1>Password Reset Request</h1>
            <p>Click the link below to reset your password:</p>
            <p><a href=\"{reset_link}\">Reset Password</a></p>
            <p>This link will expire in 2 hours.</p>"
        );

        if let Err(e) = email_service
            .send_html_email(
                &body.email,
                "Password Reset Request",
                &email_body,
                None,
                None,
            )
            .await
        {
            tracing::warn!("Failed to send password reset email: {}", e);
        }
    }

    Ok(HttpResponse::Ok().json(response))
}

/// Reset password
#[utoipa::path(
    post,
    path = "/auth/reset-password",
    context_path = "/api",
    tag = "Auth",
    request_body = ResetPasswordRequest,
    responses(
        (status = 200, description = "Password reset successful", body = ResetPasswordResponse),
        (status = 400, description = "Invalid token or password", body = String),
    )
)]
pub async fn reset_password(
    session: Session,
    db_service: web::Data<shared::services::db::DbService>,
    body: web::Json<ResetPasswordRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::users::dsl as users_dsl;

    // Validate new password
    if let Err(msg) = validate_password(&body.new_password) {
        return Ok(HttpResponse::BadRequest().json(msg));
    }

    // Get reset data from session
    let stored_token: Option<String> = session.get("password_reset_token").map_err(|e| {
        ServiceError::Unknown(format!("Failed to get reset token from session: {e}"))
    })?;
    let user_id: Option<Uuid> = session
        .get("password_reset_user_id")
        .map_err(|e| ServiceError::Unknown(format!("Failed to get user ID from session: {e}")))?;

    let Some(stored_token) = stored_token else {
        return Ok(HttpResponse::BadRequest().json("Invalid or expired password reset token"));
    };
    let Some(user_id) = user_id else {
        return Ok(HttpResponse::BadRequest().json("Invalid reset session"));
    };

    if stored_token != body.token {
        return Ok(HttpResponse::BadRequest().json("Invalid password reset token"));
    }

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    // Hash new password
    let password_hash = hash_password(&body.new_password)?;

    // Update user password
    let _ = diesel::update(users_dsl::users.filter(users_dsl::id.eq(&user_id)))
        .set(users_dsl::password_hash.eq(password_hash))
        .execute(&mut conn)
        .await
        .map_err(ServiceError::from)?;

    // Get updated user and set session
    let user: User = users_dsl::users
        .filter(users_dsl::id.eq(&user_id))
        .first(&mut conn)
        .await
        .map_err(ServiceError::from)?;

    set_user_session(&session, &user)?;

    // Clean up reset session data
    let _ = session.remove("password_reset_token");
    let _ = session.remove("password_reset_user_id");

    Ok(HttpResponse::Ok().json(ResetPasswordResponse {
        message: "Password has been reset successfully".to_string(),
    }))
}
