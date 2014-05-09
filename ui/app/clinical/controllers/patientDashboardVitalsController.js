angular.module('bahmni.clinical')
    .controller('PatientDashboardVitalsController', ['$scope', '$stateParams', 'patientVisitHistoryService', 'encounterService', 'conceptSetService', '$q', 'spinner', function ($scope, $stateParams, patientVisitHistoryService, encounterService, conceptSetService, $q, spinner) {
        $scope.patientUuid = $stateParams.patientUuid;
        var createObservationsObject = function (encounterTransactions) {
            return new Bahmni.Clinical.EncounterTransactionToObsMapper().map(encounterTransactions);
        };

        $scope.patientSummary = {};

        var getVisitHistory = function (visitData) {
            return new Bahmni.Clinical.VisitHistoryEntry(visitData);
        };

        var isVisitActive = function (visit) {
            return visit.isActive();
        };

        var init = function () {
            var deferer = $q.defer();

            var vitalsConceptPromise = conceptSetService.getConceptSetMembers({name: Bahmni.Common.Constants.vitalsConceptName, v: "fullchildren"}, true);
            var patientsHistoryServicePromise = patientVisitHistoryService.getVisits($scope.patientUuid);
            var vitalsConcept = null;

            $q.all([patientsHistoryServicePromise, vitalsConceptPromise]).then(function (results) {
                var visits = results[0];
                vitalsConcept = results[1].data.results[0];

                $scope.visits = visits.map(getVisitHistory);
                $scope.activeVisit = $scope.visits.filter(isVisitActive)[0];

                createPatientSummary(vitalsConcept);

                deferer.resolve();
            }, deferer.reject);


            return deferer.promise;
        };

        var isObservationForVitals = function (obs) {
            return obs.concept && obs.concept.name === Bahmni.Common.Constants.vitalsConceptName;
        };

        var observationGroupingFunction = function (obs) {
            return obs.observationDateTime.substring(0, 10);
        };

        var createPatientSummary = function (vitalsConcept) {
            if ($scope.activeVisit) {
                encounterService.search($scope.activeVisit.uuid).success(function (encounterTransactions) {
                    var visitData = createObservationsObject(encounterTransactions);

                    var vitalsObservations = visitData.filter(isObservationForVitals);
                    var mappedObservations = new Bahmni.ConceptSet.ObservationMapper().getObservationsForView(vitalsObservations);

                    $scope.patientSummary.data = new Bahmni.Clinical.ResultGrouper().group(mappedObservations, observationGroupingFunction, 'obs', 'date');
                    if ($scope.patientSummary.data.length == 0) {
                        $scope.patientSummary.message = Bahmni.Clinical.Constants.messageForNoObservation;
                    }
                });
            }
            else {
                $scope.patientSummary.message = Bahmni.Clinical.Constants.messageForNoObservation;
            }
        };

        init();

    }]);