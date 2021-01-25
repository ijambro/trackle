const express = require("express");
const session = require("express-session");
const metricsRoutes = require("./routes/metrics.js");

console.log("Preparing to launch Express.js server");

const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
    port = 5000;
}
let sessionSecret = process.env.APP_SESSION_SECRET;
if (sessionSecret == null || sessionSecret == "") {
    sessionSecret = "TrackleYourSymptoms";
}

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('json spaces', 2); //Pretty-print JSON responses
app.use(session({
	secret: sessionSecret,
	resave: true,
    saveUninitialized: true
}));

// "Middleware" to log every request
app.use(function(req, res, next) {
    console.log(new Date() + " Request: " + req.url);
    if (!isObjectEmpty(req.query)) {
        console.log(" - Query: " + JSON.stringify(req.query));
    }
    if (!isObjectEmpty(req.params)) {
        console.log(" - Params: " + JSON.stringify(req.params));
    }
    if (!isObjectEmpty(req.body)) {
        console.log(" - Body: " + JSON.stringify(req.body));
    }
    next();
});

// "Middleware" to verify the user has logged in
function verifyLoggedIn(req, res, next) {
	console.log("verifyLoggedIn: " + req.url);

    // If not logged in, render the home page
    if (req.session && req.session.isLoggedIn === true) {
        console.log("User is logged in, with user_id = " + req.session.userId);
        next();
    }
    // Else, redirect to the login page
    else {
        console.log("User is not logged in.  Redirecting to login page.")
        res.redirect("/login");
        return;
    }
}

// WEB ROUTES (unauthenticated)

app.get("/login", (req, res) => {
    res.render("pages/login");
});

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        res.render("pages/login");
    });
});

app.post("/auth", (req, res) => {
    console.log("Authenticating!");

    //TODO: Authenticate the req.body["email"] and req.body["password"]

    req.session.isLoggedIn = true;
    req.session.userId = 1;
    req.session.userFirstName = "First";
    req.session.userLastName = "Last";
    req.session.userEmail = "user@email.com";

    res.redirect("/");
});

//WEB ROUTES (authenticated)

app.get("/", verifyLoggedIn, (req, res) => {
    res.render("pages/home");
});

app.use("/metrics", verifyLoggedIn, metricsRoutes);

// START THE SERVER
app.listen(port, () => console.log("Express.js server is listening on port " + port));

// UTILS

function isObjectEmpty(obj) {
    // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    // We also have to check the constructor because Object.keys(new Date()).length === 0
    return (obj == null || (Object.keys(obj).length === 0 && obj.constructor === Object));
}