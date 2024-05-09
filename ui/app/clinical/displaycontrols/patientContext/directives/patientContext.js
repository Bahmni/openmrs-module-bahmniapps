'use strict';

angular.module('bahmni.clinical')
    .directive('patientContext', ['$state', '$translate', '$sce', 'patientService', 'spinner', 'appService', function ($state, $translate, $sce, patientService, spinner, appService) {
        var controller = function ($scope, $rootScope) {
            var patientContextConfig = appService.getAppDescriptor().getConfigValue('patientContext') || {};
            $scope.initPromise = patientService.getPatientContext($scope.patient.uuid, $state.params.enrollment, patientContextConfig.personAttributes, patientContextConfig.programAttributes, patientContextConfig.additionalPatientIdentifiers);
            $scope.allowNavigation = angular.isDefined($scope.isConsultation);
            $scope.initPromise.then(function (response) {
                $scope.patientContext = response.data;
                $scope.iconAttributeConfig = appService.getAppDescriptor().getConfigValue('iconAttribute') || {};
                $scope.showIcon = $scope.iconAttributeConfig && $scope.iconAttributeConfig.attrName && $scope.iconAttributeConfig.attrValue && $scope.patientContext.personAttributes && $scope.patientContext.personAttributes[$scope.iconAttributeConfig.attrName] && $scope.patientContext.personAttributes[$scope.iconAttributeConfig.attrName].value === $scope.iconAttributeConfig.attrValue;
                if ($scope.patientContext.personAttributes && $scope.showIcon) {
                    delete $scope.patientContext.personAttributes[$scope.iconAttributeConfig.attrName];
                }
                var programAttributes = $scope.patientContext.programAttributes;
                var personAttributes = $scope.patientContext.personAttributes;
                convertBooleanValuesToEnglish(personAttributes);
                convertBooleanValuesToEnglish(programAttributes);
                translateAttributes(personAttributes);
                translateAttributes(programAttributes);
                var preferredIdentifier = patientContextConfig.preferredIdentifier;
                if (preferredIdentifier) {
                    if (programAttributes[preferredIdentifier]) {
                        $scope.patientContext.identifier = programAttributes[preferredIdentifier].value;
                        delete programAttributes[preferredIdentifier];
                    } else if (personAttributes[preferredIdentifier]) {
                        $scope.patientContext.identifier = personAttributes[preferredIdentifier].value;
                        delete personAttributes[preferredIdentifier];
                    }
                }

                $scope.showNameAndImage = $scope.showNameAndImage !== undefined ? $scope.showNameAndImage : true;
                if ($scope.showNameAndImage) {
                    $scope.patientContext.image = Bahmni.Common.Constants.patientImageUrlByPatientUuid + $scope.patientContext.uuid;
                }
                $scope.patientContext.gender = $rootScope.genderMap[$scope.patientContext.gender];
            });

            $scope.navigate = function () {
                if ($scope.isConsultation) {
                    $scope.$parent.$parent.$broadcast("patientContext:goToPatientDashboard");
                } else {
                    $state.go("search.patientsearch");
                }
            };
        };

        var link = function ($scope, element) {
            spinner.forPromise($scope.initPromise, element);
        };

        var convertBooleanValuesToEnglish = function (attributes) {
            var booleanMap = {'true': 'Yes', 'false': 'No'};
            _.forEach(attributes, function (value) {
                value.value = booleanMap[value.value] ? booleanMap[value.value] : value.value;
            });
        };

        var translateAttributes = function (attributes) {
            _.forEach(attributes, function (attribute, key) {
                var translatedName = Bahmni.Common.Util.TranslationUtil.translateAttribute(key, Bahmni.Common.Constants.clinical, $translate);
                attribute.description = translatedName;
            });
        };

        return {
            restrict: 'E',
            templateUrl: "displaycontrols/patientContext/views/patientContext.html",
            scope: {
                patient: "=",
                showNameAndImage: "=?",
                isConsultation: "=?"
            },
            controller: controller,
            link: link
        };
    }]);
