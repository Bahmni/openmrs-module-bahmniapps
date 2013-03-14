'use strict';

angular.module('registration.createPatient', ['resources.patient', 'resources.patientAttributeType', 'resources.patientData'])
    .controller('CreateNewPatientController', ['$scope', 'patient', 'patientAttributeType', 'patientData', '$location',
        function ($scope, patientService, patientAttributeType, patientData, $location) {
        var attributes;

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
                attributes = data.results;
            });
        })();

        $scope.create = function () {
            $scope.name="";
            $scope.patient.attributes = attributes.map(function(result) {return {"attributeType": result.uuid, "name": result.name, "value" : $scope[result.name]}}).filter(function(result){return result.value && result.value !== ''});
            patientService.create($scope.patient).success(function (data) {
                patientData.rememberResponse(data);
                patientData.rememberPatient($scope.patient);
                $location.path("/visitinformation");
            });
        };

        $scope.calculatePatientAge = function(){
            var curDate = new Date();
            var birthDate = new Date($scope.patient.birthdate);
            $scope.patient.age = curDate.getFullYear() - birthDate.getFullYear() - ((curDate.getMonth() < birthDate.getMonth())? 1: 0);
        };
    }])

    .directive('datepicker', function ($parse) {
        return function ($scope, element, attrs) {
            var ngModel = $parse(attrs.ngModel);
            $(function () {
                element.datepicker({
                    changeYear: true,
                    changeMonth: true,
                    dateFormat: 'yy-mm-dd',
                    maxDate: new Date(),
                    onSelect: function (dateText) {
                        $scope.$apply(function (scope) {
                            ngModel.assign(scope, dateText);
                        });
                        var curDate = new Date();
                        var birthDate = new Date($scope.patient.birthdate);
                        $scope.patient.age = curDate.getFullYear() - birthDate.getFullYear() - ((curDate.getMonth() < birthDate.getMonth())? 1: 0);
                    }
                });
            });
        }
    });
