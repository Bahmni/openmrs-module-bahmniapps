'use strict';

angular.module('registration.createPatient', ['resources.patient', 'resources.patientAttributeType'])
    .controller('CreateNewPatientController', ['$scope', 'patient', 'patientAttributeType', function ($scope, patientService, patientAttributeType) {
        var attributes;

        (function(){
            var patient = {
                names: [{}],
                addresses: [{}],
                attributes: []
            };
            $scope.patient = patient;

            $scope.centers = [
                {name: 'GAN'},
                {name: 'SEM'},
                {name: 'SHI'},
                {name: 'BHA'}
            ];

            patient.centerID = $scope.centers[0];

            patientAttributeType.getAll().success(function(data){
                attributes = data.results;
            });
        })();

        $scope.create = function () {
            $scope.patient.attributes = attributes.map(function(result) {return {"attributeType": result.uuid, "name": result.name, "value" : $scope[result.name]}}).filter(function(result){return result.value && result.value !== ''});
            patientService.create($scope.patient);
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
