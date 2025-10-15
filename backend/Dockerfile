FROM rust:1.87-slim-bookworm AS chef
# Install system dependencies - this layer will be cached unless the package list changes
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update -y && \
    apt-get -y install pkg-config libssl-dev libpq-dev g++ curl && \
    rm -rf /var/lib/apt/lists/*

# Install cargo-chef - cached unless cargo-chef version changes
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    cargo install cargo-chef
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare  --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this layer will be cached unless Cargo.lock changes
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/app/target \
    cargo chef cook --release --recipe-path recipe.json

# Build application
COPY . .
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/app/target \
    cargo build --release && \
    cp /app/target/release/server /app/server

FROM debian:bookworm-slim AS runtime
WORKDIR /app

# Install runtime dependencies - cached unless package list changes
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y libpq-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/server /app/backend
COPY ./migrations/ /app/migrations
COPY diesel.toml .

EXPOSE 8080
ENTRYPOINT ["/app/backend"]