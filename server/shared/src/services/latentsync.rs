use std::collections::HashMap;

use reqwest::{header, Client};
use serde::{Deserialize, Serialize};
use tracing::instrument;

use crate::errors::ServiceError;
use crate::services::config::LatentSyncConfig;

#[derive(Clone, Debug)]
pub struct LatentSyncService {
    client: Client,
    version: String,
    webhook_url: String,
}

impl LatentSyncService {
    pub fn new(config: &LatentSyncConfig) -> Result<Self, ServiceError> {
        let mut default_headers = header::HeaderMap::new();
        default_headers.insert(
            header::AUTHORIZATION,
            header::HeaderValue::from_str(&format!("Token {}", config.api_token))
                .map_err(|e| ServiceError::Unknown(e.to_string()))?,
        );
        default_headers.insert(
            header::CONTENT_TYPE,
            header::HeaderValue::from_static("application/json"),
        );

        let client = Client::builder()
            .default_headers(default_headers)
            .build()
            .map_err(ServiceError::from)?;

        Ok(Self {
            client,
            version: config.version.clone(),
            webhook_url: config.webhook_url.clone(),
        })
    }

    #[instrument(skip(self))]
    pub async fn generate_video(
        &self,
        video_url: &str,
        audio_url: &str,
        webhook_url: Option<&str>,
    ) -> Result<String, ServiceError> {
        #[derive(Serialize)]
        struct InputPayload<'a> {
            version: &'a str,
            input: HashMap<&'a str, &'a str>,
            webhook: String,
            webhook_events_filter: Vec<&'a str>,
        }

        let mut input = HashMap::new();
        input.insert("video", video_url);
        input.insert("audio", audio_url);

        let payload = InputPayload {
            version: &self.version,
            input,
            webhook: self.webhook_url.clone(),
            webhook_events_filter: vec!["completed"],
        };

        let resp = self
            .client
            .post("https://api.replicate.com/v1/predictions")
            .json(&payload)
            .send()
            .await
            .map_err(ServiceError::from)?;

        if !resp.status().is_success() {
            let status = resp.status();
            let error_body = resp
                .text()
                .await
                .unwrap_or_else(|_| "Could not read error body".to_string());
            return Err(ServiceError::Unknown(format!(
                "Replicate API Error ({status}): {error_body}"
            )));
        }

        #[derive(Deserialize)]
        struct PredictionResp {
            id: String,
        }

        let data: PredictionResp = resp.json().await.map_err(ServiceError::from)?;
        Ok(data.id)
    }
}

/// Payload posted by Replicate to our webhook.
#[derive(Deserialize, Debug)]
pub struct ReplicateWebhook {
    pub id: String,
    pub status: String,
    pub output: Option<serde_json::Value>,
    pub error: Option<String>,
}
