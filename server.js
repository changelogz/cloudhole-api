var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var CLEARANCES_COLLECTION = "clearances";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGOLAB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
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
  db.collection(CLEARANCES_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(err.message, "Failed to get clearances.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/clearances", function(req, res) {
  var newClearance = req.body;
  newClearance.createDate = new Date();

  if (!(req.body.userAgent || req.body.cookies)) {
    handleError("Invalid user input", "Must provide a User Agent and Cookies.", 400);
  }

  db.collection(CLEARANCES_COLLECTION).insertOne(newClearance, function(err, doc) {
    if (err) {
      handleError(err.message, "Failed to create new clearance.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/clearances/:id"
 *    GET: find clearance by id
 *    PUT: update clearance by id
 *    DELETE: deletes clearance by id
 */

app.get("/clearances/:id", function(req, res) {
  db.collection(CLEARANCES_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(err.message, "Failed to get clearance");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/clearances/:id", function(req, res) {
  var updateDoc = req.body;

  db.collection(CLEARANCES_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(err.message, "Failed to update clearance");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/clearances/:id", function(req, res) {
  db.collection(CLEARANCES_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(err.message, "Failed to delete clearance");
    } else {
      res.status(204).end();
    }
  });
});
