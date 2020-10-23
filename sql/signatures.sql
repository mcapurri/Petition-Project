-- comments in SQL look like this --
-- if we change anything in here we need to rerun the file, or the code --

DROP TABLE IF EXISTS signatures;


CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    signature TEXT NOT NULL,
    id_user INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(id_user) REFERENCES users(id)
);
