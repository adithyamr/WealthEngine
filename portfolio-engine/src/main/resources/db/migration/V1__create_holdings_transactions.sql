-- WealthEngine Schema V1: Holdings and Transactions
-- Supports all Indian asset types: STOCK, MF, ETF, PPF, FD, NPS, EPF

CREATE TABLE IF NOT EXISTS users (
    id          VARCHAR(50) PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS holdings (
    id                    BIGSERIAL PRIMARY KEY,
    user_id               VARCHAR(50)    NOT NULL REFERENCES users(id),
    asset_type            VARCHAR(20)    NOT NULL,
    symbol                VARCHAR(30),
    name                  VARCHAR(200)   NOT NULL,
    quantity              NUMERIC(20, 6),
    purchase_price        NUMERIC(20, 4) NOT NULL,
    current_price         NUMERIC(20, 4),
    purchased_at          DATE           NOT NULL,
    exchange              VARCHAR(20),
    sector                VARCHAR(100),
    interest_rate_percent NUMERIC(5, 2),
    maturity_date         DATE,
    maturity_amount       NUMERIC(20, 4),
    isin                  VARCHAR(12),
    amfi_code             VARCHAR(20),
    active                BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_holding_user   ON holdings (user_id);
CREATE INDEX idx_holding_type   ON holdings (asset_type);
CREATE INDEX idx_holding_symbol ON holdings (symbol);

CREATE TABLE IF NOT EXISTS transactions (
    id               BIGSERIAL PRIMARY KEY,
    holding_id       BIGINT         NOT NULL REFERENCES holdings(id),
    user_id          VARCHAR(50)    NOT NULL REFERENCES users(id),
    type             VARCHAR(20)    NOT NULL,
    transaction_date DATE           NOT NULL,
    quantity         NUMERIC(20, 6) NOT NULL,
    price            NUMERIC(20, 4) NOT NULL,
    total_amount     NUMERIC(20, 4) NOT NULL,
    brokerage        NUMERIC(10, 4) DEFAULT 0,
    taxes            NUMERIC(10, 4) DEFAULT 0,
    notes            TEXT,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tx_holding ON transactions (holding_id);
CREATE INDEX idx_tx_date    ON transactions (transaction_date);
CREATE INDEX idx_tx_user    ON transactions (user_id);
