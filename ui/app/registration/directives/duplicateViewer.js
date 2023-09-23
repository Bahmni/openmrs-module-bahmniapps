'use strict';

angular.module('bahmni.registration')
    .directive('duplicateViewer', function () {
        return {
            restrict: 'AE',
            templateUrl: 'views/duplicateViewer.html',
            controller: 'DuplicatePatientController'
        };
    })
    .controller('DuplicatePatientController', ['$window', '$scope', '$rootScope', 'spinner', '$location', 'ngDialog', 'patientService', 'providerService', 'appService', '$q',
        function ($window, $scope, $rootScope, spinner, $location, ngDialog, patientService, providerService, appService, $q) {
            $scope.resolveDuplicates = function () {
                ngDialog.openConfirm({
                    template: "views/manageDuplicatePatients.html",
                    scope: $scope,
                    closeByEscape: true,
                    width: '40%'
                });
            };

            $scope.continueWithPatient = function (patient) {
                if (patient.uuid) {
                    var forwardUrl = "/patient/{{patientUuid}}";
                    $rootScope.duplicatePatientsList = [];
                    $rootScope.duplicatePatientFound = false;
                    $rootScope.localDuplicateFound = false;

                    // TODO: Be explicit
                    ngDialog.close();
                    $location.url(appService.getAppDescriptor().formatUrl(forwardUrl, {'patientUuid': patient.uuid}));
                }
            };

            $scope.formatExtraIdentifiers = function (extraIdentifiers) {
                var list = extraIdentifiers.split(",");
                var result = "";
                var opening = "<p>"
                var closing = "</p>"
                list.forEach(element => {
                    result += opening+  element + closing + "<br/>";
                });
                return list;
            };

            $scope.mergePatient = function (patient) {
                if (patient.given_name) $scope.patient.givenName = patient.given_name;
                if (patient.middle_name) $scope.patient.middleName = patient.middle_name;
                if (patient.family_name) $scope.patient.familyName = patient.family_name;

                if (patient.gender) {
                    switch (patient.gender) {
                        case 'male':
                            $scope.patient.gender = 'M';
                            break;
                        case 'female':
                            $scope.patient.gender = 'F';
                            break;
                    
                        default:
                            $scope.patient.gender = 'O';
                            break;
                    }
                }                

                // Age is auto-calculated
                if (patient.birthdate) {
                     $scope.patient.birthdate = Bahmni.Common.Util.DateUtil.parse(patient.birthdate);

                    var age = Bahmni.Common.Util.DateUtil.diffInYearsMonthsDays($scope.patient.birthdate , Bahmni.Common.Util.DateUtil.now());
                    $scope.patient.age.years = age.years;
                    $scope.patient.age.months = age.months;
                    $scope.patient.age.days = age.days;
                }
                
                $scope.patient.hieUuid = patient.uuid;
                _.each($scope.patient.extraIdentifiers, function (identifier,key) {
                    var hieIdentifier = _.filter(patient.identifiers, function (hieIdentifier) {
                        return hieIdentifier.type.toLowerCase() === identifier.identifierType.name.toLowerCase();
                    });
                    if (hieIdentifier.length > 0) {
                        $scope.patient.extraIdentifiers[key].registrationNumber = hieIdentifier[0].value;
                    }
                });

            };

            var init = function () {
                $scope.relationshipTypes = $rootScope.relationshipTypes;
                $scope.patient.relationships = $scope.patient.relationships || [];
            };

            init();
        }
    ]);

