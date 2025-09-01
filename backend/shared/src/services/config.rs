use crate::errors::ServiceError;
use std::env;

/// Configuration service for managing application settings
#[derive(Clone, Debug)]
pub struct ConfigService {
    /// Database connection URL
    pub database_url: Option<String>,
    /// ElevenLabs API key for text-to-speech services
    pub elevenlabs_api_key: Option<String>,
    /// LatentSync configuration for video processing
    pub latentsync_config: Option<LatentSyncConfig>,
    /// S3 bucket name for file storage
    pub s3_bucket: Option<String>,
    /// Google OAuth configuration
    pub google_oauth_config: Option<GoogleOAuthConfig>,
    /// SMTP configuration for email services
    pub smtp_config: Option<SmtpConfig>,
    /// Redis configuration for caching
    pub redis_config: Option<RedisConfig>,
}

/// Configuration for LatentSync video processing service
#[derive(Clone, Debug)]
pub struct LatentSyncConfig {
    /// API token for authentication
    pub api_token: String,
    /// Version identifier for the service
    pub version: String,
    /// Webhook URL for callbacks
    pub webhook_url: String,
}

/// Configuration for Google OAuth authentication
#[derive(Clone, Debug)]
pub struct GoogleOAuthConfig {
    /// Google OAuth client ID
    pub client_id: String,
    /// Google OAuth client secret
    pub client_secret: String,
    /// Redirect URL for OAuth callbacks
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
    pub fn from_env() -> Self {
        let latentsync_config = if env::var("LATENTSYNC_API_TOKEN").is_ok()
            && env::var("WEBHOOK_URL").is_ok()
        {
            Some(LatentSyncConfig {
                api_token: env::var("LATENTSYNC_API_TOKEN").unwrap(),
                version: env::var("LATENTSYNC_VERSION").unwrap_or(
                    "ad8a00b5fb3bc5286ffbd16cf9d7d85499f5a301416071c15a89bcd81eddfd47".to_string(),
                ),
                webhook_url: env::var("WEBHOOK_URL").unwrap(),
            })
        } else {
            None
        };

        let google_oauth_config = if env::var("GOOGLE_CLIENT_ID").is_ok()
            && env::var("GOOGLE_CLIENT_SECRET").is_ok()
            && env::var("OAUTH_REDIRECT_URL").is_ok()
        {
            Some(GoogleOAuthConfig {
                client_id: env::var("GOOGLE_CLIENT_ID").unwrap(),
                client_secret: env::var("GOOGLE_CLIENT_SECRET").unwrap(),
                redirect_url: env::var("OAUTH_REDIRECT_URL").unwrap(),
                auth_secret_key: env::var("AUTH_SECRET_KEY")
                    .unwrap_or("your_secret_key_here".to_string()),
                frontend_url: env::var("APPLICATION_FRONTEND_URL")
                    .unwrap_or("http://localhost:5173".to_string()),
                backend_url: env::var("APPLICATION_BACKEND_URL")
                    .unwrap_or("http://localhost:8080".to_string()),
            })
        } else {
            None
        };

        let smtp_config = if let (Ok(host), Ok(port_str), Ok(username), Ok(password)) = (
            env::var("SMTP_HOST"),
            env::var("SMTP_PORT"),
            env::var("SMTP_USER"),
            env::var("SMTP_PASSWORD"),
        ) {
            if let Ok(port) = port_str.parse::<u16>() {
                Some(SmtpConfig {
                    host,
                    port,
                    username,
                    password,
                })
            } else {
                None
            }
        } else {
            None
        };

        let redis_config = Some(RedisConfig {
            url: env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string()),
            session_ttl_days: env::var("SESSION_TTL_DAYS")
                .unwrap_or_else(|_| "7".to_string())
                .parse()
                .unwrap_or(7),
            max_connections: env::var("REDIS_MAX_CONNECTIONS")
                .unwrap_or_else(|_| "10".to_string())
                .parse()
                .unwrap_or(10),
        });

        Self {
            database_url: env::var("DATABASE_URL").ok(),
            elevenlabs_api_key: env::var("ELEVENLABS_API_KEY").ok(),
            latentsync_config,
            s3_bucket: env::var("S3_BUCKET")
                .ok()
                .or_else(|| Some("latentsync-video-clips".to_string())),
            google_oauth_config,
            smtp_config,
            redis_config,
        }
    }

    /// Get the database configuration URL
    pub fn database_config(&self) -> Result<&str, ServiceError> {
        self.database_url.as_deref().ok_or_else(|| {
            ServiceError::Config("DATABASE_URL environment variable not set".to_string())
        })
    }

    /// Get the ElevenLabs API key configuration
    pub fn elevenlabs_config(&self) -> Result<&str, ServiceError> {
        self.elevenlabs_api_key.as_deref().ok_or_else(|| {
            ServiceError::Config("ELEVENLABS_API_KEY environment variable not set".to_string())
        })
    }

    /// Get the LatentSync configuration
    pub fn latentsync_config(&self) -> Result<LatentSyncConfig, ServiceError> {
        let config = self
            .latentsync_config
            .clone()
            .ok_or_else(|| ServiceError::Config("LatentSync config not set".to_string()))?;
        Ok(config)
    }

    /// Get the S3 bucket configuration
    pub fn s3_config(&self) -> Result<&str, ServiceError> {
        self.s3_bucket.as_deref().ok_or_else(|| {
            ServiceError::Config("S3_BUCKET environment variable not set".to_string())
        })
    }

    /// Get the Google OAuth configuration
    pub fn google_oauth_config(&self) -> Result<GoogleOAuthConfig, ServiceError> {
        let config = self
            .google_oauth_config
            .clone()
            .ok_or_else(|| ServiceError::Config("Google OAuth config not set".to_string()))?;
        Ok(config)
    }

    /// Get the SMTP configuration
    pub fn smtp_config(&self) -> Result<SmtpConfig, ServiceError> {
        let config = self
            .smtp_config
            .clone()
            .ok_or_else(|| {
                ServiceError::Config(
                    "SMTP configuration not set. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD environment variables".to_string()
                )
            })?;
        Ok(config)
    }

    /// Get the Redis configuration
    pub fn redis_config(&self) -> Result<RedisConfig, ServiceError> {
        let config = self
            .redis_config
            .clone()
            .ok_or_else(|| ServiceError::Config("Redis config not set".to_string()))?;
        Ok(config)
    }
}
