'use strict';

(function () {
    var getAddress = function ($scope) {
        var patient = $scope.patient;
        var address = [];
        if ($scope.config.addressFields != undefined && $scope.config.addressFields.length != 0) {
            $scope.config.addressFields.forEach(function (addressField) {
                if (patient.address[addressField]) {
                    address.push(patient.address[addressField]);
                }
            });
        } else if (!_.includes($scope.config, "cityVillage")) {
            address.push(patient.address["cityVillage"]);
        }
        return address.join(", ");
    };
    var getPatientAttributeTypes = function ($scope) {
        var patient = $scope.patient;
        if ($scope.config.hasOwnProperty("ageLimit") && patient.age >= $scope.config.ageLimit) {
            patient.ageText = patient.age.toString() + " <span> years </span>";
        }
        var patientAttributeTypes = [patient.genderText, patient.ageText];
        if (patient.bloodGroupText) {
            patientAttributeTypes.push(patient.bloodGroupText);
        }
        return patientAttributeTypes.join(", ");
    };
    var isAdmitted = function (admissionStatus) {
        return _.get(admissionStatus, 'value') === "Admitted";
    };
    angular.module('bahmni.common.displaycontrol.patientprofile')
        .directive('patientProfile', ['patientService', 'spinner', '$sce', '$rootScope', '$stateParams', '$window', '$translate',
            'configurations', '$q', 'visitService', 'appService',
            function (patientService, spinner, $sce, $rootScope, $stateParams, $window, $translate,
                      configurations, $q, visitService, appService) {
                var controller = function ($scope) {
                    $scope.isProviderRelationship = function (relationship) {
                        return _.includes($rootScope.relationshipTypeMap.provider, relationship.relationshipType.aIsToB);
                    };
                    $scope.openPatientDashboard = function (patientUuid) {
                        var configName = $stateParams.configName || Bahmni.Common.Constants.defaultExtensionName;
                        $window.open("../clinical/#/" + configName + "/patient/" + patientUuid + "/dashboard");
                    };
                    var assignPatientDetails = function () {
                        var patientMapper = new Bahmni.PatientMapper(configurations.patientConfig(), $rootScope, $translate);
                        return patientService.getPatient($scope.patientUuid).then(function (response) {
                            var openMrsPatient = response.data;
                            $scope.patient = patientMapper.map(openMrsPatient);
                        });
                    };
                    var assignRelationshipDetails = function () {
                        return patientService.getRelationships($scope.patientUuid).then(function (response) {
                            $scope.relationships = response.data.results;
                        });
                    };
                    var assignAdmissionDetails = function () {
                        var REP = "custom:(attributes:(value,attributeType:(display,name)))";
                        var ADMISSION_STATUS_ATTRIBUTE = "Admission Status";
                        return visitService.getVisit($scope.visitUuid, REP).then(function (response) {
                            var attributes = response.data.attributes;
                            var admissionStatus = _.find(attributes, {attributeType: {name: ADMISSION_STATUS_ATTRIBUTE}});
                            $scope.hasBeenAdmitted = isAdmitted(admissionStatus);
                        });
                    };
                    var setHasBeenAdmittedOnVisitUuidChange = function () {
                        $scope.$watch('visitUuid', function (visitUuid) {
                            if (!_.isEmpty(visitUuid)) {
                                assignAdmissionDetails();
                            }
                        });
                    };
                    var setDirectiveAsReady = function () {
                        $scope.isDirectiveReady = true;
                    };
                    var onDirectiveReady = function () {
                        $scope.addressLine = getAddress($scope);
                        $scope.patientAttributeTypes = $sce.trustAsHtml(getPatientAttributeTypes($scope));
                        $scope.showBirthDate = $scope.config.showDOB !== false;
                        $scope.showBirthDate = $scope.showBirthDate && !!$scope.patient.birthdate;
                    };
                    var setMiddleNameWhenConfigured = function () {
                        var patientConfig = appService.getAppDescriptor().getConfigValue("patientConfig");
                        var showMiddleNameOn = _.get(patientConfig, 'showMiddleNameOn');
                        if (_.includes(showMiddleNameOn, "patient-profile")) {
                            $scope.patient.name = [$scope.patient.givenName, $scope.patient.middleName, $scope.patient.familyName].join(' ');
                        }
                    };
                    var initPromise = $q.all([assignPatientDetails(), assignRelationshipDetails()]);
                    initPromise.then(onDirectiveReady);
                    initPromise.then(setHasBeenAdmittedOnVisitUuidChange);
                    initPromise.then(setMiddleNameWhenConfigured);
                    initPromise.then(setDirectiveAsReady);
                    $scope.initialization = initPromise;
                };

                var link = function ($scope, element) {
                    spinner.forPromise($scope.initialization, element);
                };

                return {
                    restrict: 'E',
                    controller: controller,
                    link: link,
                    scope: {
                        patientUuid: "@",
                        visitUuid: "@",
                        config: "="
                    },
                    templateUrl: "../common/displaycontrols/patientprofile/views/patientProfile.html"
                };
            }]);
})();
