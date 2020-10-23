exports.requireLoggedInUser = function (req, res, next) {
    if (!req.session.userId && req.url != "/login" && req.url != "/register") {
        res.redirect("/register");
    } else {
        next();
    }
};

exports.requireLoggedOutUser = function (req, res, next) {
    if (req.session.signatureId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

exports.requireNoSignature = function (req, res, next) {
    if (req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        next();
    }
};

exports.requireSignature = function (req, res, next) {
    if (!req.session.signatureId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

exports.secureCookies = function (req, res, next) {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
};
