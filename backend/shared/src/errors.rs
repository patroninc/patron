use actix_web::{HttpResponse, ResponseError};
use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Standard JSON error response structure for API endpoints.
#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
pub struct ErrorResponse {
    /// Error message describing what went wrong
    pub error: String,
    /// Optional error code for programmatic handling
    #[serde(skip_serializing_if = "Option::is_none")]
    pub code: Option<String>,
}

/// Represents all possible errors that can occur in the service layer.
#[derive(Debug, Error)]
pub enum ServiceError {
    #[error("AWS SDK error: {0}")]
    /// Represents an error returned by the AWS SDK.
    AwsSdk(String),

    /// Represents an HTTP error from the reqwest crate.
    #[error(transparent)]
    Http(#[from] reqwest::Error),

    /// Represents a JSON serialization or deserialization error.
    #[error(transparent)]
    SerdeJson(#[from] serde_json::Error),

    /// Represents an I/O error.
    #[error(transparent)]
    Io(#[from] std::io::Error),

    /// Represents an unknown error with a message.
    #[error("Unknown error: {0}")]
    Unknown(String),

    /// Represents a not found error with a message.
    #[error("Not found: {0}")]
    NotFound(String),

    /// Represents a database error with a message.
    #[error("Database error: {0}")]
    Database(String),

    /// Represents a configuration error with a message.
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
        let error_response = ErrorResponse {
            error: self.to_string(),
            code: None,
        };
        
        match self {
            ServiceError::NotFound(_) => HttpResponse::NotFound().json(error_response),
            ServiceError::Config(_) => HttpResponse::BadRequest().json(error_response),
            _ => HttpResponse::InternalServerError().json(error_response),
        }
    }
}
