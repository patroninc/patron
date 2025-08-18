use chrono::NaiveDateTime;
use diesel::{AsChangeset, Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

use crate::schema::{generations, user_generations};

#[derive(
    Debug, Clone, Serialize, Deserialize, Insertable, Queryable, Selectable, AsChangeset, ToSchema,
)]
#[diesel(table_name = generations)]
#[schema(example = json!({
    "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "clip_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "character_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "audio_clip_id": "12345678-90ab-cdef-1234-567890abcdef",
    "s3_key": "generations/video_123.mp4",
    "status": "completed",
    "error": null,
    "prediction_id": "latentsync_pred_12345",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:05:00"
}))]
pub struct Generation {
    pub id: Uuid,
    pub clip_id: Uuid,
    pub character_id: Uuid,
    pub s3_key: Option<String>,
    pub status: String,
    pub error: Option<String>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub audio_clip_id: Uuid,
    pub prediction_id: String,
}

impl Generation {
    pub fn new(
        clip_id: Uuid,
        character_id: Uuid,
        audio_clip_id: Uuid,
        prediction_id: String,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            clip_id,
            character_id,
            audio_clip_id,
            s3_key: None,
            status: "pending".to_string(),
            error: None,
            created_at: chrono::Utc::now().naive_utc(),
            updated_at: chrono::Utc::now().naive_utc(),
            prediction_id,
        }
    }

    pub fn set_status(&mut self, status: &str) {
        self.status = status.to_string();
        self.updated_at = chrono::Utc::now().naive_utc();
    }

    pub fn set_error(&mut self, error: String) {
        self.error = Some(error);
        self.updated_at = chrono::Utc::now().naive_utc();
    }

    pub fn set_s3_key(&mut self, s3_key: String) {
        self.s3_key = Some(s3_key);
        self.updated_at = chrono::Utc::now().naive_utc();
    }
}

#[derive(
    Debug, Clone, Serialize, Deserialize, Insertable, Queryable, Selectable, AsChangeset, ToSchema,
)]
#[diesel(table_name = user_generations)]
#[schema(example = json!({
    "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "generation_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:05:00"
}))]
pub struct UserGeneration {
    pub id: Uuid,
    pub user_id: Uuid,
    pub generation_id: Uuid,
    pub created_at: Option<NaiveDateTime>,
    pub updated_at: Option<NaiveDateTime>,
}

impl UserGeneration {
    pub fn new(user_id: Uuid, generation_id: Uuid) -> Self {
        let now = chrono::Utc::now().naive_utc();
        Self {
            id: Uuid::new_v4(),
            user_id,
            generation_id,
            created_at: Some(now),
            updated_at: Some(now),
        }
    }

    pub fn update_timestamp(&mut self) {
        self.updated_at = Some(chrono::Utc::now().naive_utc());
    }
}
