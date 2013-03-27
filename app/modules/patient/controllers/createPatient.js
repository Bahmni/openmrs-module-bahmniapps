'use strict';

angular.module('registration.createPatient', ['resources.patientService', 'resources.patientAttributeType', 'resources.preferences'])
    .controller('CreateNewPatientController', ['$scope', 'patientService', 'patientAttributeType', '$location', 'Preferences',
        function ($scope, patientService, patientAttributeType, $location, preferences) {

            (function () {
                $scope.patient = patientService.getPatient();
                $scope.centers = [
                    {name: 'GAN'},
                    {name: 'SEM'},
                    {name: 'SHI'},
                    {name: 'BAH'}
                ];
                $scope.patient.centerID = $scope.centers.filter(function (center) {
                    return center.name === preferences.centerID
                })[0];
                $scope.hasOldIdentifier = preferences.hasOldIdentifier;
                patientAttributeType.getAll().success(function (data) {
                    $scope.patient.attributes = data.results;
                });
            })();

            $scope.clearPatientIdentifier = function () {
                $scope.patientIdentifier = "";
            };

            var setPreferences = function () {
                preferences.centerID = $scope.patient.centerID.name;
                preferences.hasOldIdentifier = $scope.hasOldIdentifier;
            };

            $scope.create = function () {
                var patient = $scope.patient;
                if (patient.birthdate === "") {
                    delete patient["birthdate"];
                }
                var registrationNumber = $scope.registrationNumber;
                if (registrationNumber && registrationNumber.length > 0) {
                    patient.patientIdentifier = patient.centerID.name + registrationNumber;
                } else {
                    patient.patientIdentifier = "";
                }
                patient.attributes = patient.attributes.map(function (result) {
                    return {"attributeType": result.uuid, "name": result.name, "value": $scope[result.name]}
                }).filter(function (result) {
                    return result.value && result.value !== ''
                });
                setPreferences();
                patientService.create(patient).success(function (data) {
                    $scope.patient.identifier = data.identifier;
                    $scope.patient.uuid = data.uuid;
                    $scope.patient.name = data.name;
                    patientService.rememberPatient($scope.patient);
                    $location.path("/visitinformation");
                });
            };
        }])

    .directive('nonBlank', function ($parse) {
        return function ($scope, element, attrs) {
            var addNonBlankAttrs = function(){
                element.attr({'required': 'required', "pattern": '^.*[^\\s]+.*', title: "Non blank value"});
            }

            var removeNonBlankAttrs = function() {
                element.removeAttr('required').removeAttr('pattern').removeAttr('title')
            };

            if(!attrs.nonBlank) return addNonBlankAttrs(element);

            $scope.$watch(attrs.nonBlank, function(value){
                return value ? addNonBlankAttrs() : removeNonBlankAttrs();
            });
        }
    })

    .directive('datepicker', function ($parse) {
        return function ($scope, element, attrs) {
            var ngModel = $parse(attrs.ngModel);
            $(function () {
                var today = new Date();
                element.datepicker({
                    changeYear: true,
                    changeMonth: true,
                    maxDate: today,
                    minDate: "-120y",
                    yearRange: 'c-120:c',
                    dateFormat: 'dd-mm-yy',
                    onSelect: function (dateText) {
                        $scope.$apply(function (scope) {
                            ngModel.assign(scope, dateText);
                            $scope.$eval(attrs.ngChange);
                        });
                    }
                });
            });
        }
    });