var _ = require("lodash");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");

var clearances = [];

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Initialize the app.
var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});

// CLEARANCES API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/clearances"
 *    GET: finds all clearances
 *    POST: creates a new clearance
 */

app.get("/clearances", function(req, res) {
  try {
    res.status(200).json(clearances);
  }
  catch(e) {
    res.status(204).json(e.message);
  }
});

app.post("/clearances", function(req, res) {
  var newClearance = req.body;
  newClearance.createDate = new Date();

  if (!(req.body.userAgent && req.body.cookies)) {
    handleError("Invalid user input", "Must provide a User Agent and Cookies.", 400);
  }

  try {
    newClearance._id = _.uniqueId();
    clearances.push(newClearance);
    res.status(201).json(newClearance);
  }
  catch(err) {
    handleError(err.message, "Failed to create new clearance.");
  }
});

/*  "/clearances/:id"
 *    GET: find clearance by id
 *    PUT: update clearance by id
 *    DELETE: deletes clearance by id
 */

app.get("/clearances/:id", function(req, res) {
  try {
    var index = _.findIndex(clearances, {_id: req.params.id});
    res.status(200).json(clearances[index]);
  }
  catch(err) {
    handleError(err.message, "Failed to get clearance");
  }
});

app.put("/clearances/:id", function(req, res) {
  var updateDoc = req.body;

  try {
    var index = _.findIndex(clearances, {_id: req.params.id});
    clearances[index] = updateDoc;
    res.status(204).end();
  }
  catch(err) {
    handleError(err.message, "Failed to update clearance");
  }
});

app.delete("/clearances/:id", function(req, res) {
  try {
    var index = _.findIndex(clearances, {_id: req.params.id});
    clearances.splice(index, 1);
    res.status(204).end();
  }
  catch(err) {
    handleError(err.message, "Failed to delete clearance");
  }
});
