'use strict';

angular.module('bahmni.clinical')
    .controller('consultationContextController', ['$scope', 'appService', '$stateParams',
        function ($scope, appService, $stateParams) {
            var init = function () {
                $scope.configName = $stateParams.configName;
                var programConfig = appService.getAppDescriptor().getConfigValue('program');
                $scope.patientInfoSection = {
                    "patientInformation": {
                        "title": "Patient Information",
                        "name": "patientInformation",
                        "patientAttributes": [],
                        "ageLimit": programConfig ? programConfig.patientInformation ? programConfig.patientInformation.ageLimit : undefined : undefined,
                        "addressFields": [
                            "address1",
                            "address2",
                            "cityVillage",
                            "countryDistrict"
                        ]
                    }
                };
            };
            init();
        }]);
