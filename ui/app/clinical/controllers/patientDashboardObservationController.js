angular.module('bahmni.clinical')
    .controller('PatientDashboardObservationController', ['$scope', '$stateParams', 'observationsService', '$q', 'spinner', '$rootScope', function ($scope, $stateParams, observationsService, $q, spinner, $rootScope) {
        $scope.patientSummary = {};
        $scope.patientUuid = $stateParams.patientUuid;

        var init = function () {
            $scope.visits = $rootScope.visits;
            $scope.activeVisit = $rootScope.activeVisit;
            createObservationSectionView();
        };

        var observationGroupingFunction = function (obs) {
            return Bahmni.Common.Util.DateUtil.getDateWithoutHours(obs.observationDateTime) + "||" + obs.rootConcept;
        };

        $scope.isText = function (obs) {
            return isOfType(obs, 'Text');
        };

        var isOfType = function (obs, type) {
            return obs.type === type;
        };

        var groupByDateAndConcept = function (bahmniObservations) {
            var someArr = [];
            bahmniObservations = _.groupBy(bahmniObservations, observationGroupingFunction);
            for (obsKey in bahmniObservations){
                var item = {};
                item["key"] = obsKey;
                item["value"] = bahmniObservations[obsKey];
                item["date"] = obsKey.split('||')[0];
                item["concept"] = obsKey.split('||')[1];
                someArr.push(item);
            }
            return _.sortBy(someArr, function(obs) {return item.date.values});
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