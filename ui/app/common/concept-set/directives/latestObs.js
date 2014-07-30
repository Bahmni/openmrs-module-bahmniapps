angular.module('bahmni.common.conceptSet')
    .directive('latestObs', function () {
        var controller = function ($scope, observationsService, $q, spinner, $rootScope) {
            var init = function () {
                $scope.visits = $rootScope.visits;
                $scope.activeVisit = $rootScope.activeVisit;
                createObservationSectionView();
            };

            var observationGroupingFunction = function (obs) {
                return Bahmni.Common.Util.DateUtil.getDateWithoutHours(obs.observationDateTime);
            };

            $scope.isText = function (obs) {
                return isOfType(obs, 'Text');
            };

            var isOfType = function (obs, type) {
                return obs.type === type;
            };

            var createObservationSectionView = function () {
                spinner.forPromise(observationsService.fetch($scope.patientUuid, $scope.conceptNames, "latest").then(function (observations) {
                    var bahmniObservations = new Bahmni.ConceptSet.ObservationMapper().forView(observations.data);
                    $scope.observations = _.sortBy(bahmniObservations, 'sortWeight');
                }));
            };

            init();
        }


        return {
            restrict: 'E',
            controller: controller,
            templateUrl: '../common/concept-set/views/latestObs.html',
            scope: {
                patientUuid: "=",
                conceptNames: "="
            }
        }
    });