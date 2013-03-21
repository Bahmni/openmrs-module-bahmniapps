'use strict';

angular.module('registration.createPatient', ['resources.patient', 'resources.patientAttributeType', 'resources.patientData'])
    .controller('CreateNewPatientController', ['$scope', 'patient', 'patientAttributeType', 'patientData', '$location',
        function ($scope, patientService, patientAttributeType, patientData, $location) {

        (function(){
            $scope.patient = patientData.patientObject();
            $scope.centers = [
                {name: 'GAN'},
                {name: 'SEM'},
                {name: 'SHI'},
                {name: 'BHA'}
            ];
            $scope.patient.centerID = $scope.centers[0];
            patientAttributeType.getAll().success(function(data){
                $scope.patient.attributes = data.results;
            });
        })();

        $scope.create = function () {
            var patient = $scope.patient;
            if(patient.birthdate === ""){
                delete patient["birthdate"];
            }
            patient.attributes = patient.attributes.map(function(result) {return {"attributeType": result.uuid, "name": result.name, "value" : $scope[result.name]}}).filter(function(result){return result.value && result.value !== ''});
            patientService.create(patient).success(function (data) {
                patientData.rememberResponse(data);
                patientData.rememberPatient($scope.patient);
                $location.path("/visitinformation");
            });
        };

        $scope.calculatePatientAge = function(){
            var curDate = new Date();
            var birthDate = new Date($scope.patient.birthdate);
            if(birthDate < curDate.setFullYear(curDate.getFullYear()-120)){
                $scope.patient.birthdate.$error = true;
            }
            $scope.patient.age = curDate.getFullYear() - birthDate.getFullYear() - ((curDate.getMonth() < birthDate.getMonth())? 1: 0);
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
                            $scope.calculatePatientAge();
                        });
                    }
                });
            });
        }
    });