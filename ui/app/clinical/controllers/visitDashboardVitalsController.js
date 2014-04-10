angular.module('bahmni.clinical')
    .controller('VisitDashboardVitalsController', ['$scope', '$stateParams', 'patientVisitHistoryService', 'encounterService', '$q', function ($scope, $stateParams, patientVisitHistoryService, encounterService, $q) {
        $scope.test = "randomStuff";
        $scope.patientUuid = $stateParams.patientUuid;
        var createObservationsObject = function (encounterTransactions) {
            return new Bahmni.Clinical.EncounterTransactionToObsMapper().map(encounterTransactions);
        };
        var conceptName = 'VITALS_CONCEPT';

        $scope.patientSummary = {};


        var groupByObservationDateTime = function (flattenedObservations) {
            var observationsGroupedByDate = {};
            flattenedObservations.forEach(function (observation) {
                var date = moment(observation.observationDateTime).format(Bahmni.Common.Constants.dateDisplayFormat);
                observationsGroupedByDate[date] = observationsGroupedByDate[date] || [];
                observationsGroupedByDate[date].push(observation);
            });
            var observations = [];
            for (var date in observationsGroupedByDate) {
                var item = {};
                item.date = date;
                item.observations = observationsGroupedByDate[date];
                observations.push(item);
            }
            return observations;
        };


        var getVisitHistory = function (visitData) {
            return new Bahmni.Clinical.VisitHistoryEntry(visitData)
        };

        var isVisitActive = function (visit) {
            return visit.isActive()
        };


        var init = function () {
            return patientVisitHistoryService.getVisits($scope.patientUuid).then(function (visits) {
                var deferred = $q.defer();
                $scope.visits = visits.map(getVisitHistory);
                $scope.activeVisit = $scope.visits.filter(isVisitActive)[0];
                deferred.resolve();
                return deferred.promise;
            });
        };

        var isObservationConcept = function (obs) {
            return obs.concept.name == conceptName
        }


        var createPatientSummary = function () {
            encounterService.search($scope.activeVisit.uuid).success(function (encounterTransactions) {
                var visitData = createObservationsObject(encounterTransactions);
                var flattenedObservations = new Bahmni.Clinical.CompoundObservationMapper().flatten(visitData);
                var observationsForConceptSet = flattenedObservations.filter(isObservationConcept);
                $scope.patientSummary.data = groupByObservationDateTime(observationsForConceptSet);
                if ($scope.patientSummary.data.length == 0) {
                    $scope.patientSummary.message = Bahmni.Clinical.Constants.messageForNoObservation;
                }
            });
        };

        init().then(createPatientSummary);

    }]);