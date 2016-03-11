angular.module("clearancesApp", ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "list.html",
                controller: "ListController",
                resolve: {
                    clearances: function(Clearances) {
                        return Clearances.getClearances();
                    }
                }
            })
            .when("/new/clearance", {
                controller: "NewClearanceController",
                templateUrl: "clearance-form.html"
            })
            .when("/clearance/:clearanceId", {
                controller: "EditClearanceController",
                templateUrl: "clearance.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .service("Clearances", function($http) {
        this.getClearances = function() {
            return $http.get("/clearances").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding clearances.");
                });
        }
        this.createClearance = function(clearance) {
            return $http.post("/clearances", clearance).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating clearance.");
                });
        }
        this.getClearance = function(clearanceId) {
            var url = "/clearances/" + clearanceId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this clearance.");
                });
        }
        this.editClearance = function(clearance) {
            var url = "/clearances/" + clearance._id;
            console.log(clearance._id);
            return $http.put(url, clearance).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this clearance.");
                    console.log(response);
                });
        }
        this.deleteClearance = function(clearanceId) {
            var url = "/clearances/" + clearanceId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this clearance.");
                    console.log(response);
                });
        }
    })
    .controller("ListController", function(clearances, $scope) {
        $scope.clearances = clearances.data;
    })
    .controller("NewClearanceController", function($scope, $location, Clearances) {
        $scope.back = function() {
            $location.path("#/");
        }

        $scope.saveClearance = function(clearance) {
            Clearances.createClearance(clearance).then(function(doc) {
                var clearanceUrl = "/clearance/" + doc.data._id;
                $location.path(clearanceUrl);
            }, function(response) {
                alert(response);
            });
        }
    })
    .controller("EditClearanceController", function($scope, $routeParams, Clearances) {
        Clearances.getClearance($routeParams.clearanceId).then(function(doc) {
            $scope.clearance = doc.data;
        }, function(response) {
            alert(response);
        });

        $scope.toggleEdit = function() {
            $scope.editMode = true;
            $scope.clearanceFormUrl = "clearance-form.html";
        }

        $scope.back = function() {
            $scope.editMode = false;
            $scope.clearanceFormUrl = "";
        }

        $scope.saveClearance = function(clearance) {
            Clearances.editClearance(clearance);
            $scope.editMode = false;
            $scope.clearanceFormUrl = "";
        }

        $scope.deleteClearance = function(clearanceId) {
            Clearances.deleteClearance(clearanceId);
        }
    });
