const express = require("express");
const symptomsRouter = require("./routes/symptoms.js");

console.log("Preparing to launch Express.js server");

const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
    port = 5000;
}

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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

//WEB ROUTES

app.get("/", (req, res) => {
    res.render("pages/home");
});

app.get("/login", (req, res) => {
    res.render("pages/login");
});

// Routers for "mini-apps"
app.use("/symptoms", symptomsRouter);

app.listen(port, () => console.log("Express.js server is listening on port " + port));

// UTILS

function isObjectEmpty(obj) {
    // https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
    // We also have to check the constructor because Object.keys(new Date()).length === 0
    return (obj == null || (Object.keys(obj).length === 0 && obj.constructor === Object));
}