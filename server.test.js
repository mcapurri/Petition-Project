const supertest = require("supertest");
const { app } = require("./server.js");
const cookieSession = require("cookie-session");

// exercise 1
test("GET /petition sends 302 status as a response when no cookie session", () => {
    // create empty cookie session
    cookieSession.mockSessionOnce({});
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/register");
        });
});

// exercise 2
test("GET /register redirects logged in users to the petition", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
    });
    return supertest(app)
        .get("/register")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

test("GET /login redirects logged in users to the petition", () => {
    cookieSession.mockSessionOnce({
        userId: 1,
    });
    return supertest(app)
        .get("/login")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

// exercise 3
test("GET /petition sends 200 status if cookie session", () => {
    cookieSession.mockSessionOnce({
        userId: 2,
        signatureId: 2,
    });
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});

// exercise 4
test("GET /thanks sends 200 status if cookie session", () => {
    cookieSession.mockSessionOnce({
        userId: 2,
        signatureId: null,
    });
    return supertest(app)
        .get("/thanks")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

test("GET /signed sends 200 status if cookie session", () => {
    cookieSession.mockSessionOnce({
        userId: 2,
        signatureId: null,
    });
    return supertest(app)
        .get("/signers")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});
