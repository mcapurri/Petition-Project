// const express = require("express");
// const app = express();

// const db = require("./db");

// var cookieSession = require("cookie-session");

// const cookieParser = require("cookie-parser");

// const hb = require("express-handlebars");
// const { request } = requçire("express");
// app.engine("handlebars", hb());
// app.set("view engine", "handlebars");

// app.use(express.urlencoded({ extended: false }));

// // app.use(function log(req, res, next) {
// //     console.log(req.method, req.url, req.body);
// //     next();
// // });

// app.use(cookieParser());

// app.use(express.static("./public"));

// app.use(
//     cookieSession({
//         secret: `I'm always angry.`,
//         maxAge: 1000 * 60 * 60 * 24 * 14, // tempo massimo durata sessione
//     })
// );

// /* app.use(function (req, res, next) {
//     console.log("cookie session info", req.url, req.session);
//     next();
// }); */

// app.get("/petition", (req, res) => {
//     console.log("made it to the petition");
//     if (req.cookies.firstName) {
//         res.redirect("/thanks");
//     } else {
//         res.render("petition", {
//             layout: "main",
//         });
//     }
// });

// app.post("/petition", (req, res) => {
//     db.addPetioner(req.body.first, req.body.last, req.body.signature)
//         .then((insertReturn) => {
//             // insertReturn è il ritorno dal database (comando insert in addPetitioner in db.js )
//             /* console.log("insertReturn: ", insertReturn); */
//             /* console.log(
//                 "insertReturn.rows.signature: ",
//                 insertReturn.rows[0].signature
//             ); */
//             req.session.signatureId = insertReturn.rows[0].id;
//             res.cookie("firstName", req.body.first); // storing session cookie
//             /* req.session.signed = true; questo sarebbe il cookie precedente, io ho usato req.body.first */
//             /* req.session.signatureId = USARE il log di insertReturn; il ritorno dal database per capire come salvare i dati e riutilizzarli per mostrare la firma  */
//             res.redirect("/thanks");
//         })
//         .catch((e) => console.log("err: ", e));
//     // rerender petition template with err message
// });

// app.get("/thanks", (req, res) => {
//     const signatureId = req.session.signatureId;
//     console.log("signatureId: ", signatureId);

//     // db.getSignatureById(signatureId)
//     //     .then((returnedSignature) => {
//     //         console.log(
//     //             "returnedSignature.rows[0].signature",
//     //             returnedSignature.rows[0].signature
//     //         );
//     //         const signatureImg = returnedSignature.rows[0].signature;
//     //         if (req.cookies.firstName) {
//     //             res.render("thanks", {
//     //                 layout: "thanks_template",
//     //                 signatureImg,
//     //             });
//     //         } else {
//     //             res.redirect("/petition");
//     //         }
//     //     })
//     //     .catch((e) => console.log("e: ", e));
//     // db.getNumberPetioner()
//     //     .then((count) => {
//     //         console.log("count.rows[0].count: ", count.rows[0].count);
//     //         const numberOfPetitioners = count.rows[0].count;
//     //         if (req.cookies.firstName) {
//     //             const thanksName = req.cookies.firstName;
//     //             res.render("thanks", {
//     //                 layout: "thanks_template",
//     //                 thanksName,
//     //                 numberOfPetitioners,
//     //             });
//     //         } else {
//     //             res.redirect("/petition");
//     //         }
//     //     })
//     //     .catch((e) => console.log("e: ", e));
//     db.getNumberPetioner().then((count) => {
//         const numberOfPetitioners = count.rows[0].count;
//         db.getSignatureById(signatureId)
//             .then((returnedSignature) => {
//                 const signatureImg = returnedSignature.rows[0].signature;
//                 if (req.cookies.firstName) {
//                     const thanksName = req.cookies.firstName;
//                     res.render("thanks", {
//                         layout: "thanks_template",
//                         thanksName,
//                         numberOfPetitioners,
//                         signatureImg,
//                     });
//                 } else {
//                     res.redirect("/petition");
//                 }
//             })
//             .catch((e) => console.log("e: ", e));
//     });
// });

// app.get("/signers", (req, res) => {
//     /* req.session.name = "Larry Lobster";  */ // this stores info in the session (real cookie)
//     db.getPetitioner()
//         .then((results) => {
//             if (!req.cookies.firstName) {
//                 res.redirect("/petition");
//             } else {
//                 const signers = results.rows;
//                 res.render("signers", {
//                     layout: "signers_template",
//                     signers,
//                 });
//             }
//             // results.rows is where the data is placed in the object we get as answer
//             // console.log("result.rows: ", results.rows);
//         })
//         .catch((e) => console.log("err: ", e));
// });

// app.listen(8080, () => console.log("petition server is listening"));

////// NEW ///////
const express = require("express");
const app = express();
const router = require("./routers/router");
const cookieParser = require("cookie-parser");
const cookieSession = require("./_mocks_/cookie-session");
const csurf = require("./_mocks_/csurf");
const hb = require("express-handlebars");
const path = require("path");
const db = require("./db");
// const { SESSION_SECRET: sessionSecret } = require("./secrets");

/// Handlebars
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

/// Serve public
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.json());

////Express Session Middleware
app.use(
    cookieSession({
        // secret:
        //     process.env.SESSION_SECRET || require("./secrets").sessionSecret,
        maxAge: 1000 * 60 * 60 * 24 * 90,
        sameSite: true,
    })
);
// Body Parser
app.use(
    express.urlencoded({
        extended: false,
    })
);
// app.use(cookieParser());
app.use(csurf());
// app.use(secureCookies);

app.use(router);

// app.use(function (request, response, next) {
//     console.log("url, session: ", request.url, request.session);
//     next();
// });

app.use(function (req, res, next) {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

const PORT = process.env.PORT || 8082;

if (require.main === module) {
    app.listen(PORT, () => console.log("Server is up and listening!"));
}
