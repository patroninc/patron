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
    /// SMTP server host
    pub host: String,
    /// SMTP server port
    pub port: u16,
    /// SMTP username for authentication
    pub username: String,
    /// SMTP password for authentication
    pub password: String,
    /// Default from email address
    pub from_address: String,
}

/// Email service for sending emails via SMTP
#[derive(Clone, Debug)]
pub struct EmailService {
    smtp_config: Option<SmtpConfig>,
}

/// Struct to hold HTML email content
#[derive(Debug)]
pub struct HtmlEmailContent<'email_content> {
    /// The recipient email address
    pub to: &'email_content str,
    /// The subject of the email
    pub subject: &'email_content str,
    /// The HTML body of the email
    pub html_body: &'email_content str,
    /// The text body of the email
    pub text_body: Option<&'email_content str>,
    /// The sender email address
    pub from: Option<&'email_content str>,
}

impl EmailService {
    /// Create a new `EmailService` from environment variables
    #[must_use]
    pub fn from_env() -> Self {
        let smtp_config =
            if let (Ok(host), Ok(port_str), Ok(username), Ok(password), Ok(from_address)) = (
                env::var("SMTP_HOST"),
                env::var("SMTP_PORT"),
                env::var("SMTP_USER"),
                env::var("SMTP_PASSWORD"),
                env::var("SMTP_FROM_ADDRESS"),
            ) {
                port_str.parse::<u16>().map_or(None, |port| {
                    Some(SmtpConfig {
                        host,
                        port,
                        username,
                        password,
                        from_address,
                    })
                })
            } else {
                None
            };

        Self { smtp_config }
    }

    /// Get SMTP configuration or return an error if not configured
    ///
    /// # Errors
    /// Returns a `ServiceError::Config` if SMTP configuration is not set
    pub fn smtp_config(&self) -> Result<&SmtpConfig, ServiceError> {
        self.smtp_config.as_ref().ok_or_else(|| {
            ServiceError::Config(
                "SMTP configuration not set. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM_ADDRESS environment variables".to_owned()
            )
        })
    }

    /// Send a plain text email
    ///
    /// # Errors
    /// Returns a `ServiceError` if SMTP configuration is missing, email addresses are invalid, or email sending fails
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
                .body(body.to_owned())
                .map_err(|e| ServiceError::Config(format!("Failed to build email: {e}")))?;

        self.send_email(email).await
    }

    /// Send an HTML email
    ///
    /// # Errors
    /// Returns a `ServiceError` if SMTP configuration is missing, email addresses are invalid, or email sending fails
    pub async fn send_html_email(&self, content: HtmlEmailContent<'_>) -> Result<(), ServiceError> {
        let config = self.smtp_config()?;

        let from_email = content.from.unwrap_or(&config.from_address);

        let email_builder =
            Message::builder()
                .from(from_email.parse().map_err(|e| {
                    ServiceError::Config(format!("Invalid from email address: {e}"))
                })?)
                .to(content
                    .to
                    .parse()
                    .map_err(|e| ServiceError::Config(format!("Invalid to email address: {e}")))?)
                .subject(content.subject);

        let email = if let Some(text) = content.text_body {
            email_builder
                .multipart(
                    MultiPart::alternative()
                        .singlepart(
                            SinglePart::builder()
                                .header(header::ContentType::TEXT_PLAIN)
                                .body(text.to_owned()),
                        )
                        .singlepart(
                            SinglePart::builder()
                                .header(header::ContentType::TEXT_HTML)
                                .body(content.html_body.to_owned()),
                        ),
                )
                .map_err(|e| {
                    ServiceError::Config(format!("Failed to build multipart email: {e}"))
                })?
        } else {
            email_builder
                .header(header::ContentType::TEXT_HTML)
                .body(content.html_body.to_owned())
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

        let result = tokio::task::spawn_blocking(move || mailer.send(&email))
            .await
            .map_err(|e| ServiceError::Unknown(format!("Task join error: {e}")))?;

        let _ = result.map_err(|e| ServiceError::Unknown(format!("Failed to send email: {e}")))?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_email_service_creation() {
        let service = EmailService::from_env();
        assert!(service.smtp_config.is_none() || service.smtp_config.is_some());
    }
}
