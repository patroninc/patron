// @generated automatically by Diesel CLI.

diesel::table! {
    audio_clips (id) {
        id -> Uuid,
        prompt -> Text,
        character_id -> Uuid,
        s3_key -> Text,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    characters (id) {
        id -> Uuid,
        name -> Varchar,
        voice_id -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    clips (id) {
        id -> Uuid,
        s3_key -> Varchar,
        celeb_id -> Uuid,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    generations (id) {
        id -> Uuid,
        clip_id -> Uuid,
        character_id -> Uuid,
        s3_key -> Nullable<Text>,
        status -> Text,
        error -> Nullable<Text>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        audio_clip_id -> Uuid,
        prediction_id -> Text,
    }
}

diesel::table! {
    user_audio_clips (id) {
        id -> Uuid,
        user_id -> Uuid,
        audio_clip_id -> Uuid,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    user_generations (id) {
        id -> Uuid,
        user_id -> Uuid,
        generation_id -> Uuid,
        created_at -> Nullable<Timestamp>,
        updated_at -> Nullable<Timestamp>,
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
    }
}

diesel::joinable!(audio_clips -> characters (character_id));
diesel::joinable!(generations -> audio_clips (audio_clip_id));
diesel::joinable!(generations -> characters (character_id));
diesel::joinable!(generations -> clips (clip_id));
diesel::joinable!(user_audio_clips -> audio_clips (audio_clip_id));
diesel::joinable!(user_audio_clips -> users (user_id));
diesel::joinable!(user_generations -> generations (generation_id));
diesel::joinable!(user_generations -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    audio_clips,
    characters,
    clips,
    generations,
    user_audio_clips,
    user_generations,
    users,
);
