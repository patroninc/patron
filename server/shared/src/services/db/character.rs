use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use tracing::instrument;

use crate::errors::ServiceError;
use crate::models::character::Character;

use super::DbService;

impl DbService {
    #[instrument(skip(self))]
    pub async fn get_character(
        &self,
        character_id: &uuid::Uuid,
    ) -> Result<Character, ServiceError> {
        use crate::schema::characters;

        let mut conn = self
            .pool
            .get()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        let result = characters::table
            .filter(characters::id.eq(character_id))
            .select(Character::as_select())
            .first::<Character>(&mut conn)
            .await?;
        Ok(result)
    }

    #[instrument(skip(self))]
    pub async fn get_all_characters(&self) -> Result<Vec<Character>, ServiceError> {
        use crate::schema::characters;

        let mut conn = self
            .pool
            .get()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        let result = characters::table
            .select(Character::as_select())
            .load::<Character>(&mut conn)
            .await?;
        Ok(result)
    }
}
