const express = require("express");
const app = express();
const router = express.Router();
const {
    requireLoggedInUser,
    requireLoggedOutUser,
    requireNoSignature,
    requireSignature,
    secureCookies,
} = require("../middleware/middleware");

const db = require("../db");

// Bcrypt Config
const { compare, hash } = require("../bc");
const { decodeBase64 } = require("bcryptjs");

//Cookie
app.use(secureCookies);

/////Routes

router.get("/", (req, res) => {
    res.redirect("register");
});

router.get("/register", requireLoggedOutUser, (req, res) => {
    if (!req.session.userId) {
        res.render("register", {
            layout: "main",
            hideNav: true,
        });
    } else {
        console.log("req.session.userId", req.session.userId);
        res.redirect("./petition");
    }
});

router.post("/register", requireLoggedOutUser, (req, res) => {
    const { firstName, lastName, email, password, password2 } = req.body;
    let errors = [];

    //Check required fields
    if (!firstName || !lastName || !email || !password || !password2) {
        errors.push({ msg: "Please fill in all fields" });
    }

    //Check passwords match
    if (password !== password2) {
        errors.push({ msg: "Passwords do not match" });
    }
    //Check password length
    if (password.length < 1) {
        errors.push({ msg: "Password should be at least 5 characters" });
    }
    if (errors.length > 0) {
        res.render("register", {
            errors,
            hideNav: true,
        });
    } else {
        hash(password)
            .then((hashedPw) => {
                return db.addAccount(firstName, lastName, email, hashedPw);
            })
            .then((registerReturn) => {
                console.log("Added Account num: ", registerReturn.rows[0].id);
                req.session.userId = registerReturn.rows[0].id;
                res.redirect("../petition");
            })
            .catch((e) => {
                console.log("Error in register Post", e);
                res.render("/register");
            });
    }
});

router.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login", {
        layout: "main",
        hideNav: true,
    });
});

router.post("/login", requireLoggedOutUser, (req, res) => {
    const { email, password } = req.body;
    console.log("Login email: ", email);
    console.log("Login password: ", password);
    if (!email || !password) {
        return res.render("login", {
            layout: "main",
            hideNav: true,
        });
    } else {
        db.getPassword(email)
            .then((returnPd) => {
                compare(password, returnPd.rows[0].password)
                    .then((comparedVal) => {
                        if (comparedVal === true) {
                            req.session.userId = returnPd.rows[0].id;
                            res.redirect("./petition");
                        } else {
                            return res.render("login", {
                                layout: "main",
                                hideNav: true,
                            });
                        }
                    })
                    .catch((e) => {
                        console.log("error", e);
                        res.redirect("/login");
                    });
            })
            .catch((e) => {
                console.log("error", e);
                return res.render("login", {
                    layout: "main",
                    hideNav: true,
                });
            });
    }
});

router.get("/petition", requireNoSignature, requireLoggedInUser, (req, res) => {
    const userId = req.session.userId;
    db.getSignature(userId)
        .then((results) => {
            if (results.rows.length !== 0) {
                req.session.signatureId = results.rows[0].id;
                console.log("req.session.signatureId", req.session.signatureId);
                res.redirect("../thanks");
            } else {
                res.render("petition", {
                    layout: "main",
                });
            }
        })
        .catch((e) => {
            console.log("error in petition post", e);
            res.render("petition");
        });
});
router.post("/petition", requireNoSignature, (req, res) => {
    userId = req.session.userId;
    console.log("userId: ", userId);
    if (!req.session.signatureId) {
        db.addPetioner(req.body.signature, userId)
            .then((results) => {
                req.session.signatureId = results.rows[0].id;
                req.session.firstName = results.rows[0].firstName;
                req.session.lastName = results.rows[0].lastName;
                req.session.signature = results.rows[0].signature;
                console.log("Petition signed");
                res.redirect("../thanks");
            })

            .catch((e) => {
                console.log("error in petition post", e);
                res.render("petition");
            });
    }
});

router.get("/thanks", requireSignature, (req, res) => {
    const signatureId = req.session.signatureId;
    const userId = req.session.userId;
    // var modal = window.document.getElementById("modal");
    // var deleteBtn = res.getElementById("deleteBtn");
    Promise.all([
        db.countResponses(),
        db.getSignatureById(userId),
        db.getUserById(userId),
    ])
        .then((response) => {
            console.log(
                "response obj",
                response[0].rows[0].count,
                response[2].rows[0].firstname,
                response[2].rows[0].lastname
            );
            let responseCount = response[0].rows[0].count;
            let signatureURL = response[1].rows[0].signature;
            let firstname = response[2].rows[0].firstname;
            let lastname = response[2].rows[0].lastname;

            res.render("thanks", {
                layout: "main",
                responseCount,
                signatureURL,
                firstname,
                lastname,
            });
        })
        .catch((e) => {
            console.log("error in the SQL statement", e);
        });

    // deleteBtn.onclick = function () {
    //     modal.styles.display = "flex";
    //     overlay.styles.display = "block";
    // };
});

