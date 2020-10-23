const bcrypt = require("bcryptjs");
let { genSalt, hash, compare } = bcrypt;
const { promisify } = require("util");

genSalt = promisify(genSalt);

compare = promisify(compare);

module.exports.compare = compare;
module.exports.hash = (plainTxtPw) =>
    genSalt().then((salt) => hash(plainTxtPw, salt));

// Demo of how the bcrypt functions work

// genSalt()
//     .then((salt) => {
//         console.log('salt:', salt);
//         // hash expects two argument: a plain text pw to hash and a salt
//         return hash('safePassword', salt);
//     })
//     .then((hashedPw) => {
//         console.log('hashed password:', hashedPw);
//         // compare expects two argument: a plain txt pw and a hash to compare it to it
//        // outputs a boolean of whether or not these two match
//         return compare('SafePassword', hashedPw);
//     })
//     .then((matchValueOfCompare) => {
//         console.log('passwords match?', matchValueOfCompare);
//     });
