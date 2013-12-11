angular
    .module("trends", ["nvd3ChartDirectives"])
    .config(["$routeProvider", "$httpProvider", function ($routeProvider, $httpProvider) {
        $routeProvider.when("/patients/:patientUUID", {
            templateUrl: "trends.html",
            controller: "TrendsController"
        });
        $httpProvider.defaults.headers.common["Disable-WWW-Authenticate"] = true;
    }]);
