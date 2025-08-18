use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable, Selectable};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

use crate::schema::characters;

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, Queryable, Selectable, ToSchema)]
#[diesel(table_name = characters)]
#[schema(example = json!({
    "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "name": "Peter Griffin",
    "voice_id": "EXAVITQu4vr4xnSDxMaL",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
}))]
pub struct Character {
    pub id: Uuid,
    pub name: String,
    pub voice_id: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}
