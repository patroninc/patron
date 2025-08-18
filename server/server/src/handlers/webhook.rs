use actix_web::{web, HttpResponse};
use serde::{Deserialize, Serialize};
use shared::errors::ServiceError;
use shared::services::{db::DbService, s3::S3Service};
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
#[schema(example = json!({
    "id": "latentsync_pred_12345",
    "status": "succeeded",
    "output": "https://replicate.delivery/pbxt/abc123/output.mp4",
    "error": null
}))]
pub struct LatentSyncWebhookRequest {
    /// The prediction ID from LatentSync/Replicate
    pub id: String,
    /// Status of the video generation: pending, processing, succeeded, failed
    pub status: String,
    /// URL to the generated video file (present when status is succeeded)
    pub output: Option<String>,
    /// Error message (present when status is failed)
    pub error: Option<String>,
}

#[derive(Serialize, ToSchema)]
#[schema(example = json!({
    "message": "Webhook processed successfully"
}))]
pub struct WebhookResponse {
    /// Response message indicating webhook processing status
    pub message: String,
}

/// `LatentSync` Webhook Handler
///
/// Receives webhook notifications from LatentSync/Replicate when video generation completes.
/// Updates the generation status and downloads/stores the generated video when successful.
///
/// # Errors
///
/// Returns a [`ServiceError`] if the database operation fails, if the video download fails,
/// or if uploading to S3 fails.
///
/// # Panics
///
/// Panics if the `output` or `error` fields are unexpectedly `None` when required by the status.
#[utoipa::path(
    post,
    path = "/webhook/latentsync",
    context_path = "/api",
    tag = "Webhook",
    request_body(content = LatentSyncWebhookRequest, description = "Webhook payload from LatentSync/Replicate", content_type = "application/json"),
    responses(
        (status = 200, description = "Webhook processed successfully", body = WebhookResponse),
        (status = 400, description = "Invalid webhook payload", body = String),
        (status = 404, description = "Generation not found", body = String),
        (status = 500, description = "Internal server error", body = String),
    )
)]
pub async fn latentsync(
    webhook_request: web::Json<LatentSyncWebhookRequest>,
    db_service: web::Data<DbService>,
    s3_service: web::Data<S3Service>,
) -> Result<HttpResponse, ServiceError> {
    let mut generation = db_service
        .get_generation_by_prediction_id(&webhook_request.id)
        .await?;

    generation.set_status(&webhook_request.status);

    if webhook_request.status == "succeeded" && webhook_request.output.is_some() {
        let video = reqwest::get(webhook_request.output.clone().unwrap())
            .await?
            .bytes()
            .await?;
        let video_id = uuid::Uuid::new_v4();
        let (_, s3_key) = s3_service.upload_video(video_id, video).await?;
        generation.set_s3_key(s3_key);
    } else if webhook_request.status == "failed" && webhook_request.error.is_some() {
        generation.set_error(webhook_request.error.clone().unwrap());
    }

    db_service.update_generation(&generation).await?;

    Ok(HttpResponse::Ok().json(WebhookResponse {
        message: "Webhook processed successfully".to_string(),
    }))
}
