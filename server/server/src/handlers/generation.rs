use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};
use shared::{
    errors::ServiceError,
    models::{
        audio_clip::{AudioClip, UserAudioClip},
        auth::User,
        generation::{Generation, UserGeneration},
    },
    services::{
        db::DbService, elevenlabs::ElevenLabsService, latentsync::LatentSyncService, s3::S3Service,
    },
};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, Clone, ToSchema)]
#[schema(example = json!({
    "prompt": "Hello, this is a test voice generation for Peter Griffin",
    "character": "d290f1ee-6c54-4b01-90e6-d701748f0851"
}))]
pub struct AudioGenerationRequest {
    /// The text prompt to generate audio for
    pub prompt: String,
    /// The UUID of the character to use for voice generation
    pub character: uuid::Uuid,
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
#[schema(example = json!({
    "audio_clip": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "prompt": "Hello, this is a test voice generation for Peter Griffin",
        "character_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "s3_key": "audio_clips/audio_123.mp3",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    },
    "s3_url": "https://celebrities-ai.s3.amazonaws.com/audio_clips/audio_123.mp3?presigned=true"
}))]
pub struct AudioGenerationResponse {
    /// The generated audio clip metadata
    pub audio_clip: AudioClip,
    /// Pre-signed S3 URL to access the generated audio file
    pub s3_url: String,
}

/// Generate Audio Clip
///
/// Creates a new audio clip using text-to-speech with the specified character voice.
/// The generated audio is uploaded to S3 and a pre-signed URL is returned.
///
/// # Errors
///
/// Returns a [`ServiceError`] if the character is not found, if audio generation fails,
/// if uploading to S3 fails, or if database operations fail.
#[utoipa::path(
    post,
    path = "/generate/audio",
    context_path = "/api",
    tag = "Generation",
    request_body(content = AudioGenerationRequest, description = "Audio generation request payload", content_type = "application/json"),
    params(
        ("user_session" = String, Cookie, description = "Encrypted user session cookie")
    ),
    responses(
        (status = 200, description = "Audio clip generated successfully", body = AudioGenerationResponse),
        (status = 400, description = "Invalid request data", body = String),
        (status = 404, description = "Character not found", body = String),
        (status = 500, description = "Internal server error", body = String),
    )
)]
pub async fn generate_audio_clip(
    user: User,
    generation_request: web::Json<AudioGenerationRequest>,
    db_service: web::Data<DbService>,
    elevenlabs_service: web::Data<ElevenLabsService>,
    s3_service: web::Data<S3Service>,
) -> Result<HttpResponse, ServiceError> {
    let character = db_service
        .get_character(&generation_request.character)
        .await?;

    let tts = elevenlabs_service
        .tts(&character.voice_id, &generation_request.prompt)
        .await?;

    let audio_id = uuid::Uuid::new_v4();

    let (url, s3_key) = s3_service.upload_audio_clip(audio_id, tts).await?;

    let audio_clip = AudioClip::new(
        audio_id,
        generation_request.prompt.clone(),
        generation_request.character,
        s3_key,
    );

    db_service.insert_audio_clip(&audio_clip).await?;

    // Create association between user and audio clip
    let user_audio_clip = UserAudioClip::new(uuid::Uuid::new_v4(), user.id, audio_id);

    db_service.insert_user_audio_clip(&user_audio_clip).await?;

    Ok(HttpResponse::Ok().json(AudioGenerationResponse {
        audio_clip,
        s3_url: url,
    }))
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
#[schema(example = json!({
    "clip": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "audio_clip": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}))]
pub struct VideoGenerationRequest {
    /// The UUID of the video clip to use as base
    pub clip: uuid::Uuid,
    /// The UUID of the audio clip to lip-sync with
    pub audio_clip: uuid::Uuid,
}

