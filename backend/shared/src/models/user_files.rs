use crate::schema::user_files;
use chrono::{DateTime, NaiveDateTime, Utc};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use utoipa::ToSchema;

/// File processing status for user uploaded files
#[derive(Debug, Clone, Copy, Serialize, Deserialize, ToSchema)]
pub enum FileStatus {
    /// File has been uploaded and is ready
    #[serde(rename = "uploaded")]
    Uploaded,
    /// File is currently being processed
    #[serde(rename = "processing")]
    Processing,
    /// File has been successfully processed
    #[serde(rename = "processed")]
    Processed,
    /// File processing failed
    #[serde(rename = "failed")]
    Failed,
    /// File has been deleted (soft delete)
    #[serde(rename = "deleted")]
    Deleted,
}

impl From<String> for FileStatus {
    #[inline]
    fn from(s: String) -> Self {
        match s.as_str() {
            "processing" => Self::Processing,
            "processed" => Self::Processed,
            "failed" => Self::Failed,
            "deleted" => Self::Deleted,
            _ => Self::Uploaded,
        }
    }
}

impl From<FileStatus> for String {
    #[inline]
    fn from(status: FileStatus) -> Self {
        match status {
            FileStatus::Uploaded => "uploaded".to_owned(),
            FileStatus::Processing => "processing".to_owned(),
            FileStatus::Processed => "processed".to_owned(),
            FileStatus::Failed => "failed".to_owned(),
            FileStatus::Deleted => "deleted".to_owned(),
        }
    }
}

/// User file entity representing a file uploaded by a user
#[derive(Debug, Clone, Serialize, Deserialize, Insertable, Queryable, Selectable, ToSchema)]
#[diesel(table_name = user_files)]
pub struct UserFile {
    /// Unique file identifier
    pub id: uuid::Uuid,
    /// ID of the user who owns this file
    pub user_id: uuid::Uuid,
    /// Current filename (may be sanitized for storage)
    pub filename: String,
    /// Original filename as provided by the user
    pub original_filename: String,
    /// Storage path where the file is located
    pub file_path: String,
    /// Size of the file in bytes
    pub file_size: i64,
    /// MIME type of the file
    pub mime_type: String,
    /// SHA-256 hash of the file for integrity and deduplication
    pub file_hash: String,
    /// Current processing status of the file
    pub status: String,
    /// Additional metadata stored as JSON
    pub metadata: Option<JsonValue>,
    /// Timestamp when the file was uploaded
    pub created_at: Option<NaiveDateTime>,
    /// Timestamp when the file was last updated
    pub updated_at: Option<NaiveDateTime>,
    /// Timestamp when the file was soft deleted (None if not deleted)
    pub deleted_at: Option<NaiveDateTime>,
}

/// User file information for API responses
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[schema(example = json!({
    "id": "b8c9d0e1-2345-6789-b234-678901234567",
    "userId": "c9d0e1f2-3456-789a-c345-789012345678",
    "filename": "document.pdf",
    "originalFilename": "My Important Document.pdf",
    "fileSize": 1_048_576,
    "mimeType": "application/pdf",
    "fileHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "status": "uploaded",
    "metadata": {"width": 1920, "height": 1080},
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
}))]
pub struct UserFileInfo {
    /// File's unique identifier
    #[schema(example = "b8c9d0e1-2345-6789-b234-678901234567")]
    pub id: uuid::Uuid,
    /// ID of the user who owns this file
    #[schema(example = "c9d0e1f2-3456-789a-c345-789012345678")]
    #[serde(rename = "userId")]
    pub user_id: uuid::Uuid,
    /// Current filename
    #[schema(example = "document.pdf")]
    pub filename: String,
    /// Original filename as uploaded by user
    #[schema(example = "My Important Document.pdf")]
    #[serde(rename = "originalFilename")]
    pub original_filename: String,
    /// Size of the file in bytes
    #[schema(example = 1_048_576)]
    #[serde(rename = "fileSize")]
    pub file_size: i64,
    /// MIME type of the file
    #[schema(example = "application/pdf")]
    #[serde(rename = "mimeType")]
    pub mime_type: String,
    /// SHA-256 hash of the file
    #[schema(example = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")]
    #[serde(rename = "fileHash")]
    pub file_hash: String,
    /// Current processing status
    #[schema(example = "uploaded")]
    pub status: FileStatus,
    /// Additional file metadata
    #[schema(example = json!({"width": 1920, "height": 1080}))]
    pub metadata: Option<JsonValue>,
    /// File upload timestamp
    #[schema(example = "2023-01-01T00:00:00Z")]
    #[serde(rename = "createdAt")]
    pub created_at: Option<DateTime<Utc>>,
    /// File last update timestamp
    #[schema(example = "2023-01-01T00:00:00Z")]
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<DateTime<Utc>>,
}

