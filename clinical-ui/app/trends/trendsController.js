angular.module("trends").controller("TrendsController", ["$scope", "$routeParams", "observationService",'backlinkService',
    function ($scope, $routeParams, observationService,backlinkService) {
        var patientUUID = $routeParams.patientUUID,
        obsConcept = $routeParams.obsConcept,
        fetchedObservations = observationService.fetch(patientUUID),
        MINIMUM_REQUIRED_READINGS = 2,

        fetch = function(observations, concept) {
            return observations.filter(function(observation) {
                return observation.conceptName === concept;
            }).map(function(observation) {
                return [observation.observationDate, observation.value, observation.units];
            });
        },

        epochToDateString = function(epoch){
            var date = new Date(epoch);
            return d3.time.format("'%d/%m/%y %H:%M'")(date);
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

        init = function() {
            fetchedObservations.success(function(observations) {
                var allConcepts = observations.map(function(observation) {
                        return observation.conceptName;
                    }),
                uniqueConcepts = unique(allConcepts);

                $scope.observations = {};
                $scope.visibleObservations = {};
                $scope.concepts = {};

                uniqueConcepts.forEach(function(concept) {
                    var displayName = displayNameFor(concept),
                        values = fetch(observations, concept);

                    if (values.length >= MINIMUM_REQUIRED_READINGS) {
                        $scope.observations[concept] = [{
                            "key": displayName,
                            "values": values
                        }];
                        $scope.concepts[concept] = {
                            name: displayName,
                            displayed: false
                        };
                    }
                });

                if(obsConcept){
                    $scope.addObservations(obsConcept);
                }
            });

            initBackLinks();
        };

    $scope.xAxisTickFormatAsDate = function(){
        return epochToDateString;
    };


    $scope.getUnitsFromDetails = function(details){
        if(details && details[0]){
            return details[0].values[0][2];
        }
    }

    $scope.addObservations = function(concept){
        $scope.visibleObservations[concept] = $scope.observations[concept];
        if($scope.concepts[concept]){
            $scope.concepts[concept].displayed = true;
        }
    };

    $scope.removeObservations = function(concept){
        delete $scope.visibleObservations[concept];
        $scope.concepts[concept].displayed = false;
    };

    var initBackLinks =  function () {
        backlinkService.addUrl("Consultation","/clinical/consultation/#/patient/"+patientUUID);
    };

    init();

}]);
