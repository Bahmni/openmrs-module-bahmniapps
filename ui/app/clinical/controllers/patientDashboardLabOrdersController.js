angular.module('bahmni.clinical')
    .controller('PatientDashboardLabOrdersController', ['$scope', '$rootScope', '$stateParams', 'LabOrderResultService', '$q', 'spinner', 'clinicalConfigService',
        function ($scope, $rootScope, $stateParams, labOrderResultService, $q, spinner, clinicalConfigService) {
            $scope.patientUuid = $stateParams.patientUuid;
            $scope.patientSummary = {message: "No Lab Orders for this patient."};
            $scope.showNormalLabResults = false;


            var init = function () {
                spinner.forPromise(labOrderResultService.getAllForPatient($scope.patientUuid, 1).then(function (results) {
                    var sortedConceptSet = new Bahmni.Clinical.SortedConceptSet($rootScope.allTestsAndPanelsConcept);
                    $scope.labAccessions = results.accessions.map(sortedConceptSet.sortTestResults);
                }));
                var patientDashBoardSectionFromConfig = clinicalConfigService.getAllPatientDashboardSections();
                patientDashBoardSectionFromConfig.forEach(function (section) {
                    if (section.title == "Lab Results") {
                        $scope.showNormalLabResults = section.showAll || false;
                        return;
                    }
                });
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