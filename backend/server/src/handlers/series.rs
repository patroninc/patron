#![allow(clippy::unused_async)]

use actix_web::{web, HttpResponse, Result};
use chrono::Utc;
use diesel::prelude::*;
use diesel_async::RunQueryDsl;
use serde::Deserialize;
use shared::{
    errors::{ErrorResponse, ServiceError},
    models::{
        auth::User,
        series::{
            CreateSeriesRequest, Series, SeriesListResponse, SeriesResponse, UpdateSeriesRequest,
        },
    },
    schema::series_length::dsl as series_length_dsl,
};
use utoipa::ToSchema;
use uuid::Uuid;

/// Query parameters for listing series with pagination
#[derive(Debug, Clone, Copy, Deserialize, ToSchema, utoipa::IntoParams)]
#[schema(example = json!({
    "offset": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "limit": 50
}))]
pub struct ListSeriesQuery {
    /// UUID offset for cursor-based series pagination
    #[schema(example = "d290f1ee-6c54-4b01-90e6-d701748f0851")]
    pub offset: Option<Uuid>,
    /// Maximum number of series to return (default: 50, max: 100)
    #[schema(example = 50)]
    pub limit: Option<i64>,
}

/// Create a new series
///
/// # Errors
/// Returns error if series creation fails, slug conflict, or database error
#[utoipa::path(
    post,
    path = "/api/series",
    tag = "Series",
    request_body(content = CreateSeriesRequest, description = "Series creation data"),
    responses(
        (status = 201, description = "Series created successfully", body = SeriesResponse),
        (status = 400, description = "Invalid series data", body = ErrorResponse),
        (status = 401, description = "Authentication required to create series", body = ErrorResponse),
        (status = 409, description = "Series with this slug already exists", body = ErrorResponse),
        (status = 500, description = "Server error during series creation", body = ErrorResponse)
    ),
    security(("cookieAuth" = [], "bearerAuth" = []))
)]
pub async fn create_series(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    body: web::Json<CreateSeriesRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::series::dsl as series_dsl;

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let new_series = Series {
        id: Uuid::new_v4(),
        user_id: user.id,
        title: body.title.clone(),
        description: body.description.clone(),
        slug: body.slug.clone(),
        category: body.category.clone(),
        cover_image_url: body.cover_image_url.clone(),
        created_at: Some(Utc::now().naive_utc()),
        updated_at: Some(Utc::now().naive_utc()),
        deleted_at: None,
    };

    let inserted_series: Series = diesel::insert_into(series_dsl::series)
        .values(&new_series)
        .get_result(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::DatabaseError(
                diesel::result::DatabaseErrorKind::UniqueViolation,
                _,
            ) => ServiceError::Conflict("Series with this slug already exists".to_owned()),
            _ => ServiceError::Database(e.to_string()),
        })?;

    // Fetch series length
    let length: Option<i32> = series_length_dsl::series_length
        .filter(series_length_dsl::series_id.eq(inserted_series.id))
        .select(series_length_dsl::length)
        .first(&mut conn)
        .await
        .optional()
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    Ok(HttpResponse::Created().json(SeriesResponse::from(inserted_series).with_length(length)))
}

/// List user's series with cursor-based pagination
///
/// # Errors
/// Returns error if series database query fails or connection issues occur
#[utoipa::path(
    get,
    path = "/api/series",
    tag = "Series",
    params(ListSeriesQuery),
    responses(
        (status = 200, description = "Series list retrieved", body = SeriesListResponse),
        (status = 401, description = "Authentication required to list series", body = ErrorResponse),
        (status = 500, description = "Server error during series listing", body = ErrorResponse)
    ),
    security(("cookieAuth" = [], "bearerAuth" = []))
)]
pub async fn list_series(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    query: web::Query<ListSeriesQuery>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::series::dsl as series_dsl;

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let limit = query.limit.unwrap_or(50).min(100);

    let mut query_builder = series_dsl::series
        .filter(series_dsl::user_id.eq(user.id))
        .filter(series_dsl::deleted_at.is_null())
        .order(series_dsl::created_at.desc())
        .limit(limit)
        .into_boxed();

    if let Some(offset_id) = query.offset {
        let offset_created_at: chrono::NaiveDateTime = series_dsl::series
            .filter(series_dsl::id.eq(offset_id))
            .select(series_dsl::created_at)
            .first::<Option<chrono::NaiveDateTime>>(&mut conn)
            .await
            .map_err(|e| ServiceError::Database(e.to_string()))?
            .unwrap_or_else(|| Utc::now().naive_utc());

        query_builder = query_builder.filter(series_dsl::created_at.lt(offset_created_at));
    }

    let series_list: Vec<Series> = query_builder
        .load(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    // Fetch lengths for all series
    let series_ids: Vec<Uuid> = series_list.iter().map(|s| s.id).collect();
    let lengths: Vec<(Uuid, i32)> = series_length_dsl::series_length
        .filter(series_length_dsl::series_id.eq_any(&series_ids))
        .select((series_length_dsl::series_id, series_length_dsl::length))
        .load(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    let length_map: std::collections::HashMap<Uuid, i32> = lengths.into_iter().collect();

    let series_responses: Vec<SeriesResponse> = series_list
        .into_iter()
        .map(|s| {
            let length = length_map.get(&s.id).copied();
            SeriesResponse::from(s).with_length(length)
        })
        .collect();
    let response = SeriesListResponse::from(series_responses);

    Ok(HttpResponse::Ok().json(response))
}

/// Get a specific series by ID with user ownership validation
///
/// # Errors
/// Returns error if series not found, user access denied, or database connection error
#[utoipa::path(
    get,
    path = "/api/series/{series_id}",
    tag = "Series",
    params(("series_id" = Uuid, Path, description = "UUID of the series to retrieve")),
    responses(
        (status = 200, description = "Series retrieved", body = SeriesResponse),
        (status = 404, description = "Series not found or access denied", body = ErrorResponse),
        (status = 401, description = "Authentication required to view series", body = ErrorResponse),
        (status = 403, description = "Access denied - series does not belong to user", body = ErrorResponse),
        (status = 500, description = "Server error during series retrieval", body = ErrorResponse)
    ),
    security(("cookieAuth" = [], "bearerAuth" = []))
)]
pub async fn get_series(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::series::dsl as series_dsl;

    let series_id = path.into_inner();
    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let series: Series = series_dsl::series
        .filter(series_dsl::id.eq(series_id))
        .filter(series_dsl::user_id.eq(user.id))
        .filter(series_dsl::deleted_at.is_null())
        .first(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::NotFound => {
                ServiceError::NotFound("Series not found".to_owned())
            }
            _ => ServiceError::Database(e.to_string()),
        })?;

    // Fetch series length
    let length: Option<i32> = series_length_dsl::series_length
        .filter(series_length_dsl::series_id.eq(series_id))
        .select(series_length_dsl::length)
        .first(&mut conn)
        .await
        .optional()
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    Ok(HttpResponse::Ok().json(SeriesResponse::from(series).with_length(length)))
}

