use crate::{errors::ServiceError, services::config::GoogleOAuthConfig};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tracing::instrument;

#[derive(Clone)]
pub struct GoogleOAuthService {
    pub client: Client,
    pub client_id: String,
    pub client_secret: String,
    pub redirect_uri: String,
    pub auth_secret_key: String,
    pub frontend_url: String,
    pub backend_url: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GoogleTokenResponse {
    pub access_token: String,
    pub expires_in: i64,
    pub refresh_token: Option<String>,
    pub scope: String,
    pub token_type: String,
    pub id_token: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GoogleUserInfo {
    pub sub: String,
    pub email: String,
    pub email_verified: bool,
    pub name: String,
    pub picture: String,
}

impl GoogleOAuthService {
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

    pub fn get_authorization_url(&self, state: Option<&str>) -> String {
        let mut url = format!(
            "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope=openid%20email%20profile",
            urlencoding::encode(&self.client_id),
            urlencoding::encode(&self.redirect_uri)
        );

        if let Some(state_value) = state {
            url.push_str(&format!("&state={}", urlencoding::encode(state_value)));
        }

        url
    }

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
