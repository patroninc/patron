use crate::{errors::ServiceError, services::config::GoogleOAuthConfig};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::fmt::Write as _;
use tracing::instrument;

/// Service for handling Google `OAuth` authentication.
#[derive(Clone, Debug)]
pub struct GoogleOAuthService {
    /// HTTP client for making requests.
    pub client: Client,
    /// Google `OAuth` client ID.
    pub client_id: String,
    /// Google `OAuth` client secret.
    pub client_secret: String,
    /// Redirect URI for `OAuth` callbacks.
    pub redirect_uri: String,
    /// Secret key used for authentication.
    pub auth_secret_key: String,
    /// URL of the frontend application.
    pub frontend_url: String,
    /// URL of the backend application.
    pub backend_url: String,
}

/// Represents the response from Google's `OAuth` token endpoint.
#[derive(Debug, Deserialize, Serialize)]
pub struct GoogleTokenResponse {
    /// Access token issued by Google.
    pub access_token: String,
    /// Lifetime in seconds of the access token.
    pub expires_in: i64,
    /// Refresh token, if provided.
    pub refresh_token: Option<String>,
    /// Scopes granted by the access token.
    pub scope: String,
    /// Type of the token issued.
    pub token_type: String,
    /// ID token issued by Google.
    pub id_token: String,
}

#[derive(Debug, Deserialize, Serialize)]
/// Represents user information returned by Google `OAuth`.
pub struct GoogleUserInfo {
    /// The unique identifier for the user.
    pub sub: String,
    /// The user's email address.
    pub email: String,
    /// Whether the user's email address has been verified.
    pub email_verified: bool,
    /// The user's full name.
    pub name: String,
    /// The URL to the user's profile picture.
    pub picture: String,
}

impl GoogleOAuthService {
    /// Creates a new instance of `GoogleOAuthService` with the provided configuration.
    #[must_use]
    pub fn new(config: GoogleOAuthConfig) -> Self {
        Self {
            client: Client::new(),
            client_id: config.client_id,
            client_secret: config.client_secret,
            redirect_uri: config.redirect_url,
            auth_secret_key: config.auth_secret_key,
            frontend_url: config.frontend_url,
            backend_url: config.backend_url,
        }
    }

    /// Generates the Google `OAuth` authorization URL with optional state parameter.
    ///
    /// # Arguments
    ///
    /// * `state` - An optional state string to include in the authorization URL for CSRF protection.
    ///
    /// # Returns
    ///
    /// A String containing the full authorization URL.
    #[must_use]
    pub fn get_authorization_url(&self, state: Option<&str>) -> String {
        let mut url = format!(
            "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope=openid%20email%20profile",
            urlencoding::encode(&self.client_id),
            urlencoding::encode(&self.redirect_uri)
        );

        if let Some(state_value) = state {
            write!(url, "&state={}", urlencoding::encode(state_value))
                .expect("Failed to append state parameter");
        }

        url
    }

    /// Exchanges an authorization code for a Google `OAuth` token response.
    ///
    /// # Errors
    /// Returns a `ServiceError` if the HTTP request fails or Google returns an error
    #[instrument(skip(self))]
    pub async fn exchange_code_for_token(
        &self,
        code: &str,
    ) -> Result<GoogleTokenResponse, ServiceError> {
        let params = [
            ("code", code),
            ("client_id", &self.client_id),
            ("client_secret", &self.client_secret),
            ("redirect_uri", &self.redirect_uri),
            ("grant_type", "authorization_code"),
        ];

        let resp = self
            .client
            .post("https://oauth2.googleapis.com/token")
            .form(&params)
            .send()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        if !resp.status().is_success() {
            return Err(ServiceError::Unknown(format!(
                "Google token exchange failed: {}",
                resp.status()
            )));
        }

        let token = resp
            .json::<GoogleTokenResponse>()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        Ok(token)
    }

    /// Retrieves user information from Google using the provided ID token.
    ///
    /// # Errors
    /// Returns a `ServiceError` if the HTTP request fails or Google returns an error
    #[instrument(skip(self))]
    pub async fn get_user_info(&self, id_token: &str) -> Result<GoogleUserInfo, ServiceError> {
        let resp = self
            .client
            .get("https://openidconnect.googleapis.com/v1/userinfo")
            .bearer_auth(id_token)
            .send()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        if !resp.status().is_success() {
            return Err(ServiceError::Unknown(format!(
                "Google userinfo fetch failed: {}",
                resp.status()
            )));
        }

        let user_info = resp
            .json::<GoogleUserInfo>()
            .await
            .map_err(|e| ServiceError::Unknown(e.to_string()))?;

        Ok(user_info)
    }
}
