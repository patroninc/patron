// @generated automatically by Diesel CLI.

#![allow(clippy::pub_use)]
#![allow(clippy::single_char_lifetime_names)]

diesel::table! {
    email_verification_tokens (id) {
        id -> Uuid,
        user_id -> Uuid,
        #[max_length = 255]
        token -> Varchar,
        expires_at -> Timestamp,
        created_at -> Timestamp,
    }
}

diesel::table! {
    posts (id) {
        id -> Uuid,
        series_id -> Uuid,
        #[max_length = 255]
        title -> Varchar,
        content -> Text,
        #[max_length = 255]
        slug -> Varchar,
        number -> Int4,
        is_published -> Nullable<Bool>,
        is_premium -> Nullable<Bool>,
        thumbnail_url -> Nullable<Text>,
        audio_file_id -> Nullable<Uuid>,
        video_file_id -> Nullable<Uuid>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    series (id) {
        id -> Uuid,
        user_id -> Uuid,
        #[max_length = 255]
        title -> Varchar,
        description -> Nullable<Text>,
        #[max_length = 255]
        slug -> Varchar,
        #[max_length = 100]
        category -> Nullable<Varchar>,
        cover_image_url -> Nullable<Text>,
        is_published -> Nullable<Bool>,
        is_monetized -> Nullable<Bool>,
        #[max_length = 50]
        pricing_tier -> Nullable<Varchar>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    user_files (id) {
        id -> Uuid,
        user_id -> Uuid,
        filename -> Text,
        original_filename -> Text,
        file_path -> Text,
        file_size -> Int8,
        mime_type -> Text,
        file_hash -> Text,
        status -> Text,
        metadata -> Nullable<Jsonb>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    users (id) {
        id -> Uuid,
        email -> Text,
        password_hash -> Nullable<Text>,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
        #[max_length = 255]
        display_name -> Nullable<Varchar>,
        avatar_url -> Nullable<Text>,
        #[max_length = 50]
        auth_provider -> Varchar,
        email_verified -> Bool,
        last_login -> Nullable<Timestamp>,
        description -> Nullable<Text>,
    }
}

diesel::joinable!(email_verification_tokens -> users (user_id));
diesel::joinable!(posts -> series (series_id));
diesel::joinable!(series -> users (user_id));
diesel::joinable!(user_files -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    email_verification_tokens,
    posts,
    series,
    user_files,
    users,
);