impl From<UserFile> for UserFileInfo {
    #[inline]
    fn from(file: UserFile) -> Self {
        Self {
            id: file.id,
            user_id: file.user_id,
            filename: file.filename,
            original_filename: file.original_filename,
            file_size: file.file_size,
            mime_type: file.mime_type,
            file_hash: file.file_hash,
            status: file.status.into(),
            metadata: file.metadata,
            created_at: file.created_at.map(|dt| dt.and_utc()),
            updated_at: file.updated_at.map(|dt| dt.and_utc()),
        }
    }
}

/// Request payload for creating a new user file entry
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[schema(
    description = "Request payload for creating a new user file entry with metadata",
    example = json!({
    "original_filename": "My Important Document.pdf",
    "mime_type": "application/pdf",
    "file_size": 1_048_576,
    "metadata": {"description": "Important business document"}
}))]
pub struct CreateUserFileRequest {
    /// Original filename as provided by the user
    #[schema(example = "My Important Document.pdf")]
    pub original_filename: String,
    /// MIME type of the file
    #[schema(example = "application/pdf")]
    pub mime_type: String,
    /// Size of the file in bytes
    #[schema(example = 1_048_576)]
    pub file_size: i64,
    /// Optional metadata for the file
    #[schema(example = json!({"description": "Important business document"}))]
    pub metadata: Option<JsonValue>,
}

/// Request payload for updating user file information
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[schema(
    description = "Request payload for updating user file metadata, filename, or status",
    example = json!({
    "filename": "renamed_document.pdf",
    "status": "processed",
    "metadata": {"processed_at": "2023-01-01T12:00:00Z"}
}))]
pub struct UpdateUserFileRequest {
    /// New filename (optional)
    #[schema(example = "renamed_document.pdf")]
    pub filename: Option<String>,
    /// New status (optional)
    #[schema(example = "processed")]
    pub status: Option<FileStatus>,
    /// Updated metadata (optional)
    #[schema(example = json!({"processed_at": "2023-01-01T12:00:00Z"}))]
    #[serde(default, deserialize_with = "deserialize_explicit_null")]
    pub metadata: Option<JsonValue>,
}

/// Type alias for user file information responses returned by the API
pub type UserFileResponse = UserFileInfo;

/// List of user files returned by file listing endpoints
#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
#[schema(
    title = "UserFilesResponse",
    description = "Collection of user files with metadata",
    example = json!([
        {
            "id": "b8c9d0e1-2345-6789-b234-678901234567",
            "userId": "c9d0e1f2-3456-789a-c345-789012345678",
            "filename": "document.pdf",
            "originalFilename": "My Important Document.pdf",
            "fileSize": 1_048_576,
            "mimeType": "application/pdf",
            "fileHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "status": "uploaded",
            "metadata": {"description": "Important document"},
            "createdAt": "2023-01-01T00:00:00Z",
            "updatedAt": "2023-01-01T00:00:00Z"
        }
    ])
)]
pub struct UserFilesResponse(pub Vec<UserFileInfo>);

impl From<Vec<UserFileInfo>> for UserFilesResponse {
    fn from(files: Vec<UserFileInfo>) -> Self {
        Self(files)
    }
}

impl FromIterator<UserFileInfo> for UserFilesResponse {
    fn from_iter<T: IntoIterator<Item = UserFileInfo>>(iter: T) -> Self {
        Self(iter.into_iter().collect())
    }
}

/// Custom deserializer that preserves the distinction between missing fields and explicit nulls
fn deserialize_explicit_null<'de, D>(deserializer: D) -> Result<Option<JsonValue>, D::Error>
where
    D: serde::Deserializer<'de>,
{
    use serde::de::Deserialize;

    // When the field is missing, default() is called which returns None
    // When the field is present (even if null), we deserialize it as Some(JsonValue)
    match JsonValue::deserialize(deserializer) {
        Ok(value) => Ok(Some(value)),
        Err(e) => {
            // If deserialization fails and it's because of a null,
            // we still want to return Some(JsonValue::Null)
            if e.to_string().contains("null") {
                Ok(Some(JsonValue::Null))
            } else {
                Err(e)
            }
        }
    }
}
