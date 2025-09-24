//! Backend server for Patron, providing API endpoints and authentication services.

/// Handlers module containing API endpoint implementations.
pub mod handlers;
/// `OpenAPI` documentation module for API specification and documentation.
pub mod openapi;

use actix_cors::Cors;
use actix_session::{config::PersistentSession, storage::RedisSessionStore, SessionMiddleware};
use actix_web::{
    cookie::Key,
    middleware::Logger,
    web::{self, PayloadConfig},
    App, HttpServer,
};
use openapi::ApiDoc;
use redis::aio::ConnectionManager;
use shared::services::{
    auth::GoogleOAuthService, config::ConfigService, db::DbService, email::EmailService,
    s3::S3Service,
};
use tracing::level_filters::LevelFilter;
use tracing_actix_web::TracingLogger;
use tracing_subscriber::EnvFilter;
use utoipa::OpenApi;
use utoipa_redoc::{Redoc, Servable};

/// Entry point for the Patron backend server, sets up services and starts the HTTP server.
#[actix_web::main]
pub async fn main() -> std::io::Result<()> {
    #[allow(unused_results)]
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::builder()
                .with_default_directive(LevelFilter::INFO.into())
                .from_env_lossy(),
        )
        .init();

    let config = ConfigService::from_env();

    let s3_config = match config.s3_config() {
        Ok(cfg) => cfg,
        Err(e) => {
            eprintln!("Failed to get S3 config: {e}");
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Failed to get S3 config",
            ));
        }
    };
    let s3_service = match S3Service::new(s3_config).await {
        Ok(service) => service,
        Err(e) => {
            eprintln!("Failed to create S3 service: {e}");
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Failed to create S3 service",
            ));
        }
    };

    let google_oauth_config = match config.google_oauth_config() {
        Ok(cfg) => cfg,
        Err(e) => {
            eprintln!("Failed to get Google OAuth config: {e}");
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Failed to get Google OAuth config",
            ));
        }
    };
    let google_oauth_service = GoogleOAuthService::new(google_oauth_config);

    let email_service = EmailService::from_env();

    let db_config = match config.database_config() {
        Ok(cfg) => cfg,
        Err(e) => {
            eprintln!("Failed to get database config: {e}");
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Failed to get database config",
            ));
        }
    };

    if let Err(e) = DbService::run_migrations(db_config) {
        eprintln!("Failed to run database migrations: {e}");
        return Err(std::io::Error::new(
            std::io::ErrorKind::Other,
            "Failed to run database migrations",
        ));
    }
    println!("Database migrations ran successfully.");

    let db_service = match DbService::new(db_config).await {
        Ok(service) => service,
        Err(e) => {
            eprintln!("Failed to create DB service: {e}");
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Failed to create DB service",
            ));
        }
    };

    let redis_config = match config.redis_config() {
        Ok(cfg) => cfg,
        Err(e) => {
            eprintln!("Failed to get Redis config: {e}");
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Failed to get Redis config",
            ));
        }
    };
    let redis_store = match RedisSessionStore::new(&redis_config.url).await {
        Ok(store) => store,
        Err(e) => {
            eprintln!("Failed to create Redis session store: {e}");
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Failed to create Redis session store",
            ));
        }
    };

    let redis_client = match redis::Client::open(redis_config.url.as_str()) {
        Ok(client) => client,
        Err(e) => {
            eprintln!("Failed to create Redis client: {e}");
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Failed to create Redis client",
            ));
        }
    };
    let redis_manager = match ConnectionManager::new(redis_client).await {
        Ok(manager) => manager,
        Err(e) => {
            eprintln!("Failed to create Redis connection manager: {e}");
            return Err(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Failed to create Redis connection manager",
            ));
        }
    };

    let session_key = Key::from(google_oauth_service.auth_secret_key.as_bytes());

    HttpServer::new(move || {
        App::new()
            .wrap(TracingLogger::default())
            .wrap(Logger::new(
                "%a \"%r\" %s %b \"%{Referer}i\" \"%{User-Agent}i\" %T ms",
            ))
            .wrap(Cors::permissive())
            .app_data(PayloadConfig::new(0x4000_0000))
            .wrap(
                SessionMiddleware::builder(redis_store.clone(), session_key.clone())
                    .cookie_name("session_id".to_owned())
                    .cookie_secure(config.cookie_secure)
                    .cookie_http_only(true)
                    .cookie_same_site(if config.cookie_secure {
                        actix_web::cookie::SameSite::None
                    } else {
                        actix_web::cookie::SameSite::Lax
                    })
                    .session_lifecycle(PersistentSession::default().session_ttl(
                        actix_web::cookie::time::Duration::days(
                            #[allow(clippy::unwrap_used)]
                            (redis_config.session_ttl_days).try_into().unwrap(),
                        ),
                    ))
                    .build(),
            )
            .app_data(web::Data::new(config.clone()))
            .app_data(web::Data::new(s3_service.clone()))
            .app_data(web::Data::new(db_service.clone()))
            .app_data(web::Data::new(google_oauth_service.clone()))
            .app_data(web::Data::new(email_service.clone()))
            .app_data(web::Data::new(redis_manager.clone()))
            .service(Redoc::with_url("/redoc", ApiDoc::openapi()))
            .service(
                web::scope("/api")
                    .service(
                        web::scope("/auth")
                            .service(
                                web::resource("/google")
                                    .route(web::get().to(handlers::auth::google_auth_redirect)),
                            )
                            .service(
                                web::resource("/google/callback")
                                    .route(web::get().to(handlers::auth::google_auth_callback)),
                            )
                            .service(
                                web::resource("/register")
                                    .route(web::post().to(handlers::auth::register)),
                            )
                            .service(
                                web::resource("/login")
                                    .route(web::post().to(handlers::auth::login)),
                            )
                            .service(
                                web::resource("/verify-email")
                                    .route(web::get().to(handlers::auth::verify_email)),
                            )
                            .service(
                                web::resource("/logout")
                                    .route(web::get().to(handlers::auth::logout)),
                            )
                            .service(
                                web::resource("/me")
                                    .route(web::get().to(handlers::auth::get_me))
                                    .route(web::put().to(handlers::auth::update_user_info)),
                            )
                            .service(
                                web::resource("/forgot-password")
                                    .route(web::post().to(handlers::auth::forgot_password)),
                            )
                            .service(
                                web::resource("/reset-password")
                                    .route(web::post().to(handlers::auth::reset_password)),
                            )
                            .service(
                                web::resource("/check-email")
                                    .route(web::post().to(handlers::auth::check_email)),
                            )
                            .service(
                                web::resource("/resend-verification").route(
                                    web::post().to(handlers::auth::resend_verification_email),
                                ),
                            ),
                    )
                    .service(
                        web::scope("/files")
                            .service(
                                web::resource("/actions/upload")
                                    .route(web::post().to(handlers::user_files::upload_file)),
                            )
                            .service(
                                web::resource("")
                                    .route(web::get().to(handlers::user_files::list_files)),
                            )
                            .service(
                                web::resource("/{file_id}")
                                    .route(web::get().to(handlers::user_files::get_file))
                                    .route(web::put().to(handlers::user_files::update_file))
                                    .route(web::delete().to(handlers::user_files::delete_file)),
                            ),
                    )
                    .service(
                        web::scope("/cdn").service(
                            web::resource("/files/{file_id}")
                                .route(web::get().to(handlers::user_files::serve_file_cdn)),
                        ),
                    )
                    .service(
                        web::scope("/series")
                            .service(
                                web::resource("")
                                    .route(web::post().to(handlers::series::create_series))
                                    .route(web::get().to(handlers::series::list_series)),
                            )
                            .service(
                                web::resource("/{series_id}")
                                    .route(web::get().to(handlers::series::get_series))
                                    .route(web::put().to(handlers::series::update_series))
                                    .route(web::delete().to(handlers::series::delete_series)),
                            ),
                    )
                    .service(
                        web::scope("/posts")
                            .service(
                                web::resource("")
                                    .route(web::post().to(handlers::posts::create_post))
                                    .route(web::get().to(handlers::posts::list_posts)),
                            )
                            .service(
                                web::resource("/{post_id}")
                                    .route(web::get().to(handlers::posts::get_post))
                                    .route(web::put().to(handlers::posts::update_post))
                                    .route(web::delete().to(handlers::posts::delete_post)),
                            ),
                    )
                    .service(
                        web::scope("/api-keys")
                            .service(
                                web::resource("")
                                    .route(web::post().to(handlers::api_keys::create_api_key))
                                    .route(web::get().to(handlers::api_keys::list_api_keys)),
                            )
                            .service(
                                web::resource("/{api_key_id}")
                                    .route(web::get().to(handlers::api_keys::get_api_key))
                                    .route(web::put().to(handlers::api_keys::update_api_key))
                                    .route(web::delete().to(handlers::api_keys::delete_api_key)),
                            ),
                    ),
            )
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
