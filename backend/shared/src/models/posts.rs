use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

/// Database model for posts table
#[derive(Debug, Serialize, Deserialize, Clone, Queryable, Insertable, Selectable)]
#[diesel(table_name = crate::schema::posts)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Post {
    /// Unique post identifier
    pub id: Uuid,
    /// ID of the series this post belongs to
    #[serde(rename = "seriesId")]
    pub series_id: Uuid,
    /// Title of the post
    pub title: String,
    /// Main content/body of the post
    pub content: String,
    /// URL-friendly slug for the post
    pub slug: String,
    /// Sequential number of this post within the series
    #[serde(rename = "postNumber")]
    pub number: i32,
    /// Whether the post is published and visible to users
    #[serde(rename = "isPublished")]
    pub is_published: Option<bool>,
    /// Whether the post requires premium access
    #[serde(rename = "isPremium")]
    pub is_premium: Option<bool>,
    /// URL to the post's thumbnail image
    #[serde(rename = "thumbnailUrl")]
    pub thumbnail_url: Option<String>,
    /// ID of associated audio file
    #[serde(rename = "audioFileId")]
    pub audio_file_id: Option<Uuid>,
    /// ID of associated video file
    #[serde(rename = "videoFileId")]
    pub video_file_id: Option<Uuid>,
    /// Timestamp when the post was created
    #[serde(rename = "createdAt")]
    pub created_at: Option<NaiveDateTime>,
    /// Timestamp when the post was last updated
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<NaiveDateTime>,
    /// Timestamp when the post was soft deleted (None if not deleted)
    #[serde(rename = "deletedAt")]
    pub deleted_at: Option<NaiveDateTime>,
}

/// API response model for posts
#[derive(Debug, Serialize, ToSchema)]
#[schema(example = json!({
    "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "seriesId": "b2c3d4e5-6f78-9012-bcde-f12345678901",
    "title": "Episode 1: Getting Started",
    "content": "Welcome to our first episode where we discuss the fundamentals...",
    "slug": "episode-1-getting-started",
    "postNumber": 1,
    "isPublished": true,
    "isPremium": false,
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "audioFileId": "c3d4e5f6-7890-1234-cdef-123456789012",
    "videoFileId": "d4e5f6a7-8901-2345-def0-234567890123",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
}))]
pub struct PostResponse {
    /// Post's unique identifier
    #[schema(example = "a1b2c3d4-5e6f-7890-abcd-ef1234567890")]
    pub id: Uuid,
    /// Parent series identifier
    #[schema(example = "b2c3d4e5-6f78-9012-bcde-f12345678901")]
    #[serde(rename = "seriesId")]
    pub series_id: Uuid,
    /// Post display title
    #[schema(example = "Episode 1: Getting Started")]
    pub title: String,
    /// Post body text and content
    #[schema(example = "Welcome to our first episode where we discuss the fundamentals...")]
    pub content: String,
    /// SEO-friendly URL identifier for the post
    #[schema(example = "episode-1-getting-started")]
    pub slug: String,
    /// Position number for ordering this post within its parent series
    #[schema(example = 1)]
    #[serde(rename = "postNumber")]
    pub number: i32,
    /// Whether the post is published and visible to users
    #[schema(example = true)]
    #[serde(rename = "isPublished")]
    pub is_published: bool,
    /// Whether the post requires premium access
    #[schema(example = false)]
    #[serde(rename = "isPremium")]
    pub is_premium: bool,
    /// URL to the post's thumbnail image
    #[schema(example = "https://example.com/thumbnail.jpg")]
    #[serde(rename = "thumbnailUrl")]
    pub thumbnail_url: Option<String>,
    /// ID of associated audio file
    #[schema(example = "c3d4e5f6-7890-1234-cdef-123456789012")]
    #[serde(rename = "audioFileId")]
    pub audio_file_id: Option<Uuid>,
    /// ID of associated video file
    #[schema(example = "d4e5f6a7-8901-2345-def0-234567890123")]
    #[serde(rename = "videoFileId")]
    pub video_file_id: Option<Uuid>,
    /// Post creation timestamp
    #[schema(example = "2023-01-01T00:00:00Z")]
    #[serde(rename = "createdAt")]
    pub created_at: Option<NaiveDateTime>,
    /// Post last update timestamp
    #[schema(example = "2023-01-01T12:00:00Z")]
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<NaiveDateTime>,
}

impl From<Post> for PostResponse {
    fn from(post: Post) -> Self {
        Self {
            id: post.id,
            series_id: post.series_id,
            title: post.title,
            content: post.content,
            slug: post.slug,
            number: post.number,
            is_published: post.is_published.unwrap_or(false),
            is_premium: post.is_premium.unwrap_or(false),
            thumbnail_url: post.thumbnail_url,
            audio_file_id: post.audio_file_id,
            video_file_id: post.video_file_id,
            created_at: post.created_at,
            updated_at: post.updated_at,
        }
    }
}

