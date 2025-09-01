use diesel_async::{pooled_connection::bb8::Pool, AsyncPgConnection};

use crate::errors::ServiceError;

/// Database service for managing connection pool
#[derive(Clone, Debug)]
pub struct DbService {
    pool: Pool<AsyncPgConnection>,
}

impl DbService {
    /// Creates a new database service with connection pool
    ///
    /// # Errors
    ///
    /// Returns `ServiceError::Unknown` if the connection pool cannot be created
    #[inline]
    pub async fn new(database_url: &str) -> Result<Self, ServiceError> {
        let config =
            diesel_async::pooled_connection::AsyncDieselConnectionManager::new(database_url);
        let pool = Pool::builder()
            .build(config)
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        Ok(Self { pool })
    }

    /// Returns a clone of the database connection pool
    #[must_use]
    #[inline]
    pub fn pool(&self) -> Pool<AsyncPgConnection> {
        self.pool.clone()
    }
}
