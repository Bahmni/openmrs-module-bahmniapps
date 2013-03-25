'use strict';

angular.module('registration.createPatient', ['resources.patientService', 'resources.patientAttributeType'])
    .controller('CreateNewPatientController', ['$scope', 'patientService', 'patientAttributeType', '$location',
        function ($scope, patientService, patientAttributeType, $location) {

        (function(){
            $scope.patient = patientService.getPatient();
            $scope.centers = [
                {name: 'GAN'},
                {name: 'SEM'},
                {name: 'SHI'},
                {name: 'BAH'}
            ];
            $scope.patient.centerID = $scope.centers[0];
            patientAttributeType.getAll().success(function(data){
                $scope.patient.attributes = data.results;
            });
        })();

        $scope.clearPatientIdentifier = function() {
            $scope.patientIdentifier = "";
        }

        $scope.create = function () {
            var patient = $scope.patient;
            if(patient.birthdate === ""){
                delete patient["birthdate"];
            }
            var patientIdentifier = $scope.patientIdentifier;
            if (patientIdentifier && patientIdentifier.length > 0) {
                patient.patientIdentifier = patient.centerID.name + patientIdentifier;
            }
            patient.attributes = patient.attributes.map(function(result) {return {"attributeType": result.uuid, "name": result.name, "value" : $scope[result.name]}}).filter(function(result){return result.value && result.value !== ''});
            patientService.create(patient).success(function (data) {
                $scope.patient.identifier = data.identifier;
                $scope.patient.uuid = data.uuid;
                $scope.patient.name = data.name;
                patientService.rememberPatient($scope.patient);
                $location.path("/visitinformation");
            });
        };
    }])

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