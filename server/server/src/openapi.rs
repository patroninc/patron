#![allow(clippy::needless_for_each)]
use crate::handlers::{
    auth::{
        ForgotPasswordRequest, ForgotPasswordResponse, LoginRequest, LoginResponse,
        LogoutResponse, RegisterRequest, RegisterResponse, ResetPasswordRequest,
        ResetPasswordResponse,
    },
    characters::{CharactersResponse, ClipsResponse},
    generation::{
        AudioGenerationRequest, AudioGenerationResponse, VideoGenerationRequest,
        VideoGenerationResponse,
    },
    webhook::{LatentSyncWebhookRequest, WebhookResponse},
};
use shared::models::{
    audio_clip::AudioClip, auth::{AuthCallbackQuery, UserInfo, UserInfoResponse}, character::Character, clips::Clip,
    generation::Generation,
};
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
        crate::handlers::generation::generate_audio_clip,
        crate::handlers::generation::generate_video_with_lip_sync,
        crate::handlers::generation::list_user_generations,
        crate::handlers::generation::get_video_generation_status,
        crate::handlers::auth::google_auth_redirect,
        crate::handlers::auth::google_auth_callback,
        crate::handlers::auth::register,
        crate::handlers::auth::verify_email,
        crate::handlers::auth::logout,
        crate::handlers::auth::login,
        crate::handlers::auth::get_me,
        crate::handlers::auth::forgot_password,
        crate::handlers::auth::reset_password,
        crate::handlers::webhook::latentsync,
        crate::handlers::characters::get_all_characters,
        crate::handlers::characters::get_clips_for_character,
    ),
    components(
        schemas(
            AudioGenerationRequest,
            AudioGenerationResponse,
            VideoGenerationRequest,
            VideoGenerationResponse,
            AudioClip,
            Generation,
            AuthCallbackQuery,
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
            LatentSyncWebhookRequest,
            WebhookResponse,
            Character,
            Clip,
            CharactersResponse,
            ClipsResponse,
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
pub struct ApiDoc;
