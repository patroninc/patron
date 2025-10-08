CREATE TABLE series_length (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    length INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(series_id)
);

CREATE OR REPLACE FUNCTION update_series_length_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_series_length_timestamp
BEFORE UPDATE ON series_length
FOR EACH ROW
EXECUTE FUNCTION update_series_length_timestamp();

CREATE INDEX idx_series_length_series_id ON series_length(series_id);
