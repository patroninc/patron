use crate::errors::ServiceError;
use std::env;

/// Configuration service for managing application settings
#[derive(Clone, Debug)]
pub struct ConfigService {
    /// Database connection URL
    pub database_url: Option<String>,
    /// S3 bucket name for file storage
    pub s3_bucket: Option<String>,
    /// Google `OAuth` configuration
    pub google_oauth_config: Option<GoogleOAuthConfig>,
    /// SMTP configuration for email services
    pub smtp_config: Option<SmtpConfig>,
    /// Redis configuration for caching
    pub redis_config: Option<RedisConfig>,
    /// Cookie secure flag for HTTPS
    pub cookie_secure: bool,
}

/// Configuration for Google `OAuth` authentication
#[derive(Clone, Debug)]
pub struct GoogleOAuthConfig {
    /// Google `OAuth` client ID
    pub client_id: String,
    /// Google `OAuth` client secret
    pub client_secret: String,
    /// Redirect URL for `OAuth` callbacks
    pub redirect_url: String,
    /// Secret key for authentication
    pub auth_secret_key: String,
    /// Frontend application URL
    pub frontend_url: String,
    /// Backend application URL
    pub backend_url: String,
}

/// Configuration for SMTP email service
#[derive(Clone, Debug)]
pub struct SmtpConfig {
    /// SMTP server hostname
    pub host: String,
    /// SMTP server port
    pub port: u16,
    /// Username for SMTP authentication
    pub username: String,
    /// Password for SMTP authentication
    pub password: String,
}

/// Configuration for Redis cache service
#[derive(Clone, Debug)]
pub struct RedisConfig {
    /// Redis connection URL
    pub url: String,
    /// Session TTL in days
    pub session_ttl_days: u64,
    /// Maximum number of connections
    pub max_connections: u32,
}

impl ConfigService {
    /// Load configuration from environment variables
    ///
    /// # Panics
    ///
    /// This function will panic if required environment variables for Google `OAuth` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OAUTH_REDIRECT_URL`) are set but their values are invalid or missing.
    /// It may also panic if `SMTP_PORT` is set but cannot be parsed as a `u16`.
    #[must_use]
    pub fn from_env() -> Self {
        let google_oauth_config = (env::var("GOOGLE_CLIENT_ID").is_ok()
            && env::var("GOOGLE_CLIENT_SECRET").is_ok()
            && env::var("OAUTH_REDIRECT_URL").is_ok())
        .then(|| {
            Some(GoogleOAuthConfig {
                client_id: env::var("GOOGLE_CLIENT_ID").ok()?,
                client_secret: env::var("GOOGLE_CLIENT_SECRET").ok()?,
                redirect_url: env::var("OAUTH_REDIRECT_URL").ok()?,
                auth_secret_key: env::var("AUTH_SECRET_KEY")
                    .unwrap_or_else(|_| "your_secret_key_here".to_owned()),
                frontend_url: env::var("APPLICATION_FRONTEND_URL")
                    .unwrap_or_else(|_| "http://localhost:5173".to_owned()),
                backend_url: env::var("APPLICATION_BACKEND_URL")
                    .unwrap_or_else(|_| "http://localhost:8080".to_owned()),
            })
        })
        .flatten();

        let smtp_config = if let (Ok(host), Ok(port_str), Ok(username), Ok(password)) = (
            env::var("SMTP_HOST"),
            env::var("SMTP_PORT"),
            env::var("SMTP_USER"),
            env::var("SMTP_PASSWORD"),
        ) {
            port_str.parse::<u16>().map_or(None, |port| {
                Some(SmtpConfig {
                    host,
                    port,
                    username,
                    password,
                })
            })
        } else {
            None
        };

        let redis_config = Some(RedisConfig {
            url: env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".to_owned()),
            session_ttl_days: env::var("SESSION_TTL_DAYS")
                .unwrap_or_else(|_| "7".to_owned())
                .parse()
                .unwrap_or(7),
            max_connections: env::var("REDIS_MAX_CONNECTIONS")
                .unwrap_or_else(|_| "10".to_owned())
                .parse()
                .unwrap_or(10),
        });

        Self {
            database_url: env::var("DATABASE_URL").ok(),
            s3_bucket: env::var("S3_BUCKET")
                .ok()
                .or_else(|| Some("latentsync-video-clips".to_owned())),
            google_oauth_config,
            smtp_config,
            redis_config,
            cookie_secure: env::var("COOKIE_SECURE")
                .unwrap_or_else(|_| "false".to_owned())
                .parse()
                .unwrap_or(false),
        }
    }

    /// Get the database configuration URL
    ///
    /// # Errors
    ///
    /// Returns a [`ServiceError::Config`] if the `DATABASE_URL` environment variable is not set.
    pub fn database_config(&self) -> Result<&str, ServiceError> {
        self.database_url.as_deref().ok_or_else(|| {
            ServiceError::Config("DATABASE_URL environment variable not set".to_owned())
        })
    }

    /// Get the S3 bucket configuration
    ///
    /// # Errors
    ///
    /// Returns a [`ServiceError::Config`] if the `S3_BUCKET` environment variable is not set.
    pub fn s3_config(&self) -> Result<&str, ServiceError> {
        self.s3_bucket.as_deref().ok_or_else(|| {
            ServiceError::Config("S3_BUCKET environment variable not set".to_owned())
        })
    }

    /// Get the Google `OAuth` configuration
    ///
    /// # Errors
    ///
    /// Returns a [`ServiceError::Config`] if the Google `OAuth` configuration is not set.
    pub fn google_oauth_config(&self) -> Result<GoogleOAuthConfig, ServiceError> {
        let config = self
            .google_oauth_config
            .clone()
            .ok_or_else(|| ServiceError::Config("Google OAuth config not set".to_owned()))?;
        Ok(config)
    }

    /// Get the SMTP configuration
    ///
    /// # Errors
    ///
    /// Returns a [`ServiceError::Config`] if the SMTP configuration is not set.
    pub fn smtp_config(&self) -> Result<SmtpConfig, ServiceError> {
        let config = self
            .smtp_config
            .clone()
            .ok_or_else(|| {
                ServiceError::Config(
                    "SMTP configuration not set. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD environment variables".to_owned()
                )
            })?;
        Ok(config)
    }

    /// Get the Redis configuration
    ///
    /// # Errors
    ///
    /// Returns a [`ServiceError::Config`] if the Redis configuration is not set.
    pub fn redis_config(&self) -> Result<RedisConfig, ServiceError> {
        let config = self
            .redis_config
            .clone()
            .ok_or_else(|| ServiceError::Config("Redis config not set".to_owned()))?;
        Ok(config)
    }
}
