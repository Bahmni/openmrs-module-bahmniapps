'use strict';

angular.module('bahmni.clinical')
    .controller('consultationContextController', ['$scope', 'appService', '$stateParams', 'visitHistory',
        function ($scope, appService, $stateParams, visitHistory) {
            var init = function () {
                $scope.configName = $stateParams.configName;
                var programConfig = appService.getAppDescriptor().getConfigValue('program');
                $scope.visitUuid = _.get(visitHistory, 'activeVisit.uuid');
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
                            "countyDistrict"
                        ]
                    }
                };
            };
            init();
        }]);