/// Update a series
///
/// # Errors
/// Returns error if series not found, access denied, slug conflict, or database update error
#[utoipa::path(
    put,
    path = "/api/series/{series_id}",
    tag = "Series",
    params(("series_id" = Uuid, Path, description = "UUID of the series to update")),
    request_body(content = UpdateSeriesRequest, description = "Updated series data"),
    responses(
        (status = 200, description = "Series updated successfully", body = SeriesResponse),
        (status = 404, description = "Series not found for update", body = ErrorResponse),
        (status = 401, description = "Authentication required to update series", body = ErrorResponse),
        (status = 403, description = "Access denied - cannot modify series not owned by user", body = ErrorResponse),
        (status = 409, description = "Series with updated slug already exists", body = ErrorResponse),
        (status = 500, description = "Server error during series update", body = ErrorResponse)
    ),
    security(("cookieAuth" = [], "bearerAuth" = []))
)]
pub async fn update_series(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    path: web::Path<Uuid>,
    body: web::Json<UpdateSeriesRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::series::dsl as series_dsl;

    let series_id = path.into_inner();
    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let _existing_series: Series = series_dsl::series
        .filter(series_dsl::id.eq(series_id))
        .filter(series_dsl::user_id.eq(user.id))
        .filter(series_dsl::deleted_at.is_null())
        .first(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::NotFound => {
                ServiceError::NotFound("Series not found".to_owned())
            }
            _ => ServiceError::Database(e.to_string()),
        })?;

    let current_time = Utc::now().naive_utc();

    let updated_series: Series =
        diesel::update(series_dsl::series.filter(series_dsl::id.eq(series_id)))
            .set((
                body.title.as_ref().map(|v| series_dsl::title.eq(v)),
                body.description
                    .as_ref()
                    .map(|v| series_dsl::description.eq(v)),
                body.slug.as_ref().map(|v| series_dsl::slug.eq(v)),
                body.category.as_ref().map(|v| series_dsl::category.eq(v)),
                body.cover_image_url
                    .as_ref()
                    .map(|v| series_dsl::cover_image_url.eq(v)),
                series_dsl::updated_at.eq(current_time),
            ))
            .get_result(&mut conn)
            .await
            .map_err(|e| match e {
                diesel::result::Error::DatabaseError(
                    diesel::result::DatabaseErrorKind::UniqueViolation,
                    _,
                ) => ServiceError::Conflict("Series with this slug already exists".to_owned()),
                _ => ServiceError::Database(e.to_string()),
            })?;

    // Fetch series length
    let length: Option<i32> = series_length_dsl::series_length
        .filter(series_length_dsl::series_id.eq(series_id))
        .select(series_length_dsl::length)
        .first(&mut conn)
        .await
        .optional()
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    Ok(HttpResponse::Ok().json(SeriesResponse::from(updated_series).with_length(length)))
}

/// Delete a series (soft delete) with user ownership validation
///
/// # Errors
/// Returns error if series not found, user access denied, or database deletion error
#[utoipa::path(
    delete,
    path = "/api/series/{series_id}",
    tag = "Series",
    params(("series_id" = Uuid, Path, description = "UUID of the series to delete")),
    responses(
        (status = 204, description = "Series deleted successfully"),
        (status = 404, description = "Series not found for deletion", body = ErrorResponse),
        (status = 401, description = "Authentication required to delete series", body = ErrorResponse),
        (status = 403, description = "Access denied - cannot delete series not owned by user", body = ErrorResponse),
        (status = 500, description = "Server error during series deletion", body = ErrorResponse)
    ),
    security(("cookieAuth" = [], "bearerAuth" = []))
)]
pub async fn delete_series(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::series::dsl as series_dsl;

    let series_id = path.into_inner();
    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let _existing_series: Series = series_dsl::series
        .filter(series_dsl::id.eq(series_id))
        .filter(series_dsl::user_id.eq(user.id))
        .filter(series_dsl::deleted_at.is_null())
        .first(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::NotFound => {
                ServiceError::NotFound("Series not found".to_owned())
            }
            _ => ServiceError::Database(e.to_string()),
        })?;

    let _updated: Series = diesel::update(series_dsl::series.filter(series_dsl::id.eq(series_id)))
        .set((
            series_dsl::deleted_at.eq(Utc::now().naive_utc()),
            series_dsl::updated_at.eq(Utc::now().naive_utc()),
        ))
        .get_result(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    Ok(HttpResponse::NoContent().finish())
}
