use crate::handlers::auth::{
    ForgotPasswordRequest, ForgotPasswordResponse, LoginRequest, LoginResponse, LogoutResponse,
    RegisterRequest, RegisterResponse, ResetPasswordRequest, ResetPasswordResponse,
};
use shared::models::auth::{UserInfo, UserInfoResponse};
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(
    info(
        title = "CelebAI Video Generation API",
        version = "1.0.0",
        description = "AI-powered celebrity video generation platform that creates personalized videos with lip-sync technology",
        contact(
            name = "CelebAI Team",
            email = "support@celebai.com"
        ),
        license(
            name = "MIT",
            url = "https://opensource.org/licenses/MIT"
        )
    ),
    paths(
        crate::handlers::auth::google_auth_redirect,
        crate::handlers::auth::google_auth_callback,
        crate::handlers::auth::register,
        crate::handlers::auth::verify_email,
        crate::handlers::auth::logout,
        crate::handlers::auth::login,
        crate::handlers::auth::get_me,
        crate::handlers::auth::forgot_password,
        crate::handlers::auth::reset_password,
    ),
    components(
        schemas(
            RegisterRequest,
            RegisterResponse,
            LoginRequest,
            LogoutResponse,
            LoginResponse,
            UserInfo,
            UserInfoResponse,
            ForgotPasswordRequest,
            ForgotPasswordResponse,
            ResetPasswordRequest,
            ResetPasswordResponse
        )
    ),
    tags(
        (name = "Generation", description = "Audio and video generation endpoints"),
        (name = "Auth", description = "Authentication and authorization endpoints"),
        (name = "Webhook", description = "Webhook endpoints for external service callbacks"),
        (name = "Characters", description = "Character and video clip management endpoints")
    ),
    servers(
        (url = "http://localhost:8080", description = "Local development server"),
        (url = "https://api.celebai.com", description = "Production server")
    ),
)]
/// OpenAPI documentation marker struct for CelebAI Video Generation API.
#[derive(Debug, Clone, Copy)]
pub struct ApiDoc;
