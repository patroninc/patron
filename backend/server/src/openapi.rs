use crate::handlers::auth::{
    CheckEmailRequest, ForgotPasswordRequest, ForgotPasswordResponse, LoginRequest, LoginResponse,
    LogoutResponse, RegisterRequest, RegisterResponse, ResendVerificationResponse,
    ResetPasswordRequest, ResetPasswordResponse, UpdateUserInfoRequest, UpdateUserInfoResponse,
};
use shared::models::auth::{UserInfo, UserInfoResponse};
use utoipa::{
    openapi::security::{ApiKey, ApiKeyValue, SecurityScheme},
    Modify, OpenApi,
};

#[derive(OpenApi)]
#[openapi(
    info(
        title = "Patron API",
        version = "1.0.0",
        description = "An open source Patreon alternative with lower fees designed for creators who publish ongoing sequential content like books, podcasts, and comics.",
        contact(
            name = "Patron Team",
            email = "support@patron.com"
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
        crate::handlers::auth::check_email,
        crate::handlers::auth::resend_verification_email,
        crate::handlers::auth::update_user_info,
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
            ResetPasswordResponse,
            CheckEmailRequest,
            ResendVerificationResponse,
            UpdateUserInfoRequest,
            UpdateUserInfoResponse
        )
    ),
    modifiers(&SecurityAddon),
    tags(
        (name = "Auth", description = "Authentication and authorization endpoints"),
    ),
    servers(
        (url = "http://localhost:8080", description = "Local development server"),
        (url = "https://api.patron.com", description = "Production server")
    ),
)]
/// `OpenAPI` documentation marker struct for Patron API.
#[derive(Debug, Clone, Copy)]
pub struct ApiDoc;

struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            let mut cookie_auth =
                SecurityScheme::ApiKey(ApiKey::Cookie(ApiKeyValue::new("sessionid")));
            if let SecurityScheme::ApiKey(ApiKey::Cookie(ref mut cookie)) = cookie_auth {
                cookie.description =
                    Some("Session-based authentication using secure HTTP-only cookies".to_owned());
            }
            components.add_security_scheme("cookieAuth", cookie_auth);
        } else {
            // Optionally log or handle the missing components case
            // e.g., log::warn!("OpenAPI components are missing, cannot add security scheme.");
        }
    }
}