/// Generate Video with Lip Sync
///
/// Creates a new video generation by combining a video clip with an audio clip using AI lip-sync technology.
/// The request is processed asynchronously, and the generation status can be tracked using the returned generation ID.
///
/// # Errors
///
/// Returns a [`ServiceError`] if the audio clip, video clip, or any required resource cannot be found,
/// or if there is an error during video generation or database operations.
#[utoipa::path(
    post,
    path = "/generate/video",
    context_path = "/api",
    tag = "Generation",
    request_body(content = VideoGenerationRequest, description = "Video generation request payload", content_type = "application/json"),
    params(
        ("user_session" = String, Cookie, description = "Encrypted user session cookie")
    ),
    responses(
        (status = 200, description = "Video generation started successfully", body = Generation),
        (status = 400, description = "Invalid request data", body = String),
        (status = 404, description = "Clip or audio clip not found", body = String),
        (status = 500, description = "Internal server error", body = String),
    )
)]
pub async fn generate_video_with_lip_sync(
    user: User,
    generation_request: web::Json<VideoGenerationRequest>,
    db_service: web::Data<DbService>,
    latentsync_service: web::Data<LatentSyncService>,
    s3_service: web::Data<S3Service>,
) -> Result<HttpResponse, ServiceError> {
    let audio_clip = db_service
        .get_audio_clip(&generation_request.audio_clip)
        .await?;

    let audio_url = s3_service
        .get_presigned_url(&audio_clip.s3_key, 3600)
        .await?;

    let clip = db_service.get_clip(&generation_request.clip).await?;

    let clip_url = s3_service.get_presigned_url(&clip.s3_key, 3600).await?;

    let prediction_id = latentsync_service
        .generate_video(&clip_url, &audio_url, None)
        .await?;

    let generation = Generation::new(
        generation_request.clip,
        audio_clip.character_id,
        audio_clip.id,
        prediction_id,
    );

    db_service.insert_generation(&generation).await?;

    // Create association between user and generation
    let user_generation = UserGeneration::new(user.id, generation.id);
    db_service.insert_user_generation(&user_generation).await?;

    Ok(HttpResponse::Ok().json(generation))
}

#[derive(Serialize, Deserialize, Clone, ToSchema)]
#[schema(example = json!({
    "video_url": "https://celebrities-ai.s3.amazonaws.com/generations/video_123.mp4?presigned=true",
    "generation": {
        "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "clip_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "character_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "audio_clip_id": "12345678-90ab-cdef-1234-567890abcdef",
        "s3_key": "generations/video_123.mp4",
        "status": "completed",
        "error": null,
        "prediction_id": "latentsync_pred_12345",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:05:00"
    }
}))]
pub struct VideoGenerationResponse {
    /// Pre-signed S3 URL to access the generated video file (if available)
    pub video_url: Option<String>,
    /// The video generation metadata and status
    pub generation: Generation,
}

/// List User's Video Generations
///
/// Retrieves all video generations belonging to the authenticated user.
/// Returns a list of generations with their current status and metadata.
///
/// # Errors
///
/// Returns a [`ServiceError`] if there is an error retrieving generations from the database.
#[utoipa::path(
    get,
    path = "/generate/video",
    context_path = "/api",
    tag = "Generation",
    params(
        ("user_session" = String, Cookie, description = "Encrypted user session cookie")
    ),
    responses(
        (status = 200, description = "User generations retrieved successfully", body = Vec<Generation>),
        (status = 500, description = "Internal server error", body = String),
    )
)]
pub async fn list_user_generations(
    user: User,
    db_service: web::Data<DbService>,
) -> Result<HttpResponse, ServiceError> {
    let generations = db_service.get_generations_for_user(&user.id).await?;
    Ok(HttpResponse::Ok().json(generations))
}

/// Get Video Generation Status
///
/// Retrieves the status and details of a video generation by its ID.
/// If the video has been generated successfully, includes a pre-signed S3 URL to access the video file.
///
/// # Errors
///
/// Returns a [`ServiceError`] if the generation is not found or if there is an error retrieving the video URL or database information.
#[utoipa::path(
    get,
    path = "/generate/video/{id}",
    context_path = "/api",
    tag = "Generation",
    params(
        ("id" = uuid::Uuid, Path, description = "The generation ID to retrieve"),
        ("user_session" = String, Cookie, description = "Encrypted user session cookie")
    ),
    responses(
        (status = 200, description = "Video generation details retrieved successfully", body = VideoGenerationResponse),
        (status = 404, description = "Generation not found", body = String),
        (status = 500, description = "Internal server error", body = String),
    )
)]
pub async fn get_video_generation_status(
    user: User,
    generation_id: web::Path<uuid::Uuid>,
    db_service: web::Data<DbService>,
    s3_service: web::Data<S3Service>,
) -> Result<HttpResponse, ServiceError> {
    // First verify that the user owns this generation
    let user_generation = db_service
        .get_user_generation(&user.id, &generation_id)
        .await?;

    if user_generation.is_none() {
        return Err(ServiceError::NotFound(
            "Generation not found or access denied".to_string(),
        ));
    }

    let generation = db_service.get_generation(&generation_id).await?;

    let video_url = if let Some(ref s3_key) = generation.s3_key {
        Some(s3_service.get_presigned_url(s3_key, 3600).await?)
    } else {
        None
    };

    Ok(HttpResponse::Ok().json(VideoGenerationResponse {
        video_url,
        generation,
    }))
}
