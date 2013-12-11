angular.module("trends").controller("TrendsController", ["$scope", "$routeParams", "observationService", function ($scope, $routeParams, observationService) {
    var patientUUID = $routeParams.patientUUID,
        fetchedObservations = observationService.fetch(patientUUID),

        fetch = function(observations, concept) {
            return observations.filter(function(observation) {
                return observation.conceptName === concept;
            }).map(function(observation) {
                return [observation.observationDate, observation.value];
            });
        },

        epochToDateString = function(epoch){
            var date = new Date(epoch);
            return d3.time.format("%d/%m/%y")(date);
        },

        displayableConceptNames = {
            "BMI": "BMI",
            "REGISTRATION FEES": "Fees"
        },

        unique = function(array) {
            return array.filter(function(item, position) {
                return array.indexOf(item) === position;
            });
        },

        sentenceCase = function(words) {
            return words[0].toUpperCase() + words.slice(1, words.length).toLowerCase();
        },

        displayNameFor = function(concept) {
            if (displayableConceptNames[concept]) {
                return displayableConceptNames[concept];
            }

            return sentenceCase(concept);
        },

        cleanse = function(token) {
            return token.replace(" ", "_");
        },

        init = function() {
            fetchedObservations.success(function(observations) {
                var allConcepts = observations.map(function(observation) {
                        return observation.conceptName;
                    }),
                    uniqueConcepts = unique(allConcepts);

                $scope.observations = {};
                uniqueConcepts.forEach(function(concept) {
                    var displayName = displayNameFor(concept),
                        values = fetch(observations, concept);

                    $scope.observations[cleanse(concept)] = [{
                        "key": displayName,
                        "values": values
                    }];
                });
            });
        };

    $scope.xAxisTickFormatFunction = function(){
        return epochToDateString;
    };

    init();
}]);
