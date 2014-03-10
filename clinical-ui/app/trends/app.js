angular
    .module("trends", ["ngRoute", "nvd3ChartDirectives", "bahmni.common.uiHelper"])
    .config(["$routeProvider", "$httpProvider", function ($routeProvider, $httpProvider) {
        $routeProvider.when("/patients/:patientUUID", {
            templateUrl: "views/trends.html",
            controller: "TrendsController"
        });
        $routeProvider.when("/patients/:patientUUID/:obsConcept", {
            templateUrl: "views/trends.html",
            controller: "TrendsController"
        });
        $httpProvider.defaults.headers.common["Disable-WWW-Authenticate"] = true;
    }]);
