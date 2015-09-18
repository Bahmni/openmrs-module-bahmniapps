'use strict';

angular.module('bahmni.clinical')
    .controller('consultationContextController', ['$scope', 'appService',
        function ($scope, appService) {
            var init = function () {
                var programConfig = appService.getAppDescriptor().getConfigValue('program');
                var patientConfig = !_.isUndefined(programConfig) ? programConfig.patientInformation : {};
                if (patientConfig.hasOwnProperty("ageLimit") && $scope.patient.age >= patientConfig.ageLimit) {
                    $scope.patient.ageText = $scope.patient.age.toString() + " <span> years </span>";
                }
            };
            init();
        }]);
