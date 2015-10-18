
/*
Code from
http://learn.ionicframework.com/formulas/localstorage/
*/
angular.module('ionic.utils', [])

.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}]);


// App

var app = angular.module("ElbilKalkApp", [
    "ngRoute",
    "mobile-angular-ui",
    "mobile-angular-ui.gestures",
    "ionic.utils",
]);

// Routes

app.config(function($routeProvider) {
  $routeProvider.when('/',              {templateUrl: 'home.html', controller:"ElbilKalkController"});
  $routeProvider.when('/consumption',   {templateUrl: 'consumption.html', controller: "ConsumptionController"});
  $routeProvider.when('/distance',      {templateUrl: 'distance.html', controller: "DistanceController"});
});


app.factory('CarCapacity', function($localstorage) {
    var temp = parseFloat($localstorage.get('capacity', 21.2));
    var data = {
        Capacity: temp,
    };
    return {
        getCapacity: function() {
            return data.Capacity;
        },
        setCapacity: function(value) {
            console.log("Setting capacity to", value);
            data.Capacity = value;
            $localstorage.set("capacity", parseFloat(value));
        }
    }
});



// Controllers

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

app.controller("ConsumptionController", function($scope, CarCapacity, $localstorage) {
    $scope.carCapacity = CarCapacity;
    $scope.estimated = 0;
    $scope.consumption = parseFloat($localstorage.get("cons_consumption", 15));
    $scope.soc = parseFloat($localstorage.get("cons_soc", 100));
    $scope.consumptionUnits = { "kWh/100km" : 100, "Wh/km" : 1000 };
    $scope.currentUnit = $localstorage.get("consumptionUnit", "kWh/100km")

    $scope.calculate = function calculate() {
        unit = $scope.consumptionUnits[$scope.currentUnit];
        $scope.estimated = CarCapacity.getCapacity() * ($scope.soc / 100.0) / $scope.consumption * unit;
        console.log("Calculated distance", $scope.estimated);

        $localstorage.set("cons_consumption", $scope.consumption);
        $localstorage.set("cons_soc", $scope.soc);
    };
    $scope.setUnit = function setUnit(val) {
        $scope.currentUnit = val;
        $localstorage.set("consumptionUnit", val);
        $scope.calculate();
    };
    // Set initial values
    $scope.calculate();
});

app.controller("DistanceController", function($scope, CarCapacity, $localstorage) {
    $scope.carCapacity = CarCapacity;

    $scope.soc = parseFloat($localstorage.get("dist_soc", 100));
    $scope.distance = parseFloat($localstorage.get("dist_distance", 150));

    // Calculated variables
    $scope.estimated = 0;
    $scope.madness = 0;

    $scope.calculate = function calculate() {
        unit = 100;
        $scope.estimated = CarCapacity.getCapacity() * ($scope.soc / 100.0) / $scope.distance * unit;
        $localstorage.set("dist_distance", $scope.distance);
        $localstorage.set("dist_soc", $scope.soc);

/*
        console.log("Calculated consumption", $scope.estimated);
        var exponential = Math.exp(-0.2 * ($scope.estimated - 11.2));
        $scope.madness = Math.min(100 * exponential, 100)
        console.log("exponential", exponential)
        console.log("Madness", $scope.madness);
*/
    };

    // Set initial values
    $scope.calculate();
});
