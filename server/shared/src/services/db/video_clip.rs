use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use tracing::instrument;

use crate::errors::ServiceError;
use crate::models::clips::Clip;

use super::DbService;

impl DbService {
    #[instrument(skip(self))]
    pub async fn get_clip(&self, clip_id: &uuid::Uuid) -> Result<Clip, ServiceError> {
        use crate::schema::clips;

        let mut conn = self
            .pool
            .get()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        let result = clips::table
            .select(Clip::as_select())
            .filter(clips::id.eq(clip_id))
            .first::<Clip>(&mut conn)
            .await?;
        Ok(result)
    }

    #[instrument(skip(self))]
    pub async fn get_clips_for_character(&self, character_id: &uuid::Uuid) -> Result<Vec<Clip>, ServiceError> {
        use crate::schema::clips;

        let mut conn = self
            .pool
            .get()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        let result = clips::table
            .select(Clip::as_select())
            .filter(clips::celeb_id.eq(character_id))
            .load::<Clip>(&mut conn)
            .await?;
        Ok(result)
    }
}
