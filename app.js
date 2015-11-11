
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

app.run(['$rootScope', '$location', '$window', function($rootScope, $location, $window){
 $rootScope
    .$on('$routeChangeSuccess',
        function(event){
            if (!$window.ga)
                return;
            $window.ga('send', 'pageview', { page: $location.path() });
    });
}])
// Routes

app.config(function($routeProvider) {
  $routeProvider.when('/',              {templateUrl: 'home.html', controller:"HomeController"});
  $routeProvider.when('/consumption',   {templateUrl: 'consumption.html', controller: "ConsumptionController"});
  $routeProvider.when('/distance',      {templateUrl: 'distance.html', controller: "DistanceController"});
  $routeProvider.when('/charge',        {templateUrl: 'charge.html', controller: "ChargeController"});
  $routeProvider.when('/vw',            {templateUrl: 'vw.html', controller: "VwController"});
  $routeProvider.when('/about',         {templateUrl: 'about.html', controller: "HomeController"});
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
            //console.log("Setting capacity to", value);
            data.Capacity = value;
            $localstorage.set("capacity", parseFloat(value));
        }
    }
});

app.factory('UnitPreference', function($localstorage) {
    var consumptionUnits = { "kWh/100km" : 100, "Wh/km" : 1000 };
    var temp = $localstorage.get('unit_preference', "kWh/100km");
    var data = {
        preferredUnit: temp,
    };
    return {
        getAllUnits: function() {
            return consumptionUnits;
        },
        getConsumptionUnit: function() {
            return data.preferredUnit;
        },
        getConsumptionUnitFactor: function() {
            return consumptionUnits[data.preferredUnit];
        },
        normalized: function(value) {
            // Consumption in kWh
            return value / consumptionUnits[data.preferredUnit];
        },
        setConsumptionUnit: function(value) {
            //console.log("Setting consumption to", value);
            data.preferredUnit = value;
            $localstorage.set("unit_preference", value);
        }
    }
});


// Controllers

app.controller("HomeController", function($scope, CarCapacity, UnitPreference) {
    $scope.carPresets = [
        { "name" : "BMW i3 2015",      "battery": 18.8},
        { "name" : "Kia Soul EV 2015", "battery": 24.3},
        { "name" : "Mercedes B Electric 2015", "battery": 27 },
        { "name" : "Nissan Leaf 2015", "battery": 21.3},
        { "name" : "Renault Zoe 2015", "battery": 18.8},
        { "name" : "Tesla Model S70",  "battery": 65},
        { "name" : "Tesla Model S85",  "battery": 75},
        { "name" : "VW eGolf 2015",    "battery": 21.2},
        { "name" : "VW eUP 2015",      "battery": 16.8},
        ];
    $scope.orderProp = 'name';
    $scope.CarCapacity = CarCapacity
    $scope.currentCapacity = CarCapacity.getCapacity();

    $scope.currentUnit = UnitPreference.getConsumptionUnit();
    $scope.UnitPreference = UnitPreference;

    $scope.$watch('currentCapacity', function (newValue, oldValue) {
        if (newValue !== oldValue) CarCapacity.setCapacity(newValue);
    });
    $scope.setCapacity = function(value) {
        $scope.currentCapacity = value;
    };

    $scope.$watch('currentUnit', function (newValue, oldValue) {
        if (newValue !== oldValue) UnitPreference.setConsumptionUnit(newValue);
    });
    $scope.setUnit = function setUnit(val) {
        $scope.currentUnit = val;
    };
});

app.controller("ConsumptionController", function($scope, CarCapacity, UnitPreference, $localstorage) {
    $scope.carCapacity = CarCapacity;
    $scope.unitPreference = UnitPreference;

    $scope.consumption = parseFloat($localstorage.get("cons_consumption", 15));
    $scope.soc = parseFloat($localstorage.get("cons_soc", 100));

    // Calculated variables
    $scope.estimated = 0;

    $scope.calculate = function calculate() {
        $scope.estimated = CarCapacity.getCapacity() * ($scope.soc / 100.0) / UnitPreference.normalized($scope.consumption);

        $localstorage.set("cons_consumption", $scope.consumption);
        $localstorage.set("cons_soc", $scope.soc);
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

app.controller("ChargeController", function($scope, CarCapacity, UnitPreference, $localstorage) {
    // Set up locale
    moment.locale("nb");

    $scope.carCapacity = CarCapacity;
    $scope.unitPreference = UnitPreference;

    $scope.chargeSpeeds = [
        { "voltage" :  230, "current": 6},
        { "voltage" :  230, "current": 10},
        { "voltage" :  230, "current": 13},
        { "voltage" :  230, "current": 16},
        { "voltage" :  400, "current": 10},
        { "voltage" :  400, "current": 16},
        { "voltage" :  400, "current": 20},
        { "voltage" :  400, "current": 27.5},
        { "voltage" :  400, "current": 55},
        ];

    $scope.distance = parseFloat($localstorage.get("charge_distance", 150));
    $scope.consumption = parseFloat($localstorage.get("charge_consumption", 15));

    // Calculated variables
    $scope.estimated = 0;
    $scope.required_kwh = 0;

    $scope.normalize_consumption = function normalize_consumption() {
        return UnitPreference.normalized($scope.consumption);
    };

    $scope.calc_speed = function calc_speed(v, c) {
        return v * c / 1000 / $scope.normalize_consumption();
    };
    $scope.calc_duration = function calc_duration(v, c) {
        var dur = $scope.distance / $scope.calc_speed(v, c) * 3600 * 1000;
        return moment.duration(dur).humanize();
    }

    $scope.calculate = function calculate() {
        $scope.required_kwh = $scope.distance * ( UnitPreference.normalized($scope.consumption) );
        $scope.estimated = $scope.required_kwh / CarCapacity.getCapacity() * 100;
        $localstorage.set("charge_distance", $scope.distance);
        $localstorage.set("charge_consumption", $scope.consumption);
    };

    // Set initial values
    $scope.calculate();
});

app.controller("VwController", function($scope, $localstorage) {
    $scope.vwper = "";
    $scope.soc = 0;

    $scope.gauges = [];
    $scope.createGauge = function createGauge(name, label, min, max) {
        var config =
        {
          size: 120,
          label: label,
          min: undefined != min ? min : 0,
          max: undefined != max ? max : 80,
          minorTicks: 2,
          majorTicks: 9,
        }

        var range = config.max - config.min;
        config.redZones = [{ from: config.min, to: config.min + range/(2*8) }];

        $scope.gauges[name] = new Gauge(name + "GaugeContainer", config);
        $scope.gauges[name].render();
      }
    $scope.initialize = function initialize() {
        $scope.createGauge("battery", "Battery");
      }

    $scope.updateGauge = function updateGauge(value) {
        if (undefined != value)  {
            $scope.gauges["battery"].redraw(value);
            $scope.soc = parseFloat(value) / 80 * 100;
        } else {
            $scope.soc = NaN;
        }
      }

    // Setup gauges
    $scope.initialize();
});
