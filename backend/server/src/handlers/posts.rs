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
        posts::{CreatePostRequest, Post, PostResponse, PostsListResponse, UpdatePostRequest},
        series::Series,
        series_length::SeriesLength,
    },
};
use utoipa::ToSchema;
use uuid::Uuid;

/// Query parameters for listing posts with pagination
#[derive(Debug, Clone, Copy, Deserialize, ToSchema, utoipa::IntoParams)]
#[schema(example = json!({
    "offset": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "limit": 50
}))]
pub struct ListPostsQuery {
    /// UUID offset for cursor-based posts pagination
    #[schema(example = "d290f1ee-6c54-4b01-90e6-d701748f0851")]
    pub offset: Option<Uuid>,
    /// Maximum number of posts to return (default: 50, max: 100)
    #[schema(example = 50)]
    pub limit: Option<i64>,
    /// Filter posts by series ID
    #[schema(example = "d290f1ee-6c54-4b01-90e6-d701748f0851")]
    pub series_id: Option<Uuid>,
}

/// Create a new post
///
/// # Errors
/// Returns error if series not found, access denied, slug/number conflict, or database error
#[utoipa::path(
    post,
    path = "/api/posts",
    tag = "Posts",
    request_body(content = CreatePostRequest, description = "Post creation data"),
    responses(
        (status = 201, description = "Post created successfully", body = PostResponse),
        (status = 400, description = "Invalid post data", body = ErrorResponse),
        (status = 401, description = "Authentication required to create posts", body = ErrorResponse),
        (status = 403, description = "Access denied - post series does not belong to authenticated user", body = ErrorResponse),
        (status = 409, description = "Post creation failed - slug or number already exists in series", body = ErrorResponse),
        (status = 500, description = "Server error during post creation", body = ErrorResponse)
    ),
    security(("cookieAuth" = [], "bearerAuth" = []))
)]
pub async fn create_post(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    body: web::Json<CreatePostRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::{posts::dsl as posts_dsl, series::dsl as series_dsl};

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let _series: Series = series_dsl::series
        .filter(series_dsl::id.eq(body.series_id))
        .filter(series_dsl::user_id.eq(user.id))
        .filter(series_dsl::deleted_at.is_null())
        .first(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::NotFound => {
                ServiceError::Forbidden("Series not found or access denied".to_owned())
            }
            _ => ServiceError::Database(e.to_string()),
        })?;

    let new_post = Post {
        id: Uuid::new_v4(),
        series_id: body.series_id,
        title: body.title.clone(),
        content: body.content.clone(),
        slug: body.slug.clone(),
        number: body.number,
        is_published: Some(body.is_published.unwrap_or(false)),
        thumbnail_url: body.thumbnail_url.clone(),
        audio_file_id: body.audio_file_id,
        video_file_id: body.video_file_id,
        created_at: Some(Utc::now().naive_utc()),
        updated_at: Some(Utc::now().naive_utc()),
        deleted_at: None,
    };

    let inserted_post: Post = diesel::insert_into(posts_dsl::posts)
        .values(&new_post)
        .get_result(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::DatabaseError(
                diesel::result::DatabaseErrorKind::UniqueViolation,
                _,
            ) => ServiceError::Conflict(
                "Post with this slug or number already exists in series".to_owned(),
            ),
            _ => ServiceError::Database(e.to_string()),
        })?;

    // Update series length
    use shared::schema::series_length::dsl as series_length_dsl;

    let post_count: i64 = posts_dsl::posts
        .filter(posts_dsl::series_id.eq(body.series_id))
        .filter(posts_dsl::deleted_at.is_null())
        .count()
        .get_result(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    let new_series_length = SeriesLength::new(body.series_id, post_count as i32);

    let _rows_affected = diesel::insert_into(series_length_dsl::series_length)
        .values(&new_series_length)
        .on_conflict(series_length_dsl::series_id)
        .do_update()
        .set(series_length_dsl::length.eq(post_count as i32))
        .execute(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    Ok(HttpResponse::Created().json(PostResponse::from(inserted_post)))
}

/// List posts with cursor-based pagination and optional series filtering
///
/// # Errors
/// Returns error if posts database query fails, series filtering fails, or connection issues occur
#[utoipa::path(
    get,
    path = "/api/posts",
    tag = "Posts",
    params(ListPostsQuery),
    responses(
        (status = 200, description = "Posts list retrieved", body = PostsListResponse),
        (status = 401, description = "Authentication required to list posts", body = ErrorResponse),
        (status = 403, description = "Access denied - cannot list posts for series not owned by user", body = ErrorResponse),
        (status = 500, description = "Server error during post listing", body = ErrorResponse)
    ),
    security(("cookieAuth" = [], "bearerAuth" = []))
)]
pub async fn list_posts(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    query: web::Query<ListPostsQuery>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::{posts::dsl as posts_dsl, series::dsl as series_dsl};

    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let limit = query.limit.unwrap_or(50).min(100);

    let mut posts_query = posts_dsl::posts
        .inner_join(series_dsl::series.on(posts_dsl::series_id.eq(series_dsl::id)))
        .filter(series_dsl::user_id.eq(user.id))
        .filter(posts_dsl::deleted_at.is_null())
        .filter(series_dsl::deleted_at.is_null())
        .select(posts_dsl::posts::all_columns())
        .order(posts_dsl::created_at.desc())
        .limit(limit)
        .into_boxed();

    if let Some(series_id) = query.series_id {
        posts_query = posts_query.filter(posts_dsl::series_id.eq(series_id));
    }

    if let Some(offset_id) = query.offset {
        let offset_created_at: chrono::NaiveDateTime = posts_dsl::posts
            .filter(posts_dsl::id.eq(offset_id))
            .select(posts_dsl::created_at)
            .first::<Option<chrono::NaiveDateTime>>(&mut conn)
            .await
            .map_err(|e| ServiceError::Database(e.to_string()))?
            .unwrap_or_else(|| Utc::now().naive_utc());

        posts_query = posts_query.filter(posts_dsl::created_at.lt(offset_created_at));
    }

    let posts_list: Vec<Post> = posts_query
        .load(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    let posts_responses: Vec<PostResponse> =
        posts_list.into_iter().map(PostResponse::from).collect();
    let response = PostsListResponse::from(posts_responses);

    Ok(HttpResponse::Ok().json(response))
}

/// Get a specific post by ID with series ownership validation
///
/// # Errors
/// Returns error if post not found, series access denied, or database connection error
#[utoipa::path(
    get,
    path = "/api/posts/{post_id}",
    tag = "Posts",
    params(("post_id" = Uuid, Path, description = "UUID of the post to retrieve")),
    responses(
        (status = 200, description = "Post retrieved", body = PostResponse),
        (status = 404, description = "Post not found or access denied", body = ErrorResponse),
        (status = 401, description = "Authentication required to view posts", body = ErrorResponse),
        (status = 403, description = "Access denied - post belongs to series not owned by user", body = ErrorResponse),
        (status = 500, description = "Server error during post retrieval", body = ErrorResponse)
    ),
    security(("cookieAuth" = [], "bearerAuth" = []))
)]
pub async fn get_post(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::{posts::dsl as posts_dsl, series::dsl as series_dsl};

    let post_id = path.into_inner();
    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let post: Post = posts_dsl::posts
        .inner_join(series_dsl::series.on(posts_dsl::series_id.eq(series_dsl::id)))
        .filter(posts_dsl::id.eq(post_id))
        .filter(series_dsl::user_id.eq(user.id))
        .filter(posts_dsl::deleted_at.is_null())
        .filter(series_dsl::deleted_at.is_null())
        .select(posts_dsl::posts::all_columns())
        .first(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::NotFound => ServiceError::NotFound("Post not found".to_owned()),
            _ => ServiceError::Database(e.to_string()),
        })?;

    Ok(HttpResponse::Ok().json(PostResponse::from(post)))
}

