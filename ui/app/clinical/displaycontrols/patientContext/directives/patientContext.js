'use strict';

angular.module('bahmni.clinical')
    .directive('patientContext', ['$state', '$translate', '$sce', 'patientService', 'spinner', 'appService', 'configurationService', function ($state, $translate, $sce, patientService, spinner, appService, configurationService) {
        var controller = function ($scope, $rootScope) {
            var patientContextConfig = appService.getAppDescriptor().getConfigValue('patientContext') || {};
            spinner.forPromise(patientService.getPatientContext($scope.patient.uuid, $state.params.enrollment, patientContextConfig.personAttributes, patientContextConfig.programAttributes)).then(function (response) {
                $scope.patientContext = response.data;
                var preferredIdentifier = patientContextConfig.preferredIdentifier;
                if (preferredIdentifier) {
                    var programAttributes = $scope.patientContext.programAttributes;
                    var personAttributes = $scope.patientContext.personAttributes;
                    if (programAttributes[preferredIdentifier]) {
                        $scope.patientContext.identifier = programAttributes[preferredIdentifier].value;
                        delete programAttributes[preferredIdentifier];
                    } else if (personAttributes[preferredIdentifier]) {
                        $scope.patientContext.identifier = personAttributes[preferredIdentifier].value;
                        delete personAttributes[preferredIdentifier];
                    }
                }
                $scope.patientContext.image = Bahmni.Common.Constants.patientImageUrl + $scope.patientContext.uuid + ".jpeg";
                $scope.patientContext.gender = $rootScope.genderMap[$scope.patientContext.gender];
            });
        };

        return {
            restrict: 'E',
            templateUrl: "displaycontrols/patientContext/views/patientContext.html",
            scope: {
                patient: "="
            },
            controller: controller
        };
    }]);