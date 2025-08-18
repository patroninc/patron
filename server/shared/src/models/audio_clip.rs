use chrono::NaiveDateTime;
use diesel::{Identifiable, Insertable, Queryable};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

use crate::schema::{audio_clips, user_audio_clips};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable, ToSchema)]
#[diesel(table_name = audio_clips)]
#[schema(example = json!({
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "prompt": "Hello, this is a test voice generation",
    "character_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "s3_key": "audio_clips/audio_123.mp3",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
}))]
pub struct AudioClip {
    pub id: Uuid,
    pub prompt: String,
    pub character_id: Uuid,
    pub s3_key: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

impl AudioClip {
    pub fn new(id: Uuid, prompt: String, character_id: Uuid, s3_key: String) -> Self {
        Self {
            id,
            prompt,
            character_id,
            s3_key,
            created_at: chrono::Utc::now().naive_utc(),
            updated_at: chrono::Utc::now().naive_utc(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable, ToSchema)]
#[diesel(table_name = user_audio_clips)]
#[schema(example = json!({
    "id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
    "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "audio_clip_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
}))]
pub struct UserAudioClip {
    pub id: Uuid,
    pub user_id: Uuid,
    pub audio_clip_id: Uuid,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
}

impl UserAudioClip {
    pub fn new(id: Uuid, user_id: Uuid, audio_clip_id: Uuid) -> Self {
        let now = chrono::Utc::now().naive_utc();
        Self {
            id,
            user_id,
            audio_clip_id,
            created_at: Some(now),
            updated_at: Some(now),
        }
    }
}
