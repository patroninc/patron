use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use tracing::instrument;

use crate::errors::ServiceError;
use crate::models::audio_clip::{AudioClip, UserAudioClip};

use super::DbService;

impl DbService {
    #[instrument(skip(self))]
    pub async fn insert_audio_clip(
        &self,
        audio_clip: &AudioClip,
    ) -> Result<AudioClip, ServiceError> {
        use crate::schema::audio_clips;

        let mut conn = self
            .pool
            .get()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        let result = diesel::insert_into(audio_clips::table)
            .values(audio_clip)
            .get_result(&mut conn)
            .await?;
        Ok(result)
    }

    #[instrument(skip(self))]
    pub async fn get_audio_clip(
        &self,
        audio_clip_id: &uuid::Uuid,
    ) -> Result<AudioClip, ServiceError> {
        use crate::schema::audio_clips;

        let mut conn = self
            .pool
            .get()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        let result = audio_clips::table
            .filter(audio_clips::id.eq(audio_clip_id))
            .first::<AudioClip>(&mut conn)
            .await?;
        Ok(result)
    }

    #[instrument(skip(self))]
    pub async fn insert_user_audio_clip(
        &self,
        user_audio_clip: &UserAudioClip,
    ) -> Result<UserAudioClip, ServiceError> {
        use crate::schema::user_audio_clips;

        let mut conn = self
            .pool
            .get()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        let result = diesel::insert_into(user_audio_clips::table)
            .values(user_audio_clip)
            .get_result(&mut conn)
            .await?;
        Ok(result)
    }
}
