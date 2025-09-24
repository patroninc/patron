use chrono::{DateTime, NaiveDateTime, Utc};
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

/// Database model for series table
#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, Selectable)]
#[diesel(table_name = crate::schema::series)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Series {
    /// Unique series identifier
    pub id: Uuid,
    /// ID of the user who owns this series
    #[serde(rename = "userId")]
    pub user_id: Uuid,
    /// Title of the series
    pub title: String,
    /// Description of the series content and purpose
    pub description: Option<String>,
    /// URL-friendly slug for the series
    pub slug: String,
    /// Category or genre of the series
    pub category: Option<String>,
    /// URL to the series cover image
    #[serde(rename = "coverImageUrl")]
    pub cover_image_url: Option<String>,
    /// Whether the series is published and visible to users
    #[serde(rename = "isPublished")]
    pub is_published: Option<bool>,
    /// Whether the series has monetization enabled
    #[serde(rename = "isMonetized")]
    pub is_monetized: Option<bool>,
    /// Pricing tier for the series (free, basic, premium, etc.)
    #[serde(rename = "pricingTier")]
    pub pricing_tier: Option<String>,
    /// Timestamp when the series was created
    #[serde(rename = "createdAt")]
    pub created_at: Option<NaiveDateTime>,
    /// Timestamp when the series was last updated
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<NaiveDateTime>,
    /// Timestamp when the series was soft deleted (None if not deleted)
    #[serde(rename = "deletedAt")]
    pub deleted_at: Option<NaiveDateTime>,
}

/// API response model for series
#[derive(Debug, Serialize, ToSchema)]
#[schema(example = json!({
    "id": "e5f6a7b8-9012-3456-ef01-345678901234",
    "userId": "f6a7b8c9-0123-4567-f012-456789012345",
    "title": "My Awesome Podcast",
    "description": "A weekly podcast about technology and innovation",
    "slug": "my-awesome-podcast",
    "category": "Technology",
    "coverImageUrl": "https://example.com/cover.jpg",
    "isPublished": true,
    "isMonetized": false,
    "pricingTier": "free",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
}))]
pub struct SeriesResponse {
    /// Series unique identifier
    #[schema(example = "e5f6a7b8-9012-3456-ef01-345678901234")]
    pub id: Uuid,
    /// ID of the user who owns this series
    #[schema(example = "f6a7b8c9-0123-4567-f012-456789012345")]
    #[serde(rename = "userId")]
    pub user_id: Uuid,
    /// Display name of the series
    #[schema(example = "My Awesome Podcast")]
    pub title: String,
    /// Description of the series content and purpose
    #[schema(example = "A weekly podcast about technology and innovation")]
    pub description: Option<String>,
    /// SEO-friendly URL identifier for the series
    #[schema(example = "my-awesome-podcast")]
    pub slug: String,
    /// Category or genre of the series
    #[schema(example = "Technology")]
    pub category: Option<String>,
    /// URL to the series cover image
    #[schema(example = "https://example.com/cover.jpg")]
    #[serde(rename = "coverImageUrl")]
    pub cover_image_url: Option<String>,
    /// Whether the series is published and visible to users
    #[schema(example = true)]
    #[serde(rename = "isPublished")]
    pub is_published: bool,
    /// Whether the series has monetization enabled
    #[schema(example = false)]
    #[serde(rename = "isMonetized")]
    pub is_monetized: bool,
    /// Pricing tier for the series
    #[schema(example = "free")]
    #[serde(rename = "pricingTier")]
    pub pricing_tier: String,
    /// Series creation timestamp
    #[schema(example = "2023-01-01T00:00:00Z")]
    #[serde(rename = "createdAt")]
    pub created_at: Option<DateTime<Utc>>,
    /// Series last update timestamp
    #[schema(example = "2023-01-01T12:00:00Z")]
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<DateTime<Utc>>,
}

impl From<Series> for SeriesResponse {
    fn from(series: Series) -> Self {
        Self {
            id: series.id,
            user_id: series.user_id,
            title: series.title,
            description: series.description,
            slug: series.slug,
            category: series.category,
            cover_image_url: series.cover_image_url,
            is_published: series.is_published.unwrap_or(false),
            is_monetized: series.is_monetized.unwrap_or(false),
            pricing_tier: series.pricing_tier.unwrap_or_else(|| "free".to_owned()),
            created_at: series.created_at.map(|dt| dt.and_utc()),
            updated_at: series.updated_at.map(|dt| dt.and_utc()),
        }
    }
}

