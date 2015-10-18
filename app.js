
var app = angular.module("ElbilKalkApp", [
	"ngRoute",
	"mobile-angular-ui",
	"mobile-angular-ui.gestures",
]);

app.config(function($routeProvider) {
  $routeProvider.when('/',              {templateUrl: 'home.html', controller:"ElbilKalkController"});
  $routeProvider.when('/consumption',   {templateUrl: 'consumption.html', controller: "ConsumptionController"});
  $routeProvider.when('/distance',      {templateUrl: 'distance.html', controller: "DistanceController"});
});


app.factory('CarCapacity', function() {
    var data = {
        Capacity: 21.2,
    };
    return {
        getCapacity: function() {
            return data.Capacity;
        },
        setCapacity: function(value) {
            console.log("Setting capacity to", value);
            data.Capacity = value;
        }
    }
});

// -- Controllers --

app.controller("ElbilKalkController", function($scope, CarCapacity) {
    $scope.carPresets = [
        { "name" : "Tesla Model S", "consumption" : 17, "battery": 85},
        { "name" : "VW eGolf", "consumption" : 17, "battery" : 21.4},
        ];
    $scope.orderProp = 'name';
    $scope.CarCapacity = CarCapacity
    $scope.currentCapacity = CarCapacity.getCapacity();

    $scope.$watch('currentCapacity', function (newValue, oldValue) {
        if (newValue !== oldValue) CarCapacity.setCapacity(newValue);
    });
    $scope.setCapacity = function(value) {
        $scope.currentCapacity = value;
    };
});

app.controller("ConsumptionController", function($scope, CarCapacity) {
    $scope.carCapacity = CarCapacity;
    $scope.estimated = 0;
    $scope.car = { "capacity": 21.2, "soc": 100, "consumption": 15.5 }
    $scope.consumptionUnits = [ "kWh/100km"];
    $scope.unit = "kWh/100km";

    $scope.calculate = function calculate() {
        unit = 100;
        $scope.estimated = $scope.car.capacity * ($scope.car.soc / 100.0) / $scope.car.consumption * unit;
        console.log("Calculated distance", $scope.estimated);
    };

    // Set initial values
    $scope.calculate();
});

app.controller("DistanceController", function($scope, CarCapacity) {
    $scope.carCapacity = CarCapacity;
    $scope.estimated = 0;
    $scope.car = { "capacity": 21.2, "soc": 100 }
    $scope.distance = 150;
    $scope.unit = "kWh/100km";

    $scope.calculate = function calculate() {
        unit = 100;
        $scope.estimated = $scope.car.capacity * ($scope.car.soc / 100.0) / $scope.distance * unit;
        console.log("Calculated consumption", $scope.estimated);
    };

    // Set initial values
    $scope.calculate();
});
