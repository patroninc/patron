#![allow(clippy::needless_for_each)]

use crate::handlers::auth::{
    CheckEmailRequest, ForgotPasswordRequest, ForgotPasswordResponse, LoginRequest, LoginResponse,
    LogoutResponse, RegisterRequest, RegisterResponse, ResendVerificationResponse,
    ResetPasswordRequest, ResetPasswordResponse, UpdateUserInfoRequest, UpdateUserInfoResponse,
};
use crate::handlers::outrank::{OutrankWebhookPayload, OutrankWebhookResponse};
use crate::handlers::user_files::{FileUploadRequest, FileUploadResponse};
use shared::models::api_keys::{
    ApiKeyResponse, ApiKeysListResponse, CreateApiKeyRequest, CreateApiKeyResponse,
    UpdateApiKeyRequest,
};
use shared::models::auth::{UserInfo, UserInfoResponse};
use shared::models::posts::{
    CreatePostRequest, PostResponse, PostsListResponse, UpdatePostRequest,
};
use shared::models::series::{
    CreateSeriesRequest, SeriesListResponse, SeriesResponse, UpdateSeriesRequest,
};
use shared::models::user_files::{
    FileStatus, UpdateUserFileRequest, UserFileInfo, UserFileResponse, UserFilesResponse,
};
use utoipa::{
    openapi::{
        schema::{ObjectBuilder, Schema},
        security::{ApiKey, ApiKeyValue, HttpAuthScheme, HttpBuilder, SecurityScheme},
        RefOr,
    },
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
        crate::handlers::user_files::upload_file,
        crate::handlers::user_files::list_files,
        crate::handlers::user_files::get_file,
        crate::handlers::user_files::update_file,
        crate::handlers::user_files::delete_file,
        crate::handlers::user_files::serve_file_cdn,
        crate::handlers::series::create_series,
        crate::handlers::series::list_series,
        crate::handlers::series::get_series,
        crate::handlers::series::update_series,
        crate::handlers::series::delete_series,
        crate::handlers::posts::create_post,
        crate::handlers::posts::list_posts,
        crate::handlers::posts::get_post,
        crate::handlers::posts::update_post,
        crate::handlers::posts::delete_post,
        crate::handlers::api_keys::create_api_key,
        crate::handlers::api_keys::list_api_keys,
        crate::handlers::api_keys::get_api_key,
        crate::handlers::api_keys::update_api_key,
        crate::handlers::api_keys::delete_api_key,
        crate::handlers::outrank::process_webhook,
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
            UpdateUserInfoResponse,
            FileStatus,
            UserFileInfo,
            UserFileResponse,
            UserFilesResponse,
            UpdateUserFileRequest,
            FileUploadRequest,
            FileUploadResponse,
            SeriesResponse,
            SeriesListResponse,
            CreateSeriesRequest,
            UpdateSeriesRequest,
            PostResponse,
            PostsListResponse,
            CreatePostRequest,
            UpdatePostRequest,
            ApiKeyResponse,
            ApiKeysListResponse,
            CreateApiKeyRequest,
            CreateApiKeyResponse,
            UpdateApiKeyRequest,
            OutrankWebhookPayload,
            OutrankWebhookResponse,
        )
    ),
    modifiers(&SecurityAddon),
    tags(
        (name = "Auth", description = "Authentication and authorization endpoints"),
        (name = "Files", description = "File upload, download, and management endpoints"),
        (name = "Series", description = "Series creation and management endpoints"),
        (name = "Posts", description = "Post creation and management endpoints"),
        (name = "API Keys", description = "API key creation and management endpoints"),
        (name = "Outrank", description = "Outrank SEO integration webhook endpoints"),
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
    #[allow(clippy::too_many_lines)]
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        // Add x-speakeasy-retries extension at the root level
        if let Some(obj) = serde_json::json!({
            "x-speakeasy-retries": {
                "strategy": "backoff",
                "backoff": {
                    "initialInterval": 500_i32,
                    "maxInterval": 60_000_i32,
                    "maxElapsedTime": 3_600_000_i32,
                    "exponent": 1.5_f64
                },
                "statusCodes": [
                    "5XX",
                    "429"
                ],
                "retryConnectionErrors": true
            }
        })
        .as_object()
        {
            openapi.extensions = Some(obj.clone().into_iter().collect());
        }

        // Add x-speakeasy-pagination hints to list endpoints
        let pagination_extension = serde_json::json!({
            "x-speakeasy-pagination": {
                "type": "cursor",
                "inputs": [
                    {
                        "name": "offset",
                        "in": "parameters",
                        "type": "cursor"
                    },
                    {
                        "name": "limit",
                        "in": "parameters",
                        "type": "limit"
                    }
                ],
                "outputs": {
                    "results": "$.data",
                    "nextCursor": "$.nextCursor"
                }
            }
        });

        // Add pagination hints to list operations
        let list_paths = vec![
            "/api/api-keys",
            "/api/series",
            "/api/posts",
            "/api/user-files",
        ];

        for path in list_paths {
            if let Some(path_item) = openapi.paths.paths.get_mut(path) {
                if let Some(operation) = path_item.get.as_mut() {
                    if let Some(obj) = pagination_extension.as_object() {
                        operation.extensions = Some(obj.clone().into_iter().collect());
                    }
                }
            }
        }

        if let Some(components) = openapi.components.as_mut() {
            let mut cookie_auth =
                SecurityScheme::ApiKey(ApiKey::Cookie(ApiKeyValue::new("sessionid")));
            if let SecurityScheme::ApiKey(ApiKey::Cookie(ref mut cookie)) = cookie_auth {
                cookie.description =
                    Some("Session-based authentication using secure HTTP-only cookies".to_owned());
            }
            components.add_security_scheme("cookieAuth", cookie_auth);

            let bearer_auth = SecurityScheme::Http(
                HttpBuilder::new()
                    .scheme(HttpAuthScheme::Bearer)
                    .bearer_format("API Key")
                    .description(Some(
                        "API key authentication using Bearer token in Authorization header"
                            .to_owned(),
                    ))
                    .build(),
            );
            components.add_security_scheme("bearerAuth", bearer_auth);

            let value_schema = Schema::Object(
                ObjectBuilder::new()
                    .title(Some("JSONValue"))
                    .description(Some("Flexible JSON value that can be an object, array, string, number, boolean, or null"))
                    .build()
            );
            let _ = components
                .schemas
                .insert("Value".to_owned(), RefOr::T(value_schema));
        }
    }
}
