angular.module('bahmni.clinical')
    .controller('PatientDashboardObservationController', ['$scope', '$stateParams', 'observationsService', '$q', 
        'spinner', '$rootScope', 'clinicalAppConfigService', 
        function ($scope, $stateParams, observationsService, $q, spinner, $rootScope, clinicalAppConfigService) {
        $scope.patientSummary = {};
        $scope.patientUuid = $stateParams.patientUuid;

        var init = function () {
            $scope.visits = $rootScope.visits;
            $scope.activeVisit = $rootScope.activeVisit;
            createObservationSectionView();
        };

        var observationGroupingFunction = function (obs) {
            return Bahmni.Common.Util.DateUtil.getDateWithoutHours(obs.encounterDateTime) + "||" + obs.concept.name;
        };

        var groupByDateAndConcept = function (bahmniObservations) {
            var obsArray = [];
            bahmniObservations = _.groupBy(bahmniObservations, observationGroupingFunction);

            var sortWithInAConceptDateCombination = function(anObs, challengerObs) {
                if (anObs.encounterDateTime < challengerObs.encounterDateTime) return 1;
                if (anObs.encounterDateTime > challengerObs.encounterDateTime) return -1;

                if (anObs.sortWeight < challengerObs.sortWeight) return -1;
                if (anObs.sortWeight > challengerObs.sortWeight) return 1;

                return 0;
            };

            for (var obsKey in bahmniObservations){
                var dateTime = obsKey.split('||')[0];
                var rootConceptName = obsKey.split('||')[1];
                var rootConceptOrderInConfig = $scope.section.conceptNames.indexOf(rootConceptName);

                var anObs = {
                    "key" : obsKey,
                    // lodash does not allow different order sorting on multiple columns
                    //"value" : _.sortBy(bahmniObservations[obsKey], sortWithInAConceptDateCombination),
                    "value" : bahmniObservations[obsKey].sort(sortWithInAConceptDateCombination),
                    "date" : dateTime,
                    "concept" : rootConceptName,
                    "rootConceptOrderInConfig" : rootConceptOrderInConfig
                };

                obsArray.push(anObs);
            }
            return _.sortBy(obsArray, [{'date' : 'desc'}]);
        };

            var createObservationSectionView = function () {
                spinner.forPromise(observationsService.fetch($scope.patientUuid, $scope.section.conceptNames,
                        $scope.section.scope, $scope.section.numberOfVisits).then(function (response) {
                        var observations = new Bahmni.Common.Obs.ObservationMapper().map(response.data, clinicalAppConfigService.getAllConceptsConfig());
                        $scope.patientSummary.data = groupByDateAndConcept(observations);
                        if (_.isEmpty($scope.patientSummary.data)) {
                            $scope.patientSummary.message = Bahmni.Clinical.Constants.messageForNoObservation;
                        }
                    }));
            };

            init();

    }]);
