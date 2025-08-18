#![allow(clippy::needless_for_each)]

pub mod handlers;
pub mod openapi;

use actix_cors::Cors;
use actix_session::{config::PersistentSession, storage::RedisSessionStore, SessionMiddleware};
use actix_web::{
    cookie::Key,
    middleware::Logger,
    web::{self, PayloadConfig},
    App, HttpServer,
};
pub use openapi::ApiDoc;
use shared::services::{
    auth::GoogleOAuthService, config::ConfigService, db::DbService, elevenlabs::ElevenLabsService,
    email::EmailService, latentsync::LatentSyncService, s3::S3Service,
};
use tracing::level_filters::LevelFilter;
use tracing_actix_web::TracingLogger;
use tracing_subscriber::EnvFilter;
use utoipa::OpenApi;
use utoipa_redoc::{Redoc, Servable};

#[actix_web::main]
pub async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::builder()
                .with_default_directive(LevelFilter::INFO.into())
                .from_env_lossy(),
        )
        .init();

    let config = ConfigService::from_env();

    let s3_service = S3Service::new(config.s3_config().unwrap())
        .await
        .expect("Failed to create S3 service");

    let elevenlabs_service = ElevenLabsService::new(config.elevenlabs_config().unwrap())
        .expect("Failed to create ElevenLabs service");

    let latentsync_service = LatentSyncService::new(&config.latentsync_config().unwrap())
        .expect("Failed to create LatentSync service");

    let google_oauth_service = GoogleOAuthService::new(config.google_oauth_config().unwrap());

    let email_service = EmailService::from_env();

    let db_service = DbService::new(config.database_config().unwrap())
        .await
        .expect("Failed to create DB service");

    // Create Redis session store
    let redis_config = config.redis_config().expect("Redis config required");
    let redis_store = RedisSessionStore::new(&redis_config.url)
        .await
        .expect("Failed to create Redis session store");

    // Generate session key from auth secret
    let session_key = Key::from(google_oauth_service.auth_secret_key.as_bytes());

    HttpServer::new(move || {
        App::new()
            .wrap(TracingLogger::default())
            .wrap(Logger::new(
                "%a \"%r\" %s %b \"%{Referer}i\" \"%{User-Agent}i\" %T ms",
            ))
            .wrap(Cors::permissive())
            .app_data(PayloadConfig::new(1_073_741_824))
            .wrap(
                SessionMiddleware::builder(redis_store.clone(), session_key.clone())
                    .cookie_name("session_id".to_string())
                    .cookie_secure(false) // Set to true in production with HTTPS
                    .cookie_http_only(true)
                    .cookie_same_site(actix_web::cookie::SameSite::Lax)
                    .session_lifecycle(PersistentSession::default().session_ttl(
                        actix_web::cookie::time::Duration::days(
                            (redis_config.session_ttl_days).try_into().unwrap(),
                        ),
                    ))
                    .build(),
            )
            .app_data(web::Data::new(config.clone()))
            .app_data(web::Data::new(s3_service.clone()))
            .app_data(web::Data::new(db_service.clone()))
            .app_data(web::Data::new(elevenlabs_service.clone()))
            .app_data(web::Data::new(latentsync_service.clone()))
            .app_data(web::Data::new(google_oauth_service.clone()))
            .app_data(web::Data::new(email_service.clone()))
            .service(Redoc::with_url("/redoc", openapi::ApiDoc::openapi()))
            .service(
                web::scope("/api")
                    .service(
                        web::scope("/generate")
                            .service(
                                web::scope("/video")
                                    .service(
                                        web::resource("").route(web::post().to(
                                            handlers::generation::generate_video_with_lip_sync,
                                        )),
                                    )
                                    .service(
                                        web::resource("/{id}").route(
                                            web::get().to(
                                                handlers::generation::get_video_generation_status,
                                            ),
                                        ),
                                    ),
                            )
                            .service(
                                web::resource("/audio").route(
                                    web::post().to(handlers::generation::generate_audio_clip),
                                ),
                            ),
                    )
                    .service(
                        web::scope("/webhook")
                            .route("/latentsync", web::post().to(handlers::webhook::latentsync)),
                    )
                    .service(
                        web::scope("/auth")
                            .service(
                                web::resource("/google")
                                    // redirects to Google for authentication
                                    .route(web::get().to(handlers::auth::google_auth_redirect)),
                            )
                            .service(
                                web::resource("/google/callback")
                                    // handles the callback from Google after authentication
                                    .route(web::get().to(handlers::auth::google_auth_callback)),
                            )
                            .service(
                                web::resource("/register")
                                    // creates a new user account with email and password
                                    .route(web::post().to(handlers::auth::register)),
                            )
                            .service(
                                web::resource("/login")
                                    // authenticates user with email and password
                                    .route(web::post().to(handlers::auth::login)),
                            )
                            .service(
                                web::resource("/verify-email")
                                    // verifies user's email address and sets session cookie
                                    .route(web::get().to(handlers::auth::verify_email)),
                            )
                            .service(
                                web::resource("/logout")
                                    .route(web::get().to(handlers::auth::logout)),
                            )
                            .service(
                                web::resource("/me").route(web::get().to(handlers::auth::get_me)),
                            )
                            .service(
                                web::resource("/forgot-password")
                                    // sends password reset email
                                    .route(web::post().to(handlers::auth::forgot_password)),
                            )
                            .service(
                                web::resource("/reset-password")
                                    // resets password using token
                                    .route(web::post().to(handlers::auth::reset_password)),
                            ),
                    )
                    .service(
                        web::scope("/characters")
                            .service(
                                web::resource("")
                                    .route(web::get().to(handlers::characters::get_all_characters)),
                            )
                            .service(web::resource("/{character_id}/clips").route(
                                web::get().to(handlers::characters::get_clips_for_character),
                            )),
                    ),
            )
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
