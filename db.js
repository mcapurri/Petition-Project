const spicedPg = require("spiced-pg");

const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/marco"
);

module.exports.addPetioner = (signature, id_user) => {
    const q = `INSERT INTO signatures (signature, id_user)
        VALUES ($1, $2) RETURNING *`; /* aggiungere RETURNING id o * */

    const params = [signature, id_user];
    return db.query(q, params);
};

module.exports.getPetitioner = () => {
    const q = `SELECT * FROM signatures`;
    return db.query(q);
};

module.exports.getNumberPetioner = () => {
    const q = `SELECT COUNT(*) FROM signatures`;
    return db.query(q);
};

module.exports.addAccount = (firstName, lastName, email, password) => {
    const q = `INSERT into users (firstName, lastName, email, password)
        values ($1, $2, $3, $4) RETURNING *`;

    const params = [firstName, lastName, email, password];
    return db.query(q, params);
};

module.exports.getSignature = (id) => {
    const q = `SELECT * FROM signatures WHERE id_user = $1`;
    const params = [id];
    return db.query(q, params);
};

module.exports.getPassword = (email) => {
    const q = `SELECT * FROM users WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
};

module.exports.deleteSignature = (userId) => {
    const d = `DELETE FROM signatures WHERE id_user = ($1)`;
    const replies = [userId];
    return db.query(d, replies);
};

module.exports.deleteAccount = (userId) => {
    const d = `DELETE FROM users WHERE id = ($1)`;
    const replies = [userId];
    return db.query(d, replies);
};

module.exports.deleteProfile = (userId) => {
    const d = `DELETE FROM user_profiles WHERE id_user = ($1)`;
    const replies = [userId];
    return db.query(d, replies);
};

module.exports.getSignatureById = (userId) => {
    // const s = `SELECT signature FROM signatures WHERE id = signatureId`;
    const s = `SELECT signature FROM signatures WHERE signatures.id_user = ($1) `;
    const replies = [userId];
    return db.query(s, replies);
};

module.exports.countResponses = () => {
    const a = ` SELECT COUNT (*) FROM signatures WHERE signature IS NOT NULL`;
    return db.query(a);
};

module.exports.getUserById = (userId) => {
    // const s = `SELECT signature FROM signatures WHERE id = signatureId`;
    const s = `SELECT firstName, lastName FROM users WHERE id = ($1)`;
    const replies = [userId];
    return db.query(s, replies);
};

module.exports.getUserDetails = (userID) => {
    const u = `SELECT firstname, lastname, date_of_birth, city, country, url FROM users JOIN user_profiles ON users.id = user_profiles.id_user WHERE users.id = ($1)`;
    const replies = [userID];
    return db.query(u, replies);
};

module.exports.updateProfile = (
    userId,
    dateBirth,
    city,
    country,
    url,
    hashPw
) => {
    const b = `INSERT INTO user_profiles (id_user, date_of_birth, city, country, url)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id_user)
    DO UPDATE SET date_of_birth = ($2), city = ($3), country = ($4), url = ($5)`;
    // UPDATE user WHERE user_profile.id_user = user.id SET password = ($6)`;
    const replies = [userId, dateBirth, city, country, url];
    return db.query(b, replies);
};

module.exports.getSigners = () => {
    const s = `SELECT firstname, lastname, city, country, url FROM users LEFT JOIN user_profiles ON users.id = user_profiles.id_user INNER JOIN signatures ON users.id = signatures.id_user`;
    //  WHERE signature IS NOT NULL
    return db.query(s);
};

module.exports.getSignersByCity = (city) => {
    const c = `SELECT firstname, lastname FROM users LEFT JOIN user_profiles ON users.id = user_profiles.id_user  JOIN signatures ON users.id = signatures.id_user   WHERE LOWER(city) = LOWER($1) `;
    const replies = [city];
    return db.query(c, replies);
};

//test
