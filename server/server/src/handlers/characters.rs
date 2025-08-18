use actix_web::{web, HttpResponse};
use serde::Serialize;
use shared::errors::ServiceError;
use shared::models::character::Character;
use shared::models::clips::Clip;
use shared::services::db::DbService;
use utoipa::ToSchema;

#[derive(Serialize, ToSchema)]
#[schema(example = json!([
    {
        "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "name": "Peter Griffin",
        "voice_id": "EXAVITQu4vr4xnSDxMaL",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    },
    {
        "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "name": "Drake",
        "voice_id": "pNInz6obpgDQGcFmaJgB",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }
]))]
pub struct CharactersResponse {
    pub characters: Vec<Character>,
}

#[derive(Serialize, ToSchema)]
#[schema(example = json!([
    {
        "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "s3_key": "clips/peter_griffin_dance.mp4",
        "celeb_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    },
    {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "s3_key": "clips/peter_griffin_wave.mp4",
        "celeb_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }
]))]
pub struct ClipsResponse {
    pub clips: Vec<Clip>,
}

/// Get All Characters
///
/// Returns a list of all available characters that can be used for video generation.
///
/// # Errors
///
/// Returns a [`ServiceError`] if the database query fails.
#[utoipa::path(
    get,
    path = "/celebs",
    context_path = "/api",
    tag = "Characters",
    responses(
        (status = 200, description = "List of all available characters", body = CharactersResponse),
        (status = 500, description = "Internal server error", body = String),
    )
)]
pub async fn get_all_characters(
    db_service: web::Data<DbService>,
) -> Result<HttpResponse, ServiceError> {
    let characters = db_service.get_all_characters().await?;

    Ok(HttpResponse::Ok().json(CharactersResponse { characters }))
}

/// Get Clips for Character
///
/// Returns all available video clips for a specific character.
///
/// # Errors
///
/// Returns a [`ServiceError`] if the database query fails or the character is not found.
#[utoipa::path(
    get,
    path = "/characters/{character_id}/clips",
    context_path = "/api",
    tag = "Characters",
    params(
        ("character_id" = uuid::Uuid, Path, description = "The character ID to get clips for")
    ),
    responses(
        (status = 200, description = "List of clips for the specified character", body = ClipsResponse),
        (status = 404, description = "Character not found", body = String),
        (status = 500, description = "Internal server error", body = String),
    )
)]
pub async fn get_clips_for_character(
    character_id: web::Path<uuid::Uuid>,
    db_service: web::Data<DbService>,
) -> Result<HttpResponse, ServiceError> {
    let clips = db_service.get_clips_for_character(&character_id).await?;

    Ok(HttpResponse::Ok().json(ClipsResponse { clips }))
}
