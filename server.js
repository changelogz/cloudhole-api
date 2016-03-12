var _ = require("lodash");
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var jsonfile = require("jsonfile");
var request = require("request");
var uuid = require('node-uuid');

var file = "cloudhole.json";
var surge = require("surge")({ default: "publish" })

var saveClearances = function() {
  jsonfile.writeFile(file, clearances, {spaces: 2}, function(err) {
    if (err != null) {
      console.error(err);
    }
    else {
      surge([".", "cloudhole.surge.sh"]);
    }
  });
};

var clearances = [];
try {
  clearances = jsonfile.readFileSync(file);
  saveClearances();
}
catch(e) {
  var url = "https://cloudhole.surge.sh/cloudhole.json"
  request({
      url: url,
      json: true
  }, function (error, response, data) {
    if (!error && response.statusCode === 200) {
      clearances.push(data);
    }
    saveClearances();
  });
}

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
function handleError(res, reason, message, code) {
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
    handleError(res, "Invalid user input", "Must provide a User Agent and Cookies.", 400);
    return;
  }

  if (_.findIndex(clearances, {userAgent: req.body.userAgent, cookies: req.body.cookies}) != -1) {
    handleError(res, "Duplicate clearance", "UserAgent and cookies already exist.", 400);
    return;
  }

  try {
    newClearance._id = uuid.v4();
    clearances.push(newClearance);
    saveClearances();
    res.status(201).json(newClearance);
  }
  catch(err) {
    handleError(res, "Failed to create new clearance.", err.message, 500);
  }
});

app.post("/load", function(req, res) {
  var loadClearances = req.body;

  for (var i = 0; i < loadClearances.length; i++) {
    var clearance = loadClearances[i];
    if (_.findIndex(clearances, {userAgent: clearance.userAgent, cookies: clearance.cookies}) == -1) {
      clearances.push(clearance);
    }
  }
  res.status(201).end();
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
    handleError(res, "Failed to get clearance", err.message, 500);
  }
});

app.put("/clearances/:id", function(req, res) {
  var updateDoc = req.body;

  try {
    var index = _.findIndex(clearances, {_id: req.params.id});
    clearances[index] = updateDoc;
    saveClearances();
    res.status(204).end();
  }
  catch(err) {
    handleError(res, "Failed to update clearance", err.message, 500);
  }
});

app.delete("/clearances/:id", function(req, res) {
  try {
    var index = _.findIndex(clearances, {_id: req.params.id});
    clearances.splice(index, 1);
    saveClearances();
    res.status(204).end();
  }
  catch(err) {
    handleError(res, "Failed to delete clearance", err.message, 500);
  }
});
