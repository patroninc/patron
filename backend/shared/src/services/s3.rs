use crate::errors::ServiceError;
use crate::services::config::AwsConfig;
use aws_config::Region;
use aws_credential_types::Credentials;
use aws_sdk_s3::{presigning::PresigningConfig, primitives::ByteStream, Client};
use aws_types::sdk_config::SdkConfig;
use bytes::Bytes;
use futures_util::stream::{Stream, StreamExt};
use std::pin::Pin;
use tokio_util::io::ReaderStream;
use tracing::instrument;

type S3ObjectStream = Pin<Box<dyn Stream<Item = Result<Bytes, ServiceError>> + Send>>;

/// Service for interacting with AWS S3
#[derive(Clone, Debug)]
pub struct S3Service {
    /// AWS S3 client
    pub client: Client,
    /// S3 bucket name
    pub bucket: String,
}

impl S3Service {
    /// Create a new `S3Service` instance using AWS configuration
    ///
    /// # Errors
    /// Returns a `ServiceError` if AWS configuration is invalid
    pub async fn new(aws_config: AwsConfig) -> Result<Self, ServiceError> {
        let credentials = Credentials::new(
            &aws_config.access_key_id,
            &aws_config.secret_access_key,
            None,
            None,
            "patron-app",
        );

        // Create a minimal SDK config with behavior version and credentials
        let sdk_config = SdkConfig::builder()
            .credentials_provider(credentials)
            .region(Region::new(aws_config.region.clone()))
            .build();

        let mut s3_config_builder = aws_sdk_s3::config::Builder::from(&sdk_config);

        if let Some(ref endpoint) = aws_config.s3_host {
            let endpoint_url =
                if endpoint.starts_with("http://") || endpoint.starts_with("https://") {
                    endpoint.clone()
                } else {
                    format!("https://{endpoint}")
                };
            s3_config_builder = s3_config_builder
                .endpoint_url(endpoint_url)
                .force_path_style(true);
        }

        let s3_config = s3_config_builder.build();
        let client = Client::from_conf(s3_config);

        Ok(Self {
            client,
            bucket: aws_config.s3_bucket,
        })
    }

    /// Upload an object to S3 and return a presigned URL
    ///
    /// # Errors
    /// Returns a `ServiceError` if the S3 upload fails or presigned URL generation fails
    #[instrument(skip_all, fields(key = %key, bucket = %self.bucket))]
    pub async fn put_object(&self, key: &str, bytes: Vec<u8>) -> Result<String, ServiceError> {
        let _ = self
            .client
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
            .to_owned();
        Ok(url)
    }

    /// Upload an audio clip to S3 and return the URL and key
    ///
    /// # Errors
    /// Returns a `ServiceError` if the S3 upload or presigned URL generation fails
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

    /// Upload a video to S3 and return the URL and key
    ///
    /// # Errors
    /// Returns a `ServiceError` if the S3 upload or presigned URL generation fails
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

    /// Generate a presigned URL for getting an object from S3
    ///
    /// # Errors
    /// Returns a `ServiceError` if presigned URL generation fails
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
            .to_owned();
        Ok(url)
    }

    /// Get an object from S3 as a stream
    ///
    /// # Errors
    pub async fn get_object_stream(&self, key: &str) -> Result<S3ObjectStream, ServiceError> {
        let response = self
            .client
            .get_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await?;
        let stream = ReaderStream::new(response.body.into_async_read())
            .map(|result| result.map_err(|e| ServiceError::AwsSdk(e.to_string())));

        Ok(Box::pin(stream))
    }

    /// Deletes an object from the bucket.
    ///
    /// # Errors
    /// Returns a `ServiceError` if the S3 delete operation fails
    #[instrument(skip_all, fields(key = %key, bucket = %self.bucket))]
    pub async fn delete_object(&self, key: &str) -> Result<(), ServiceError> {
        let _ = self
            .client
            .delete_object()
            .bucket(&self.bucket)
            .key(key)
            .send()
            .await?;
        Ok(())
    }
}
