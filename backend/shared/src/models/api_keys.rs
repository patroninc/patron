use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

/// Database model for `api_keys` table
#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, Selectable)]
#[diesel(table_name = crate::schema::api_keys)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct ApiKey {
    /// Unique API key identifier
    pub id: Uuid,
    /// ID of the user who owns this API key
    #[serde(rename = "userId")]
    pub user_id: Uuid,
    /// Display name assigned to this API key
    pub name: String,
    /// Hashed version of the API key (for security)
    #[serde(skip_serializing)]
    pub key_hash: String,
    /// First few characters of the key for identification
    #[serde(rename = "keyPrefix")]
    pub key_prefix: String,
    /// Array of permissions this key has
    pub permissions: Option<Vec<Option<String>>>,
    /// Timestamp when the key was last used
    #[serde(rename = "lastUsedAt")]
    pub last_used_at: Option<NaiveDateTime>,
    /// Date when this API key becomes invalid
    #[serde(rename = "expiresAt")]
    pub expires_at: Option<NaiveDateTime>,
    /// Whether the API key is currently active
    #[serde(rename = "isActive")]
    pub is_active: bool,
    /// Timestamp when the API key was created
    #[serde(rename = "createdAt")]
    pub created_at: Option<NaiveDateTime>,
    /// Timestamp when the API key was last updated
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<NaiveDateTime>,
}

/// API response model for API keys (excludes sensitive hash)
#[derive(Debug, Serialize, ToSchema)]
#[schema(example = json!({
    "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "userId": "b2c3d4e5-6f78-9012-bcde-f12345678901",
    "name": "Production API Key",
    "keyPrefix": "pk_live_",
    "permissions": ["read:posts", "write:posts"],
    "lastUsedAt": "2023-01-01T12:00:00Z",
    "expiresAt": "2024-01-01T00:00:00Z",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
}))]
pub struct ApiKeyResponse {
    /// Unique identifier for this API key in responses
    #[schema(example = "a1b2c3d4-5e6f-7890-abcd-ef1234567890")]
    pub id: Uuid,
    /// Owner user identifier
    #[schema(example = "b2c3d4e5-6f78-9012-bcde-f12345678901")]
    #[serde(rename = "userId")]
    pub user_id: Uuid,
    /// Descriptive name for this API key
    #[schema(example = "Production API Key")]
    pub name: String,
    /// Key prefix for visual identification in API key lists
    #[schema(example = "pk_live_")]
    #[serde(rename = "keyPrefix")]
    pub key_prefix: String,
    /// Permissions granted to this API key for resource access
    #[schema(example = json!(["read:posts", "write:posts"]))]
    pub permissions: Vec<String>,
    /// Timestamp when the key was last used
    #[schema(example = "2023-01-01T12:00:00Z")]
    #[serde(rename = "lastUsedAt")]
    pub last_used_at: Option<NaiveDateTime>,
    /// Expiration timestamp after which key becomes invalid
    #[schema(example = "2024-01-01T00:00:00Z")]
    #[serde(rename = "expiresAt")]
    pub expires_at: Option<NaiveDateTime>,
    /// Current activation status of this API key
    #[schema(example = true)]
    #[serde(rename = "isActive")]
    pub is_active: bool,
    /// When this API key was originally created
    #[schema(example = "2023-01-01T00:00:00Z")]
    #[serde(rename = "createdAt")]
    pub created_at: Option<NaiveDateTime>,
    /// API key last update timestamp
    #[schema(example = "2023-01-01T12:00:00Z")]
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<NaiveDateTime>,
}

impl From<ApiKey> for ApiKeyResponse {
    fn from(api_key: ApiKey) -> Self {
        Self {
            id: api_key.id,
            user_id: api_key.user_id,
            name: api_key.name,
            key_prefix: api_key.key_prefix,
            permissions: api_key
                .permissions
                .unwrap_or_default()
                .into_iter()
                .flatten()
                .collect(),
            last_used_at: api_key.last_used_at,
            expires_at: api_key.expires_at,
            is_active: api_key.is_active,
            created_at: api_key.created_at,
            updated_at: api_key.updated_at,
        }
    }
}

