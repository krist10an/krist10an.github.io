
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
    $scope.consumption = 15;
    $scope.soc = 100;
    $scope.consumptionUnits = { "kWh/100km" : 100, "Wh/km" : 1000 };
    $scope.currentUnit = "kWh/100km";

    $scope.calculate = function calculate() {
        unit = $scope.consumptionUnits[$scope.currentUnit];
        $scope.estimated = CarCapacity.getCapacity() * ($scope.soc / 100.0) / $scope.consumption * unit;
        console.log("Calculated distance", $scope.estimated);
    };
    $scope.setUnit = function setUnit(val) {
        $scope.currentUnit = val;
        $scope.calculate();
    };
    // Set initial values
    $scope.calculate();
});

app.controller("DistanceController", function($scope, CarCapacity) {
    $scope.carCapacity = CarCapacity;
    $scope.estimated = 0;
    $scope.soc = 100;
    $scope.distance = 150;
    $scope.unit = "kWh/100km";

    $scope.calculate = function calculate() {
        unit = 100;
        $scope.estimated = CarCapacity.getCapacity() * ($scope.soc / 100.0) / $scope.distance * unit;
        console.log("Calculated consumption", $scope.estimated);
    };

    // Set initial values
    $scope.calculate();
});
