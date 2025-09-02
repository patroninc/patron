use actix_web::{HttpResponse, ResponseError};
use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Standard JSON error response structure for API endpoints.
#[derive(Debug, Serialize, Deserialize, utoipa::ToSchema)]
#[schema(example = json!({
    "error": "Invalid email or password",
    "code": "AUTH_INVALID_CREDENTIALS"
}))]
pub struct ErrorResponse {
    /// Error message describing what went wrong
    #[schema(example = "Invalid email or password")]
    pub error: String,
    /// Optional error code for programmatic handling
    #[serde(skip_serializing_if = "Option::is_none")]
    #[schema(example = "AUTH_INVALID_CREDENTIALS")]
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
        Self::AwsSdk(e.to_string())
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
                Self::AwsSdk(format!("Service error: {service_error}"))
            }
            aws_sdk_s3::error::SdkError::ConstructionFailure(_)
            | aws_sdk_s3::error::SdkError::TimeoutError(_)
            | aws_sdk_s3::error::SdkError::DispatchFailure(_)
            | aws_sdk_s3::error::SdkError::ResponseError(_)
            | _ => Self::AwsSdk(err.to_string()),
        }
    }
}

impl From<diesel_async::pooled_connection::bb8::RunError> for ServiceError {
    fn from(e: diesel_async::pooled_connection::bb8::RunError) -> Self {
        Self::Database(e.to_string())
    }
}

impl From<diesel::result::Error> for ServiceError {
    fn from(e: diesel::result::Error) -> Self {
        Self::Database(e.to_string())
    }
}

impl ResponseError for ServiceError {
    /// Convert `ServiceError` into an HTTP response
    ///
    /// # Returns
    /// Returns an HTTP response with appropriate status code and error message
    fn error_response(&self) -> HttpResponse {
        let error_response = ErrorResponse {
            error: self.to_string(),
            code: None,
        };

        match *self {
            Self::NotFound(_) => HttpResponse::NotFound().json(error_response),
            Self::Config(_) => HttpResponse::BadRequest().json(error_response),
            Self::AwsSdk(_)
            | Self::Http(_)
            | Self::Unknown(_)
            | Self::SerdeJson(_)
            | Self::Io(_)
            | Self::Database(_) => HttpResponse::InternalServerError().json(error_response),
        }
    }
}