/// Update a post
///
/// # Errors
/// Returns error if post not found, access denied, slug/number conflict, or database update error
#[utoipa::path(
    put,
    path = "/api/posts/{post_id}",
    tag = "Posts",
    params(("post_id" = Uuid, Path, description = "UUID of the post to update")),
    request_body(content = UpdatePostRequest, description = "Updated post data"),
    responses(
        (status = 200, description = "Post updated successfully", body = PostResponse),
        (status = 404, description = "Post not found for update", body = ErrorResponse),
        (status = 401, description = "Authentication required to update posts", body = ErrorResponse),
        (status = 403, description = "Access denied - cannot update post in series not owned by user", body = ErrorResponse),
        (status = 409, description = "Post update failed - slug or number already exists in series", body = ErrorResponse),
        (status = 500, description = "Server error during post update", body = ErrorResponse)
    ),
    security(("cookieAuth" = [], "bearerAuth" = []))
)]
pub async fn update_post(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    path: web::Path<Uuid>,
    body: web::Json<UpdatePostRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::{posts::dsl as posts_dsl, series::dsl as series_dsl};

    let post_id = path.into_inner();
    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let _existing_post: Post = posts_dsl::posts
        .inner_join(series_dsl::series.on(posts_dsl::series_id.eq(series_dsl::id)))
        .filter(posts_dsl::id.eq(post_id))
        .filter(series_dsl::user_id.eq(user.id))
        .filter(posts_dsl::deleted_at.is_null())
        .filter(series_dsl::deleted_at.is_null())
        .select(posts_dsl::posts::all_columns())
        .first(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::NotFound => ServiceError::NotFound("Post not found".to_owned()),
            _ => ServiceError::Database(e.to_string()),
        })?;

    let current_time = Utc::now().naive_utc();

    let updated_post: Post = diesel::update(posts_dsl::posts.filter(posts_dsl::id.eq(post_id)))
        .set((
            body.title.as_ref().map(|v| posts_dsl::title.eq(v)),
            body.content.as_ref().map(|v| posts_dsl::content.eq(v)),
            body.slug.as_ref().map(|v| posts_dsl::slug.eq(v)),
            body.number.map(|v| posts_dsl::number.eq(v)),
            body.is_published.map(|v| posts_dsl::is_published.eq(v)),
            body.thumbnail_url
                .as_ref()
                .map(|v| posts_dsl::thumbnail_url.eq(v)),
            body.audio_file_id.map(|v| posts_dsl::audio_file_id.eq(v)),
            body.video_file_id.map(|v| posts_dsl::video_file_id.eq(v)),
            posts_dsl::updated_at.eq(current_time),
        ))
        .get_result(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::DatabaseError(
                diesel::result::DatabaseErrorKind::UniqueViolation,
                _,
            ) => ServiceError::Conflict(
                "Post with this slug or number already exists in series".to_owned(),
            ),
            _ => ServiceError::Database(e.to_string()),
        })?;

    Ok(HttpResponse::Ok().json(PostResponse::from(updated_post)))
}

