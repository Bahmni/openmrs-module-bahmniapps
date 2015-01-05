'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardLatestObservationController', ['$scope', '$stateParams', 
        'observationsService', '$q', 'spinner', 'clinicalAppConfigService', 
        function ($scope, $stateParams, observationsService, $q, spinner, clinicalAppConfigService) {

        var init = function () {
            spinner.forPromise(observationsService.fetch($stateParams.patientUuid, $scope.section.conceptNames, "latest").then(function (observationsResponse) {
                var observations = new Bahmni.Common.Obs.ObservationMapper().map(observationsResponse.data, clinicalAppConfigService.getAllConceptsConfig());
                $scope.observations = _.sortBy(observations, 'sortWeight');
            }));
        };

        init();
    }]);
