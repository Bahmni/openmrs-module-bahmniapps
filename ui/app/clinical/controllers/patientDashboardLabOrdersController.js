angular.module('bahmni.clinical')
    .controller('PatientDashboardLabOrdersController', ['$scope', '$rootScope', '$stateParams', 'LabOrderResultService', '$q', 'spinner',
        function ($scope, $rootScope, $stateParams, labOrderResultService, $q, spinner) {
            $scope.patientUuid = $stateParams.patientUuid;
            $scope.patientSummary = {message: "No Lab Orders for this patient."};

            var init = function () {
                spinner.forPromise(labOrderResultService.getAllForPatient($scope.patientUuid, 1).then(function(results) {
                    var sortedConceptSet = new Bahmni.Clinical.SortedConceptSet($rootScope.allTestsAndPanelsConcept);
                    $scope.labAccessions = results.accessions.map(sortedConceptSet.sortTestResults);
                }));
            };

            init();

            $scope.hasLabOrders = function () {
                return $scope.labAccessions && $scope.labAccessions.length > 0;
            };
        }]);