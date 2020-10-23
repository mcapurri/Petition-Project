DROP TABLE IF EXISTS user_profiles;

  CREATE TABLE user_profiles(
    id SERIAL PRIMARY KEY,
    date_of_birth DATE,
    city VARCHAR(30),
    country VARCHAR(30),
    url VARCHAR(255),
    id_user INT NOT NULL UNIQUE,
    FOREIGN KEY(id_user) REFERENCES users(id) 
  );
