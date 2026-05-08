CREATE TABLE IF NOT EXISTS password_set_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_set_tokens_token ON password_set_tokens(token);
CREATE INDEX idx_password_set_tokens_user_id ON password_set_tokens(user_id);
CREATE INDEX idx_password_set_tokens_expires_at ON password_set_tokens(expires_at);
