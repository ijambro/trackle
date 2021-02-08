const express = require("express");
const session = require("express-session");
const MySQLSessionStore = require("express-mysql-session")(session);
const mysqlRecorder = require("./controllers/MySQLRecorder");
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

const NO_LOGIN = "Please login to use the application.";
const INCORRECT_LOGIN = "Incorrect email or password.  Please try again.";
const CREATE_FAILED = "Registration failed.  Please try again.";
const PASSWORDS_MUST_MATCH = "You must enter matching passwords.  Please try again.";

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('json spaces', 2); //Pretty-print JSON responses
app.use(session({
	secret: sessionSecret,
	resave: false,
    saveUninitialized: false,
    store: new MySQLSessionStore({}, mysqlRecorder.promisePool)
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

    // If logged in, render the requested page
    if (req.session && req.session.isLoggedIn === true) {
        console.log("User is logged in, with user_id = " + req.session.userId);
        next();
    }
    // Else, redirect to the login page
    else {
        console.log("User is not logged in.  Redirecting to login page.")
        res.render("pages/login", {
            error_message: NO_LOGIN
        });
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

app.post("/login", async (req, res) => {
    console.log("Authenticating " + req.body["email"]);

    // Authenticate the req.body["email"] and req.body["password"]
    let user = await mysqlRecorder.authenticate(
        req.body["email"], 
        req.body["password"]);
    console.log("Response from MySQLRecorder: ");
    console.log(user);

    if (user && user.email === req.body["email"]) {
        req.session.isLoggedIn = true;
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.userFirstName = user.first_name;
        req.session.userLastName = user.last_name;
        req.session.userTimezoneOffset = req.body["tzOffset"];

        res.redirect("/");
    } else {
        res.render("pages/login", {
            error_message: INCORRECT_LOGIN,
            email: req.body["email"]
        });
    }

});

app.post("/register", async (req, res) => {
    console.log("Registering " + req.body["email"]);

    if (req.body["password"] !== req.body["confirm_password"]) {
        res.render("pages/login", {
            error_message: PASSWORDS_MUST_MATCH,
            email: req.body["email"]
        });
        return;
    }

    // Store all the fields for the new user
    let user = await mysqlRecorder.create(
        req.body["email"], 
        req.body["password"],
        req.body["first_name"], 
        req.body["last_name"]);
    console.log("Response from MySQLRecorder: ");
    console.log(user);

    if (user && user.email === req.body["email"]) {
        req.session.isLoggedIn = true;
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.userFirstName = user.first_name;
        req.session.userLastName = user.last_name;
        req.session.userTimezoneOffset = req.body["tzOffset"];

        res.redirect("/");
    } else {
        res.render("pages/login", {
            error_message: CREATE_FAILED,
            email: req.body["email"]
        });
    }

});

//WEB ROUTES (authenticated)

app.get("/", verifyLoggedIn, (req, res) => {
    res.render("pages/home", {
        userFirstName: req.session.userFirstName
    });
});

app.use("/metrics", verifyLoggedIn, metricsRoutes);

app.get("/viewer", verifyLoggedIn, (req, res) => {
    res.render("pages/viewer", {
        userFirstName: req.session.userFirstName
    });
});

// START THE SERVER
app.listen(port, () => console.log("Express.js server is listening on port " + port));

// UTILS

function isObjectEmpty(obj) {
    // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    // We also have to check the constructor because Object.keys(new Date()).length === 0
    return (obj == null || (Object.keys(obj).length === 0 && obj.constructor === Object));
}