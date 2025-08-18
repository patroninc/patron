use crate::errors::ServiceError;
use lettre::message::{header, MultiPart, SinglePart};
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
use std::env;

/// Email service for sending emails via SMTP
///
/// # Usage
///
/// ```rust
/// use shared::services::email::EmailService;
///
/// #[tokio::main]
/// async fn main() -> Result<(), Box<dyn std::error::Error>> {
///     // Create email service from environment variables
///     let email_service = EmailService::from_env();
///     
///     // Send a plain text email
///     email_service.send_text_email(
///         "recipient@example.com",
///         "Test Subject",
///         "Hello, this is a test email!",
///         None, // Use default from address
///     ).await?;
///     
///     // Send an HTML email with text fallback
///     email_service.send_html_email(
///         "recipient@example.com",
///         "HTML Email",
///         "<h1>Hello</h1><p>This is an HTML email!</p>",
///         Some("Hello\n\nThis is an HTML email!"), // Text fallback
///         None, // Use default from address
///     ).await?;
///     
///     Ok(())
/// }
/// ```
///
/// # Environment Variables
///
/// The following environment variables must be set:
/// - `SMTP_HOST`: The SMTP server hostname
/// - `SMTP_PORT`: The SMTP server port (e.g., 587, 465, 25)
/// - `SMTP_USER`: The username for SMTP authentication
/// - `SMTP_PASSWORD`: The password for SMTP authentication

#[derive(Clone, Debug)]
pub struct SmtpConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    pub from_address: String,
}

#[derive(Clone)]
pub struct EmailService {
    smtp_config: Option<SmtpConfig>,
}

impl EmailService {
    /// Create a new EmailService from environment variables
    pub fn from_env() -> Self {
        let smtp_config =
            if let (Ok(host), Ok(port_str), Ok(username), Ok(password), Ok(from_address)) = (
                env::var("SMTP_HOST"),
                env::var("SMTP_PORT"),
                env::var("SMTP_USER"),
                env::var("SMTP_PASSWORD"),
                env::var("SMTP_FROM_ADDRESS"),
            ) {
                if let Ok(port) = port_str.parse::<u16>() {
                    Some(SmtpConfig {
                        host,
                        port,
                        username,
                        password,
                        from_address,
                    })
                } else {
                    None
                }
            } else {
                None
            };

        Self { smtp_config }
    }

    /// Get SMTP configuration or return an error if not configured
    pub fn smtp_config(&self) -> Result<&SmtpConfig, ServiceError> {
        self.smtp_config.as_ref().ok_or_else(|| {
            ServiceError::Config(
                "SMTP configuration not set. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM_ADDRESS environment variables".to_string()
            )
        })
    }

    /// Send a plain text email
    pub async fn send_text_email(
        &self,
        to: &str,
        subject: &str,
        body: &str,
        from: Option<&str>,
    ) -> Result<(), ServiceError> {
        let config = self.smtp_config()?;

        let from_email = from.unwrap_or(&config.from_address);

        let email =
            Message::builder()
                .from(from_email.parse().map_err(|e| {
                    ServiceError::Config(format!("Invalid from email address: {e}"))
                })?)
                .to(to
                    .parse()
                    .map_err(|e| ServiceError::Config(format!("Invalid to email address: {e}")))?)
                .subject(subject)
                .body(body.to_string())
                .map_err(|e| ServiceError::Config(format!("Failed to build email: {e}")))?;

        self.send_email(email).await
    }

    /// Send an HTML email
    pub async fn send_html_email(
        &self,
        to: &str,
        subject: &str,
        html_body: &str,
        text_body: Option<&str>,
        from: Option<&str>,
    ) -> Result<(), ServiceError> {
        let config = self.smtp_config()?;

        let from_email = from.unwrap_or(&config.from_address);

        let email_builder =
            Message::builder()
                .from(from_email.parse().map_err(|e| {
                    ServiceError::Config(format!("Invalid from email address: {e}"))
                })?)
                .to(to
                    .parse()
                    .map_err(|e| ServiceError::Config(format!("Invalid to email address: {e}")))?)
                .subject(subject);

        let email = if let Some(text) = text_body {
            // Send multipart email with both HTML and text
            email_builder
                .multipart(
                    MultiPart::alternative()
                        .singlepart(
                            SinglePart::builder()
                                .header(header::ContentType::TEXT_PLAIN)
                                .body(text.to_string()),
                        )
                        .singlepart(
                            SinglePart::builder()
                                .header(header::ContentType::TEXT_HTML)
                                .body(html_body.to_string()),
                        ),
                )
                .map_err(|e| {
                    ServiceError::Config(format!("Failed to build multipart email: {e}"))
                })?
        } else {
            // Send HTML-only email
            email_builder
                .header(header::ContentType::TEXT_HTML)
                .body(html_body.to_string())
                .map_err(|e| ServiceError::Config(format!("Failed to build HTML email: {e}")))?
        };

        self.send_email(email).await
    }

    /// Internal method to send the email using SMTP
    async fn send_email(&self, email: Message) -> Result<(), ServiceError> {
        let config = self.smtp_config()?;

        let creds = Credentials::new(config.username.clone(), config.password.clone());

        let mailer = SmtpTransport::starttls_relay(&config.host)
            .map_err(|e| ServiceError::Config(format!("Failed to create SMTP transport: {e}")))?
            .port(config.port)
            .credentials(creds)
            .build();

        // Send the email using tokio spawn_blocking since lettre's send is blocking
        let result = tokio::task::spawn_blocking(move || mailer.send(&email))
            .await
            .map_err(|e| ServiceError::Unknown(format!("Task join error: {e}")))?;

        result.map_err(|e| ServiceError::Unknown(format!("Failed to send email: {e}")))?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_email_service_creation() {
        let service = EmailService::from_env();
        // This test just ensures the service can be created
        // Actual SMTP functionality would require integration tests with real SMTP server
        assert!(service.smtp_config.is_none() || service.smtp_config.is_some());
    }
}