/// Request model for creating a new API key
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[schema(
    description = "Request payload for creating a new API key",
    example = json!({
        "name": "Production API Key",
        "permissions": ["read:posts", "write:posts"],
        "expiresAt": "2024-01-01T00:00:00Z"
    })
)]
pub struct CreateApiKeyRequest {
    /// Name identifier for the new API key
    #[schema(example = "Production API Key")]
    pub name: String,
    /// Array of permissions to grant to this key
    #[schema(example = json!(["read:posts", "write:posts"]))]
    pub permissions: Option<Vec<String>>,
    /// When the API key should expire (optional)
    #[schema(example = "2024-01-01T00:00:00Z")]
    #[serde(rename = "expiresAt")]
    pub expires_at: Option<NaiveDateTime>,
}

/// Response when creating a new API key (includes the actual key)
#[derive(Debug, Serialize, ToSchema)]
#[schema(
    description = "Response when creating a new API key - includes the actual key value",
    example = json!({
        "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "name": "Production API Key",
        "key": "pk_live_1234567890abcdef",
        "keyPrefix": "pk_live_",
        "permissions": ["read:posts", "write:posts"],
        "expiresAt": "2024-01-01T00:00:00Z",
        "isActive": true,
        "createdAt": "2023-01-01T00:00:00Z"
    })
)]
pub struct CreateApiKeyResponse {
    /// UUID of the newly created API key
    #[schema(example = "a1b2c3d4-5e6f-7890-abcd-ef1234567890")]
    pub id: Uuid,
    /// Display name shown for this API key
    #[schema(example = "Production API Key")]
    pub name: String,
    /// The actual API key value (only shown once during creation)
    #[schema(example = "pk_live_1234567890abcdef")]
    pub key: String,
    /// Prefix portion of the newly generated key
    #[schema(example = "pk_live_")]
    #[serde(rename = "keyPrefix")]
    pub key_prefix: String,
    /// Permissions assigned to the new API key
    #[schema(example = json!(["read:posts", "write:posts"]))]
    pub permissions: Vec<String>,
    /// Key expiration date (when provided)
    #[schema(example = "2024-01-01T00:00:00Z")]
    #[serde(rename = "expiresAt")]
    pub expires_at: Option<NaiveDateTime>,
    /// Initial active status of the new API key
    #[schema(example = true)]
    #[serde(rename = "isActive")]
    pub is_active: bool,
    /// Timestamp of when the API key was just created
    #[schema(example = "2023-01-01T00:00:00Z")]
    #[serde(rename = "createdAt")]
    pub created_at: Option<NaiveDateTime>,
}

/// Request model for updating an existing API key
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[schema(
    description = "Request payload for updating an API key",
    example = json!({
        "name": "Updated API Key Name",
        "permissions": ["read:posts"],
        "isActive": false,
        "expiresAt": "2024-06-01T00:00:00Z"
    })
)]
pub struct UpdateApiKeyRequest {
    /// New name for the API key (optional)
    #[schema(example = "Updated API Key Name")]
    pub name: Option<String>,
    /// Updated permissions array (optional)
    #[schema(example = json!(["read:posts"]))]
    pub permissions: Option<Vec<String>>,
    /// Change the active status of the key
    #[schema(example = false)]
    #[serde(rename = "isActive")]
    pub is_active: Option<bool>,
    /// Update the expiration date
    #[schema(example = "2024-06-01T00:00:00Z")]
    #[serde(rename = "expiresAt")]
    pub expires_at: Option<NaiveDateTime>,
}

/// Response type for API keys list endpoints
#[derive(Debug, Serialize, ToSchema)]
#[schema(description = "List of API keys for a user", example = json!([{
    "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "userId": "b2c3d4e5-6f78-9012-bcde-f12345678901",
    "name": "Production API Key",
    "keyPrefix": "pk_live_",
    "permissions": ["read:posts", "write:posts"],
    "lastUsedAt": "2023-01-01T12:00:00Z",
    "expiresAt": "2024-01-01T00:00:00Z",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
}]))]
pub struct ApiKeysListResponse(
    /// List of API keys
    pub Vec<ApiKeyResponse>,
);

impl From<Vec<ApiKeyResponse>> for ApiKeysListResponse {
    fn from(api_keys: Vec<ApiKeyResponse>) -> Self {
        Self(api_keys)
    }
}