// router.post("/thanks"),
//     (req, res) => {
//         const userId = req.session.userId;
//         console.log("post....");
//         if ($_POST["unsign"]) {
//             db.deleteSignature(userId)
//                 .then((result) => {
//                     console.log("Signature deleted");
//                 })
//                 .catch((e) => {
//                     console.log("error", e);
//                     res.redirect("../thanks");
//                 });
//             req.session.signatureId = null;
//             res.redirect("../petition");
//         }
//         // ($_POST["action"] == "delete")
//         else {
//             Promise.all([
//                 db.deleteAccount(userId),
//                 db.deleteSignature(userId),
//                 db.deleteProfile(userId),
//             ])
//                 .then((result) => {
//                     console.log("account deleted", result);
//                 })
//                 .catch((e) => {
//                     console.log("error", e);
//                     res.redirect("/delete");
//                 });
//             req.session.userId = null;
//             req.session.signatureId = null;
//             res.redirect("/register");
//         }
//     };

router.post("/unsign", requireSignature, (req, res) => {
    const userId = req.session.userId;

    db.deleteSignature(userId)
        .then((result) => {
            console.log("Signature deleted");
            req.session.signatureId = null;
            res.redirect("../petition");
        })
        .catch((e) => {
            console.log("error", e);
            res.redirect("../thanks");
        });
    // req.session.signatureId = null;
    // res.redirect("../petition");
});

router.post("/delete", requireNoSignature, (req, res) => {
    const userId = req.session.userId;
    console.log("in post/delete ");
    Promise.all([
        db.deleteAccount(userId),
        db.deleteSignature(userId),
        db.deleteProfile(userId),
    ])
        .then((result) => {
            console.log("account deleted", result);
            req.session.userId = null;
            req.session.signatureId = null;
            res.redirect("/register");
        })
        .catch((e) => {
            console.log("error", e);
            res.redirect("/delete");
            // with an error message.
        });
    // req.session.userId = null;
    // req.session.signatureId = null;
    // res.redirect("/register");
});

router.get("/signers", requireSignature, (req, res) => {
    db.getSigners()
        .then((result) => {
            console.log("result rows", result.rows);
            res.render("signers", {
                layout: "main",
                names: result.rows,
                helpers: {
                    lower(text) {
                        return text.toLowerCase();
                    },
                },
            });
        })
        .catch((e) => {
            console.log("error", e);
        });
});

router.get("/signers/:city", requireSignature, (req, res) => {
    const { city } = req.params;
    db.getSignersByCity(city)
        .then((result) => {
            console.log("this is the result", result.rows);
            res.render("citysigners", {
                layout: "main",
                names: result.rows,
                city: city,
            });
        })
        .catch((e) => {
            console.log("error", e);
        });
});

router.post("/thanks/delete", (req, res) => {});

router.get("/profile", requireLoggedInUser, (req, res) => {
    const userId = req.session.userId;

    db.getUserDetails(userId)
        .then((results) => {
            console.log("details obj: ", results.rows[0]);
            // const firstName = results.rows[0].firstName;
            // const lastName = results.rows[0].lastName;
            const dateBirth = results.rows[0].date_of_birth;
            let dateRev;
            if (dateBirth != null) {
                dateRev = dateBirth.split("-").reverse().join("-");
            }
            const city = results.rows[0].city;
            const country = results.rows[0].country;
            const url = results.rows[0].url;
            console.log("User details", dateRev, city, country, url);
            res.render("profile", {
                layout: "main",
                dateBirth,
                city,
                country,
                url,
            });
        })
        .catch((e) => {
            console.log("error", e);
            res.render("profile");
            // with an error message.
        });
});

router.post("/profile", (req, res) => {
    const userId = req.session.userId;
    const { dateBirth, city, country, url } = req.body;
    let safeUrl = "";

    if (url.startsWith("http://") || url.startsWith("https://") || url === "") {
        safeUrl = url;
        console.log("the website is ", safeUrl);
    } else {
        var start = "http://";
        safeUrl = start.concat(url);
        console.log("the website is ", safeUrl);
    }
    if (dateBirth) {
        dateBirth = dateBirth.split("-").reverse().join("-");
    }

    db.updateProfile(userId, dateBirth, city, country, safeUrl)
        .then((result) => {
            console.log("login result.rows", result.rows);
            res.redirect("/petition");
        })
        .catch((e) => {
            console.log("error", e);
            res.render("profile");
            // with an error message.
        });
});

router.get("/profile/edit", (req, res) => {
    res.sendStatus(200);
});

router.post("/profile/edit", (req, res) => {
    res.sendStatus(200);
});

router.get("/logout", (req, res) => {
    req.session.userId = null;
    req.session.signatureId = null;
    res.redirect("./login");
});

// router.get("/delete", (req, res) => {
//     res.render("delete");
// });

module.exports = router;
