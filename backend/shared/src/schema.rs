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

diesel::allow_tables_to_appear_in_same_query!(email_verification_tokens, users,);
