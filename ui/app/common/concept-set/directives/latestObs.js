angular.module('bahmni.common.conceptSet')
    .directive('latestObs', function () {
        var controller = function ($scope, observationsService, $q, spinner, $rootScope) {
            var init = function () {
                $scope.visits = $rootScope.visits;
                $scope.activeVisit = $rootScope.activeVisit;
                createObservationSectionView();
            };

            var createObservationSectionView = function () {
                spinner.forPromise(observationsService.fetch($scope.patientUuid, $scope.conceptNames, "latest").then(function (observations) {
                    var dashboardObservations = _.map(observations.data, function (bahmniObservation) {
                        return new Bahmni.Clinical.DashboardObservation(bahmniObservation);
                    });
                    $scope.observations = _.sortBy(dashboardObservations, 'sortWeight');
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