/// Request model for creating a new series
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[schema(
    description = "Request payload for creating a new series with content and metadata",
    example = json!({
        "title": "My Awesome Podcast",
        "description": "A weekly podcast about technology and innovation",
        "slug": "my-awesome-podcast",
        "category": "Technology",
        "coverImageUrl": "https://example.com/cover.jpg",
        "isPublished": false,
        "isMonetized": false,
        "pricingTier": "free"
    })
)]
pub struct CreateSeriesRequest {
    /// Name for the new series being created
    #[schema(example = "My Awesome Podcast")]
    pub title: String,
    /// Description of the series content and purpose (optional)
    #[schema(example = "A weekly podcast about technology and innovation")]
    pub description: Option<String>,
    /// Unique URL path segment for the new series
    #[schema(example = "my-awesome-podcast")]
    pub slug: String,
    /// Category or genre of the series (optional)
    #[schema(example = "Technology")]
    pub category: Option<String>,
    /// Banner image URL for the series homepage
    #[schema(example = "https://example.com/cover.jpg")]
    #[serde(rename = "coverImageUrl")]
    pub cover_image_url: Option<String>,
    /// Make this series visible to the public upon creation
    #[schema(example = false)]
    #[serde(rename = "isPublished")]
    pub is_published: Option<bool>,
    /// Enable monetization features for this series
    #[schema(example = false)]
    #[serde(rename = "isMonetized")]
    pub is_monetized: Option<bool>,
    /// Subscription tier required to access the series
    #[schema(example = "free")]
    #[serde(rename = "pricingTier")]
    pub pricing_tier: Option<String>,
}

/// Request model for updating an existing series
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[schema(
    description = "Request payload for updating series content, metadata, or status",
    example = json!({
        "title": "My Updated Podcast",
        "description": "An updated description with more details",
        "slug": "my-updated-podcast",
        "category": "Technology",
        "coverImageUrl": "https://example.com/new-cover.jpg",
        "isPublished": true,
        "isMonetized": true,
        "pricingTier": "premium"
    })
)]
pub struct UpdateSeriesRequest {
    /// New title for the series (optional)
    #[schema(example = "My Updated Podcast")]
    pub title: Option<String>,
    /// Updated description of the series (optional)
    #[schema(example = "An updated description with more details")]
    pub description: Option<String>,
    /// New URL-friendly slug for the series (optional)
    #[schema(example = "my-updated-podcast")]
    pub slug: Option<String>,
    /// Updated category or genre of the series (optional)
    #[schema(example = "Technology")]
    pub category: Option<String>,
    /// Update the series banner image with a new URL
    #[schema(example = "https://example.com/new-cover.jpg")]
    #[serde(rename = "coverImageUrl")]
    pub cover_image_url: Option<String>,
    /// Change the public visibility of the series
    #[schema(example = true)]
    #[serde(rename = "isPublished")]
    pub is_published: Option<bool>,
    /// Toggle monetization features for the series
    #[schema(example = true)]
    #[serde(rename = "isMonetized")]
    pub is_monetized: Option<bool>,
    /// Modify the subscription tier requirement for the series
    #[schema(example = "premium")]
    #[serde(rename = "pricingTier")]
    pub pricing_tier: Option<String>,
}

/// Response type for series list endpoints
#[derive(Debug, Serialize, ToSchema)]
#[schema(description = "List of series with pagination support", example = json!([{
    "id": "e5f6a7b8-9012-3456-ef01-345678901234",
    "userId": "f6a7b8c9-0123-4567-f012-456789012345",
    "title": "My Awesome Podcast",
    "description": "A weekly podcast about technology and innovation",
    "slug": "my-awesome-podcast",
    "category": "Technology",
    "coverImageUrl": "https://example.com/cover.jpg",
    "isPublished": true,
    "isMonetized": false,
    "pricingTier": "free",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
}]))]
pub struct SeriesListResponse(
    /// List of series
    pub Vec<SeriesResponse>,
);

impl From<Vec<SeriesResponse>> for SeriesListResponse {
    fn from(series: Vec<SeriesResponse>) -> Self {
        Self(series)
    }
}
