angular.module('bahmni.clinical')
    .controller('PatientDashboardLabOrdersController', ['$scope', '$rootScope', '$stateParams', 'LabOrderResultService', '$q', 'spinner',
        function ($scope, $rootScope, $stateParams, labOrderResultService, $q, spinner) {
            $scope.patientUuid = $stateParams.patientUuid;
            $scope.patientSummary = {message: "No Lab Orders for this patient."};

            var init = function () {
                spinner.forPromise(labOrderResultService.getAllForPatient($scope.patientUuid, 1).then(function (results) {
                    var sortedConceptSet = new Bahmni.Clinical.SortedConceptSet($rootScope.allTestsAndPanelsConcept);
                    $scope.labAccessions = results.accessions.map(sortedConceptSet.sortTestResults);
                }));
            };

            init();

            $scope.getUploadedFileUrl = function (uploadedFileName) {
                return Bahmni.Common.Constants.labResultUploadedFileNameUrl + uploadedFileName;
            };

            $scope.hasLabOrders = function () {
                return $scope.labAccessions && $scope.labAccessions.length > 0;
            };
            $scope.hasAbnormalTests= function (labOrderResult) {
                if(labOrderResult.isPanel){
                    var tests = labOrderResult.tests;
                    var hasAbnormal = false;
                    tests.forEach(function (test){
                        if(test.abnormal){
                           hasAbnormal = true;
                            return;
                        }
                    });
                    return hasAbnormal;
                }
                return labOrderResult.abnormal;
            }
        }]);