angular.module("trends").controller("TrendsController", ["$scope", "$routeParams", "observationService", function ($scope, $routeParams, observationService) {
    var patientUUID = $routeParams.patientUUID,
        fetchedObservations = observationService.fetch(patientUUID),

        fetch = function(observations, category) {
            return observations.filter(function(observation) {
                return observation.conceptName === category;
            }).map(function(observation) {
                return [observation.observationDate, observation.value];
            });
        },

        epochToDateString = function(epoch){
            var date = new Date(epoch);
            return d3.time.format("%d/%m/%y")(date);
        };

    $scope.xAxisTickFormatFunction = function(){
        return epochToDateString;
    };

    var init = function(key, displayName) {
        fetchedObservations.success(function(observations) {
            var values = fetch(observations, key);
            $scope.observations = [{
                "key": displayName,
                "values": values
            }];
        });
    };

    init("WEIGHT", "Weight");
    // init("HEIGHT", "Heights");
}]);
