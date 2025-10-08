use chrono::NaiveDateTime;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Represents the length (post count) for a series
#[derive(Debug, Clone, Copy, Serialize, Deserialize, Queryable, Insertable, AsChangeset)]
#[diesel(table_name = crate::schema::series_length)]
pub struct SeriesLength {
    /// Unique identifier for this series length record
    pub id: Uuid,
    /// ID of the series this length record belongs to
    pub series_id: Uuid,
    /// Total number of non-deleted posts in the series
    pub length: i32,
    /// Timestamp when this record was last updated
    pub updated_at: Option<NaiveDateTime>,
}

impl SeriesLength {
    /// Create a new SeriesLength instance
    pub fn new(series_id: Uuid, length: i32) -> Self {
        Self {
            id: Uuid::new_v4(),
            series_id,
            length,
            updated_at: None,
        }
    }
}
