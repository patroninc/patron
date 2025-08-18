use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

use crate::schema::clips;

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, Queryable, Selectable, ToSchema)]
#[diesel(table_name = clips)]
#[schema(example = json!({
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "s3_key": "clips/peter_griffin_dance.mp4",
    "celeb_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
}))]
pub struct Clip {
    pub id: Uuid,
    pub s3_key: String,
    pub celeb_id: Uuid,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}
