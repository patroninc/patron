use super::DbService;
use crate::errors::ServiceError;
use crate::models::generation::{Generation, UserGeneration};
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use tracing::instrument;

impl DbService {
    pub async fn get_generation(
        &self,
        generation_id: &uuid::Uuid,
    ) -> Result<Generation, ServiceError> {
        use crate::schema::generations;

        let mut conn = self
            .pool
            .get()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        let result = generations::table
            .filter(generations::id.eq(generation_id))
            .first::<Generation>(&mut conn)
            .await?;
        Ok(result)
    }

    pub async fn get_generation_by_prediction_id(
        &self,
        prediction_id: &str,
    ) -> Result<Generation, ServiceError> {
        use crate::schema::generations;

        let mut conn = self
            .pool
            .get()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        let result = generations::table
            .filter(generations::prediction_id.eq(prediction_id))
            .first::<Generation>(&mut conn)
            .await?;
        Ok(result)
    }

    #[instrument(skip(self))]
    pub async fn insert_generation(
        &self,
        generation: &Generation,
    ) -> Result<Generation, ServiceError> {
        use crate::schema::generations;

        let mut conn = self
            .pool
            .get()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        let result = diesel::insert_into(generations::table)
            .values(generation)
            .get_result(&mut conn)
            .await?;
        Ok(result)
    }

    pub async fn update_generation(
        &self,
        generation: &Generation,
    ) -> Result<Generation, ServiceError> {
        use crate::schema::generations;

        let mut conn = self
            .pool
            .get()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        let result = diesel::update(generations::table)
            .filter(generations::id.eq(generation.id))
            .set(generation)
            .get_result(&mut conn)
            .await?;
        Ok(result)
    }

    #[instrument(skip(self))]
    pub async fn insert_user_generation(
        &self,
        user_generation: &UserGeneration,
    ) -> Result<UserGeneration, ServiceError> {
        use crate::schema::user_generations;

        let mut conn = self
            .pool
            .get()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        let result = diesel::insert_into(user_generations::table)
            .values(user_generation)
            .get_result(&mut conn)
            .await?;
        Ok(result)
    }

    pub async fn get_user_generation(
        &self,
        user_id: &uuid::Uuid,
        generation_id: &uuid::Uuid,
    ) -> Result<Option<UserGeneration>, ServiceError> {
        use crate::schema::user_generations;

        let mut conn = self
            .pool
            .get()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        let result = user_generations::table
            .filter(user_generations::user_id.eq(user_id))
            .filter(user_generations::generation_id.eq(generation_id))
            .first::<UserGeneration>(&mut conn)
            .await
            .optional()?;
        Ok(result)
    }

    pub async fn get_generations_for_user(
        &self,
        user_id: &uuid::Uuid,
    ) -> Result<Vec<Generation>, ServiceError> {
        use crate::schema::{generations, user_generations};

        let mut conn = self
            .pool
            .get()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        let result = generations::table
            .inner_join(
                user_generations::table.on(generations::id.eq(user_generations::generation_id)),
            )
            .filter(user_generations::user_id.eq(user_id))
            .select(generations::all_columns)
            .load::<Generation>(&mut conn)
            .await?;
        Ok(result)
    }
}
