angular.module('bahmni.clinical')
    .controller('PatientDashboardVitalsController', ['$scope', '$stateParams', 'patientVisitHistoryService', 'encounterService', 'conceptSetService', '$q', 'spinner', '$rootScope', function ($scope, $stateParams, patientVisitHistoryService, encounterService, conceptSetService, $q, spinner, $rootScope) {
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
            return obs.concept && obs.concept.name === Bahmni.Common.Constants.vitalsConceptName ? true : false;
        };

        var isObservationForRegistration = function (obs) {
            return obs.concept && (obs.concept.name === Bahmni.Common.Constants.heightConceptName || obs.concept.name === Bahmni.Common.Constants.weightConceptName || obs.concept.name === Bahmni.Common.Constants.bmiConceptName || obs.concept.name === Bahmni.Common.Constants.bmiStatusConceptName) ? true : false;
        };

        var observationGroupingFunction = function (obs) {
            return obs.observationDateTime;
        };

        var createPatientSummary = function () {
            if ($scope.activeVisit) {
                spinner.forPromise(encounterService.search($scope.activeVisit.uuid).success(function (encounterTransactions) {
                    var visitData = createObservationsObject(encounterTransactions);

                    var vitalsObservations = visitData.filter(isObservationForVitals);
                    var registrationObservations = visitData.filter(isObservationForRegistration);
                    var mappedVitalsObservations = new Bahmni.ConceptSet.ObservationMapper().getObservationsForView(vitalsObservations);
                    var mappedRegistrationObservations = new Bahmni.ConceptSet.ObservationMapper().getObservationsForView(registrationObservations);
                    var sortedRegistrationObservations = _.sortBy(mappedRegistrationObservations, function(obs){
                        return obs.concept.name;
                    });

                    var vitalsAndRegistrationObservations = mappedVitalsObservations.concat(sortedRegistrationObservations);

                    $scope.patientSummary.data = new Bahmni.Clinical.ResultGrouper().group(vitalsAndRegistrationObservations, observationGroupingFunction, 'obs', 'date');
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