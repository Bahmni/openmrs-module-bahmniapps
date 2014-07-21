angular.module('bahmni.clinical')
    .controller('PatientDashboardObservationController', ['$scope', '$stateParams', 'observationsService', '$q', 'spinner', '$rootScope', function ($scope, $stateParams, observationsService, $q, spinner, $rootScope) {
        $scope.patientSummary = {};
        $scope.patientUuid = $stateParams.patientUuid;

        $scope.isText = function (obs) {
            return isOfType(obs, 'Text');
        };

        var isOfType = function (obs, type) {
            return obs.type === type;
        };

        var init = function () {
            $scope.visits = $rootScope.visits;
            $scope.activeVisit = $rootScope.activeVisit;
            createObservationSectionView();
        };

        var observationGroupingFunction = function (obs) {
            return Bahmni.Common.Util.DateUtil.getDateWithoutHours(obs.observationDateTime) + "||" + obs.rootConcept;
        };

        var groupByDateAndConcept = function (bahmniObservations) {
            var obsArray = [];
            bahmniObservations = _.groupBy(bahmniObservations, observationGroupingFunction);

            for (obsKey in bahmniObservations){
                var dateTime = obsKey.split('||')[0];
                var rootConceptName = obsKey.split('||')[1];
                var rootConceptOrderInConfig = $scope.section.conceptNames.indexOf(rootConceptName);

                var anObs = {
                    "key" : obsKey,
                    "value" : _.sortBy(bahmniObservations[obsKey], ['observationDateTime', 'sortWeight']),
                    "date" : dateTime,
                    "concept" : rootConceptName,
                    "rootConceptOrderInConfig" : rootConceptOrderInConfig
                };

                obsArray.push(anObs);
            }
            return _.sortBy(obsArray, [{'date' : 'desc'}]);
        };

        var createObservationSectionView = function () {
            spinner.forPromise(observationsService.fetch($scope.patientUuid, $scope.section.conceptNames, $scope.section.numberOfVisits).then(function (observations) {
                var bahmniObservations = new Bahmni.ConceptSet.ObservationMapper().forView(observations.data);

                $scope.patientSummary.data = groupByDateAndConcept(bahmniObservations);
                if (_.isEmpty($scope.patientSummary.data)) {
                    $scope.patientSummary.message = Bahmni.Clinical.Constants.messageForNoObservation;
                }
            }));
        };

        init();

    }]);
