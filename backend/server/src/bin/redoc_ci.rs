//! Binary for generating `OpenAPI` documentation in JSON format for CI/CD pipelines
//!
//! This utility generates the `OpenAPI` specification from the backend's API documentation
//! and outputs it as pretty-formatted JSON to stdout. This is useful for:
//! - Generating documentation during CI/CD builds
//! - Creating API specification files for external tools
//! - Validating API documentation structure

use backend::openapi::ApiDoc;
use utoipa::OpenApi;

/// Main entry point for the redoc CI utility
///
/// Generates and prints the `OpenAPI` specification in JSON format
///
/// # Errors
///
/// Returns an `std::io::Result` that may contain I/O errors from stdout operations
fn main() -> Result<(), Box<dyn std::error::Error>> {
    match ApiDoc::openapi().to_pretty_json() {
        Ok(json) => println!("{json}"),
        Err(e) => {
            eprintln!("Failed to serialize OpenAPI spec to JSON: {e}");
            return Err(Box::new(e));
        }
    }
    Ok(())
}
