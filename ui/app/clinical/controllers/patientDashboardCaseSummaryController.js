angular.module('bahmni.clinical')
    .controller('PatientDashboardCaseSummaryController', ['$scope', '$stateParams', '$rootScope', 'spinner', 'observationsService', function ($scope, $stateParams, $rootScope, spinner, observationsService) {
        var bmiCalculator = new Bahmni.Common.BMI();
        $scope.patientSummary = {};
        $scope.patientUuid = $stateParams.patientUuid;
        $scope.bahmniObservations = [];


        var init = function () {
            $scope.visits = $rootScope.visits;
            $scope.activeVisit = $rootScope.activeVisit;
            if ($scope.activeVisit) {
                spinner.forPromise(observationsService.fetch($scope.patientUuid, $scope.section.conceptNames, $scope.section.numberOfVisits).then(function(observations) {
                    $scope.bahmniObservations = observations.data;
                }));
            }
            else {
                $scope.patientSummary.message = Bahmni.Clinical.Constants.messageForNoObservation;
            }
        };
        init();

    }]);