/// Delete a post (soft delete) with series ownership validation
///
/// # Errors
/// Returns error if post not found, series access denied, or database deletion error
#[utoipa::path(
    delete,
    path = "/api/posts/{post_id}",
    tag = "Posts",
    params(("post_id" = Uuid, Path, description = "UUID of the post to delete")),
    responses(
        (status = 204, description = "Post deleted successfully"),
        (status = 404, description = "Post not found for deletion", body = ErrorResponse),
        (status = 401, description = "Authentication required to delete posts", body = ErrorResponse),
        (status = 403, description = "Access denied - cannot delete post in series not owned by user", body = ErrorResponse),
        (status = 500, description = "Server error during post deletion", body = ErrorResponse)
    ),
    security(("cookieAuth" = [], "bearerAuth" = []))
)]
pub async fn delete_post(
    user: User,
    db_service: web::Data<shared::services::db::DbService>,
    path: web::Path<Uuid>,
) -> Result<HttpResponse, actix_web::Error> {
    use shared::schema::{posts::dsl as posts_dsl, series::dsl as series_dsl};

    let post_id = path.into_inner();
    let pool = db_service.pool();
    let mut conn = pool.get().await.map_err(ServiceError::from)?;

    let existing_post: Post = posts_dsl::posts
        .inner_join(series_dsl::series.on(posts_dsl::series_id.eq(series_dsl::id)))
        .filter(posts_dsl::id.eq(post_id))
        .filter(series_dsl::user_id.eq(user.id))
        .filter(posts_dsl::deleted_at.is_null())
        .filter(series_dsl::deleted_at.is_null())
        .select(posts_dsl::posts::all_columns())
        .first(&mut conn)
        .await
        .map_err(|e| match e {
            diesel::result::Error::NotFound => ServiceError::NotFound("Post not found".to_owned()),
            _ => ServiceError::Database(e.to_string()),
        })?;

    let series_id_for_update = existing_post.series_id;

    let _updated: Post = diesel::update(posts_dsl::posts.filter(posts_dsl::id.eq(post_id)))
        .set((
            posts_dsl::deleted_at.eq(Utc::now().naive_utc()),
            posts_dsl::updated_at.eq(Utc::now().naive_utc()),
        ))
        .get_result(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    // Update series length
    use shared::schema::series_length::dsl as series_length_dsl;

    let post_count: i64 = posts_dsl::posts
        .filter(posts_dsl::series_id.eq(series_id_for_update))
        .filter(posts_dsl::deleted_at.is_null())
        .count()
        .get_result(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    let new_series_length = SeriesLength::new(series_id_for_update, post_count as i32);

    let _rows_affected = diesel::insert_into(series_length_dsl::series_length)
        .values(&new_series_length)
        .on_conflict(series_length_dsl::series_id)
        .do_update()
        .set(series_length_dsl::length.eq(post_count as i32))
        .execute(&mut conn)
        .await
        .map_err(|e| ServiceError::Database(e.to_string()))?;

    Ok(HttpResponse::NoContent().finish())
}
