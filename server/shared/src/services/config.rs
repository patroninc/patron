use crate::errors::ServiceError;
use std::env;

#[derive(Clone, Debug)]
pub struct ConfigService {
    pub database_url: Option<String>,
    pub elevenlabs_api_key: Option<String>,
    pub latentsync_config: Option<LatentSyncConfig>,
    pub s3_bucket: Option<String>,
    pub google_oauth_config: Option<GoogleOAuthConfig>,
    pub smtp_config: Option<SmtpConfig>,
    pub redis_config: Option<RedisConfig>,
}

#[derive(Clone, Debug)]
pub struct LatentSyncConfig {
    pub api_token: String,
    pub version: String,
    pub webhook_url: String,
}

#[derive(Clone, Debug)]
pub struct GoogleOAuthConfig {
    pub client_id: String,
    pub client_secret: String,
    pub redirect_url: String,
    pub auth_secret_key: String,
    pub frontend_url: String,
    pub backend_url: String,
}

#[derive(Clone, Debug)]
pub struct SmtpConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
}

#[derive(Clone, Debug)]
pub struct RedisConfig {
    pub url: String,
    pub session_ttl_days: u64,
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

    pub fn database_config(&self) -> Result<&str, ServiceError> {
        self.database_url.as_deref().ok_or_else(|| {
            ServiceError::Config("DATABASE_URL environment variable not set".to_string())
        })
    }

    pub fn elevenlabs_config(&self) -> Result<&str, ServiceError> {
        self.elevenlabs_api_key.as_deref().ok_or_else(|| {
            ServiceError::Config("ELEVENLABS_API_KEY environment variable not set".to_string())
        })
    }

    pub fn latentsync_config(&self) -> Result<LatentSyncConfig, ServiceError> {
        let config = self
            .latentsync_config
            .clone()
            .ok_or_else(|| ServiceError::Config("LatentSync config not set".to_string()))?;
        Ok(config)
    }

    pub fn s3_config(&self) -> Result<&str, ServiceError> {
        self.s3_bucket.as_deref().ok_or_else(|| {
            ServiceError::Config("S3_BUCKET environment variable not set".to_string())
        })
    }

    pub fn google_oauth_config(&self) -> Result<GoogleOAuthConfig, ServiceError> {
        let config = self
            .google_oauth_config
            .clone()
            .ok_or_else(|| ServiceError::Config("Google OAuth config not set".to_string()))?;
        Ok(config)
    }

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

    pub fn redis_config(&self) -> Result<RedisConfig, ServiceError> {
        let config = self
            .redis_config
            .clone()
            .ok_or_else(|| ServiceError::Config("Redis config not set".to_string()))?;
        Ok(config)
    }
}
