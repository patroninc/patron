use crate::errors::ServiceError;
use aws_sdk_s3::{presigning::PresigningConfig, primitives::ByteStream, Client};
use bytes::Bytes;
use tracing::instrument;

#[derive(Clone, Debug)]
pub struct S3Service {
    client: Client,
    bucket: String,
}

impl S3Service {
    pub async fn new(bucket: impl Into<String>) -> Result<Self, ServiceError> {
        let config = aws_config::load_from_env().await;
        let client = Client::new(&config);
        Ok(Self {
            client,
            bucket: bucket.into(),
        })
    }

    #[instrument(skip_all, fields(key = %key, bucket = %self.bucket))]
    pub async fn put_object(&self, key: &str, bytes: Vec<u8>) -> Result<String, ServiceError> {
        self.client
            .put_object()
            .bucket(&self.bucket)
            .key(key)
            .body(ByteStream::from(bytes))
            .send()
            .await?;
        let url = self
            .client
            .get_object()
            .bucket(&self.bucket)
            .key(key)
            .presigned(
                PresigningConfig::expires_in(std::time::Duration::from_secs(3600))
                    .map_err(|e| ServiceError::AwsSdk(e.to_string()))?,
            )
            .await?
            .uri()
            .to_string();
        Ok(url)
    }

    #[instrument(skip_all, fields(id = %id, bucket = %self.bucket))]
    pub async fn upload_audio_clip(
        &self,
        id: uuid::Uuid,
        audio_file: Bytes,
    ) -> Result<(String, String), ServiceError> {
        let key = format!("audio_clips/{id}.mp3");
        let url = self.put_object(&key, audio_file.to_vec()).await?;
        Ok((url, key))
    }

    #[instrument(skip_all, fields(id = %id, bucket = %self.bucket))]
    pub async fn upload_video(
        &self,
        id: uuid::Uuid,
        video: Bytes,
    ) -> Result<(String, String), ServiceError> {
        let key = format!("videos/{id}.mp4");
        let url = self.put_object(&key, video.to_vec()).await?;
        Ok((url, key))
    }

    #[instrument(skip_all, fields(key = %key, bucket = %self.bucket))]
    pub async fn get_presigned_url(
        &self,
        key: &str,
        expires_in: u64,
    ) -> Result<String, ServiceError> {
        let url = self
            .client
            .get_object()
            .bucket(&self.bucket)
            .key(key)
            .presigned(
                PresigningConfig::expires_in(std::time::Duration::from_secs(expires_in))
                    .map_err(|e| ServiceError::AwsSdk(e.to_string()))?,
            )
            .await?
            .uri()
            .to_string();
        Ok(url)
    }

    /// Deletes an object from the bucket.
    #[instrument(skip_all, fields(key = %key, bucket = %self.bucket))]
    pub async fn delete_object(&self, key: &str) -> Result<(), ServiceError> {
        self.client
            .delete_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await?;
        Ok(())
    }
}
