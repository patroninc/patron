use crate::errors::ServiceError;
use bytes::Bytes;
use reqwest::{header, Client};
use tracing::instrument;

#[derive(Clone, Debug)]
pub struct ElevenLabsService {
    client: Client,
}

impl ElevenLabsService {
    /// Create a new service and immediately pull custom voices into memory.
    pub fn new(api_key: &str) -> Result<Self, ServiceError> {
        let mut default_headers = header::HeaderMap::new();
        default_headers.insert(
            "xi-api-key",
            header::HeaderValue::from_str(api_key)
                .map_err(|e| ServiceError::Unknown(e.to_string()))?,
        );
        let client = Client::builder().default_headers(default_headers).build()?;

        let service = Self { client };

        Ok(service)
    }

    #[instrument(skip(self, text))]
    pub async fn tts(&self, voice_id: &str, text: &str) -> Result<Bytes, ServiceError> {
        #[derive(serde::Serialize)]
        struct TtsBody<'a> {
            text: &'a str,
            model_id: &'a str,
        }

        let body = TtsBody {
            text,
            model_id: "eleven_multilingual_v2",
        };

        let url = format!("https://api.elevenlabs.io/v1/text-to-speech/{voice_id}");

        let resp = self.client.post(url).json(&body).send().await?;

        if !resp.status().is_success() {
            let error_body = resp.text().await?;
            return Err(ServiceError::Unknown(format!(
                "ElevenLabs API Error: {error_body}",
            )));
        }

        let bytes = resp.bytes().await?;
        Ok(bytes)
    }
}