/// Request model for creating a new post
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[schema(
    description = "Request payload for creating a new post with content and metadata",
    example = json!({
        "seriesId": "b2c3d4e5-6f78-9012-bcde-f12345678901",
        "title": "Episode 1: Getting Started",
        "content": "Welcome to our first episode where we discuss the fundamentals...",
        "slug": "episode-1-getting-started",
        "postNumber": 1,
        "isPublished": false,
        "isPremium": false,
        "thumbnailUrl": "https://example.com/thumbnail.jpg",
        "audioFileId": "c3d4e5f6-7890-1234-cdef-123456789012",
        "videoFileId": "d4e5f6a7-8901-2345-def0-234567890123"
    })
)]
pub struct CreatePostRequest {
    /// Series to add this post to
    #[schema(example = "b2c3d4e5-6f78-9012-bcde-f12345678901")]
    #[serde(rename = "seriesId")]
    pub series_id: Uuid,
    /// Post title for display
    #[schema(example = "Episode 1: Getting Started")]
    pub title: String,
    /// Full content of the post
    #[schema(example = "Welcome to our first episode where we discuss the fundamentals...")]
    pub content: String,
    /// Unique URL path segment for the new post
    #[schema(example = "episode-1-getting-started")]
    pub slug: String,
    /// Episode or post number for sequencing content within the series
    #[schema(example = 1)]
    #[serde(rename = "postNumber")]
    pub number: i32,
    /// Publish this post immediately upon creation
    #[schema(example = false)]
    #[serde(rename = "isPublished")]
    pub is_published: Option<bool>,
    /// Restrict this post to premium subscribers only
    #[schema(example = false)]
    #[serde(rename = "isPremium")]
    pub is_premium: Option<bool>,
    /// Cover image URL for the post preview
    #[schema(example = "https://example.com/thumbnail.jpg")]
    #[serde(rename = "thumbnailUrl")]
    pub thumbnail_url: Option<String>,
    /// Optional audio file attachment for the post
    #[schema(example = "c3d4e5f6-7890-1234-cdef-123456789012")]
    #[serde(rename = "audioFileId")]
    pub audio_file_id: Option<Uuid>,
    /// Optional video file attachment for the post
    #[schema(example = "d4e5f6a7-8901-2345-def0-234567890123")]
    #[serde(rename = "videoFileId")]
    pub video_file_id: Option<Uuid>,
}

/// Request model for updating an existing post
#[derive(Debug, Serialize, Deserialize, ToSchema)]
#[schema(
    description = "Request payload for updating post content, metadata, or status",
    example = json!({
        "title": "Episode 1: Getting Started (Updated)",
        "content": "Updated content for the first episode with more details...",
        "slug": "episode-1-updated",
        "postNumber": 2,
        "isPublished": true,
        "isPremium": true,
        "thumbnailUrl": "https://example.com/new-thumbnail.jpg",
        "audioFileId": "c3d4e5f6-7890-1234-cdef-123456789012",
        "videoFileId": "d4e5f6a7-8901-2345-def0-234567890123"
    })
)]
pub struct UpdatePostRequest {
    /// New title for the post (optional)
    #[schema(example = "Episode 1: Getting Started (Updated)")]
    pub title: Option<String>,
    /// Updated post content text (optional)
    #[schema(example = "Updated content for the first episode with more details...")]
    pub content: Option<String>,
    /// New URL-friendly slug for the post (optional)
    #[schema(example = "episode-1-updated")]
    pub slug: Option<String>,
    /// Updated sequential number within the series (optional)
    #[schema(example = 2)]
    #[serde(rename = "postNumber")]
    pub number: Option<i32>,
    /// Change the publication visibility of this post
    #[schema(example = true)]
    #[serde(rename = "isPublished")]
    pub is_published: Option<bool>,
    /// Modify premium subscription requirement for this post
    #[schema(example = true)]
    #[serde(rename = "isPremium")]
    pub is_premium: Option<bool>,
    /// Replace the post's cover image with a new URL
    #[schema(example = "https://example.com/new-thumbnail.jpg")]
    #[serde(rename = "thumbnailUrl")]
    pub thumbnail_url: Option<String>,
    /// Updated audio file reference for the post
    #[schema(example = "c3d4e5f6-7890-1234-cdef-123456789012")]
    #[serde(rename = "audioFileId")]
    pub audio_file_id: Option<Uuid>,
    /// Updated video file reference for the post
    #[schema(example = "d4e5f6a7-8901-2345-def0-234567890123")]
    #[serde(rename = "videoFileId")]
    pub video_file_id: Option<Uuid>,
}

/// Response type for posts list endpoints
#[derive(Debug, Serialize, ToSchema)]
#[schema(description = "List of posts with pagination support", example = json!([{
    "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "seriesId": "b2c3d4e5-6f78-9012-bcde-f12345678901",
    "title": "Episode 1: Getting Started",
    "content": "Welcome to our first episode where we discuss the fundamentals...",
    "slug": "episode-1-getting-started",
    "postNumber": 1,
    "isPublished": true,
    "isPremium": false,
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "audioFileId": "c3d4e5f6-7890-1234-cdef-123456789012",
    "videoFileId": "d4e5f6a7-8901-2345-def0-234567890123",
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
}]))]
pub struct PostsListResponse(
    /// List of posts
    pub Vec<PostResponse>,
);

impl From<Vec<PostResponse>> for PostsListResponse {
    fn from(posts: Vec<PostResponse>) -> Self {
        Self(posts)
    }
}
