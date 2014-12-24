angular.module('bahmni.clinical')
    .controller('PatientDashboardLatestObservationController', ['$scope', '$stateParams', 
        'observationsService', '$q', 'spinner', '$rootScope', 'clinicalAppConfigService', 
        function ($scope, $stateParams, observationsService, $q, spinner, $rootScope, clinicalAppConfigService) {

        var init = function () {
            $scope.visits = $rootScope.visits;
            $scope.activeVisit = $rootScope.activeVisit;
            createObservationSectionView();
        };

        var createObservationSectionView = function () {
            spinner.forPromise(observationsService.fetch($scope.patientUuid, $scope.section.conceptNames, "latest").then(function (observationsResponse) {
                var observations = new Bahmni.Common.Obs.ObservationMapper().map(observationsResponse.data, clinicalAppConfigService.getAllConceptsConfig());
                $scope.observations = _.sortBy(observations, 'sortWeight');
            }));
        };
        init();
    }]);
