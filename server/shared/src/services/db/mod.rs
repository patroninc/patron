use diesel_async::{pooled_connection::bb8::Pool, AsyncPgConnection};

use crate::errors::ServiceError;

mod audio_clip;
mod character;
mod generation;
mod video_clip;

#[derive(Clone)]
pub struct DbService {
    pool: Pool<AsyncPgConnection>,
}

impl DbService {
    pub async fn new(database_url: &str) -> Result<Self, ServiceError> {
        let config =
            diesel_async::pooled_connection::AsyncDieselConnectionManager::new(database_url);
        let pool = Pool::builder()
            .build(config)
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        Ok(Self { pool })
    }

    pub fn pool(&self) -> Pool<AsyncPgConnection> {
        self.pool.clone()
    }
}
