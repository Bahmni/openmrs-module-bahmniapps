angular.module('bahmni.clinical')
    .controller('PatientDashboardVitalsController', ['$scope', '$stateParams', 'patientVisitHistoryService', 'encounterService', 'observationsService', 'conceptSetService', '$q', 'spinner', '$rootScope', function ($scope, $stateParams, patientVisitHistoryService, encounterService, observationsService, conceptSetService, $q, spinner, $rootScope) {
        var bmiCalculator = new Bahmni.Common.BMI();
        $scope.patientSummary = {};
        $scope.patientUuid = $stateParams.patientUuid;

        var createObservationsObject = function (encounterTransactions) {
            return new Bahmni.Clinical.EncounterTransactionToObsMapper().map(encounterTransactions);
        };


        var getVisitHistory = function (visitData) {
            return new Bahmni.Clinical.VisitHistoryEntry(visitData);
        };

        var init = function () {
            $scope.visits = $rootScope.visits;
            $scope.activeVisit = $rootScope.activeVisit;
            createPatientSummary();
        };

        var isObservationForVitals = function (obs) {
            return obs.concept && obs.concept.name &&(obs.concept.name.indexOf(Bahmni.Common.Constants.vitalsConceptName) > -1) ? true : false;
        };

        var isObservationForRegistration = function (obs) {
            return obs.concept && (obs.concept.name === Bahmni.Common.Constants.heightConceptName || obs.concept.name === Bahmni.Common.Constants.weightConceptName || obs.concept.name === Bahmni.Common.Constants.bmiConceptName || obs.concept.name === Bahmni.Common.Constants.bmiStatusConceptName) ? true : false;
        };

        var observationGroupingFunction = function (obs) {
            return Bahmni.Common.Util.DateUtil.getDateWithoutHours(obs.observationDateTime);
        };

        var createPatientSummary = function () {
            if ($scope.activeVisit) {
                spinner.forPromise(observationsService.fetch($scope.patientUuid, $scope.section.conceptNames, $scope.section.numberOfVisits).then(function(observations) {
                    var bahmniObservations = new Bahmni.ConceptSet.ObservationMapper().forView(observations.data);

                    $scope.patientSummary.data = new Bahmni.Clinical.ResultGrouper().group(bahmniObservations, observationGroupingFunction, 'obs', 'date');
                    if ($scope.patientSummary.data.length == 0) {
                        $scope.patientSummary.message = Bahmni.Clinical.Constants.messageForNoObservation;
                    }
                }));
            }
            else {
                $scope.patientSummary.message = Bahmni.Clinical.Constants.messageForNoObservation;
            }
        };

        init();

    }]);