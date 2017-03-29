'use strict';

angular.module('bahmni.clinical')
    .directive('patientContext', ['$state', '$translate', '$sce', 'patientService', 'spinner', 'appService',
        function ($state, $translate, $sce, patientService, spinner, appService) {
            var controller = function ($scope, $rootScope) {
                var setMiddleNameWhenConfigured = function () {
                    var patientConfig = appService.getAppDescriptor().getConfigValue("patientConfig");
                    var showMiddleNameOn = _.get(patientConfig, 'showMiddleNameOn');
                    if (_.includes(showMiddleNameOn, "patient-context")) {
                        $scope.patientContext.name = [$scope.patient.givenName, $scope.patient.middleName, $scope.patient.familyName].join(' ');
                    }
                };

                var patientContextConfig = appService.getAppDescriptor().getConfigValue('patientContext') || {};
                $scope.initPromise = patientService.getPatientContext($scope.patient.uuid, $state.params.enrollment, patientContextConfig.personAttributes,
                    patientContextConfig.programAttributes, patientContextConfig.additionalPatientIdentifiers);

                $scope.initPromise.then(function (response) {
                    $scope.patientContext = response.data;
                    var programAttributes = $scope.patientContext.programAttributes;
                    var personAttributes = $scope.patientContext.personAttributes;

                    convertBooleanValuesToEnglish(personAttributes);
                    convertBooleanValuesToEnglish(programAttributes);

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
                    $scope.patientContext.name = [$scope.patient.givenName, $scope.patient.familyName].join(' ');
                });

                $scope.initPromise.then(setMiddleNameWhenConfigured);
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

            return {
                restrict: 'E',
                templateUrl: "displaycontrols/patientContext/views/patientContext.html",
                scope: {
                    patient: "=",
                    showNameAndImage: "=?"
                },
                controller: controller,
                link: link
            };
        }]);
