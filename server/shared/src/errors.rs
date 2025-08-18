use actix_web::{HttpResponse, ResponseError};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ServiceError {
    #[error("AWS SDK error: {0}")]
    AwsSdk(String),

    #[error(transparent)]
    Http(#[from] reqwest::Error),

    #[error(transparent)]
    SerdeJson(#[from] serde_json::Error),

    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error("Unknown error: {0}")]
    Unknown(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Database error: {0}")]
    Database(String),

    #[error("Configuration error: {0}")]
    Config(String),
}

impl From<aws_sdk_s3::Error> for ServiceError {
    fn from(e: aws_sdk_s3::Error) -> Self {
        ServiceError::AwsSdk(e.to_string())
    }
}

impl<E> From<aws_sdk_s3::error::SdkError<E>> for ServiceError
where
    E: std::error::Error + Send + Sync + 'static,
{
    fn from(err: aws_sdk_s3::error::SdkError<E>) -> Self {
        match err {
            aws_sdk_s3::error::SdkError::ServiceError(context) => {
                let service_error = context.into_err();
                ServiceError::AwsSdk(format!("Service error: {service_error}"))
            }
            _ => ServiceError::AwsSdk(err.to_string()),
        }
    }
}

impl From<diesel_async::pooled_connection::bb8::RunError> for ServiceError {
    fn from(e: diesel_async::pooled_connection::bb8::RunError) -> Self {
        ServiceError::Database(e.to_string())
    }
}

impl From<diesel::result::Error> for ServiceError {
    fn from(e: diesel::result::Error) -> Self {
        ServiceError::Database(e.to_string())
    }
}

impl ResponseError for ServiceError {
    fn error_response(&self) -> HttpResponse {
        HttpResponse::InternalServerError().body(self.to_string())
    }
}
