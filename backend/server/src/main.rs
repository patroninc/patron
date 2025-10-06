//! Main entry point for the patron backend server

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    backend::main().await
}
