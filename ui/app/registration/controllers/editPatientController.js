'use strict';

angular.module('bahmni.registration')
    .controller('EditPatientController', ['$scope', 'patientService', 'encounterService', '$stateParams', 'openmrsPatientMapper', '$window', '$q','spinner', 'appService', 'messagingService',
        function ($scope, patientService, encounterService, $stateParams, patientMapper, $window, $q, spinner, appService, messagingService) {
            var uuid = $stateParams.patientUuid;
            $scope.patient = {};
            $scope.actions = {};

            (function () {
                var getPatientPromise = patientService.get(uuid).success(function (openmrsPatient) {
                    $scope.openMRSPatient = openmrsPatient;
                    $scope.patient = patientMapper.map(openmrsPatient);

                    var showOrHideAdditionalPatientInformation = function(){
                        var additionalPatientInfoConfig = appService.getAppDescriptor().getConfigValue("additionalPatientInformation");
                        angular.forEach(additionalPatientInfoConfig, function(attribute){
                            if($scope.patient[attribute.name]){
                                $scope.displayAdditionalInformation = true;
                            }
                        });
                    };
                    showOrHideAdditionalPatientInformation();
                });

                var isDigitized = encounterService.getDigitized(uuid);
                isDigitized.success(function(data) {
                    var encountersWithObservations = data.results.filter(function (encounter) {
                        return encounter.obs.length > 0
                    });
                    $scope.isDigitized = encountersWithObservations.length > 0;
                });

                spinner.forPromise($q.all([getPatientPromise, isDigitized]));
            })();

            $scope.update = function () {
                var patientUpdatePromise = patientService.update($scope.patient, $scope.openMRSPatient).success(function (patientProfileData) {
                    $scope.actions.followUpAction(patientProfileData);
                });
                spinner.forPromise(patientUpdatePromise);
            };

            $scope.afterSave = function() {
                messagingService.showMessage("info", "Saved");
            }

        }]);