'use strict';

angular.module('registration.createPatient', ['resources.patient', 'resources.patientAttributeType'])
    .controller('CreateNewPatientController', ['$scope', 'patient', 'patientAttributeType', function ($scope, patientService, patientAttributeType) {

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
                patient.attributes = data.results.map(function(result) {return {"attributeType": result.uuid, "name": result.name, value : $scope[result.name]}});
            });
        })();

        $scope.create = function () {
            console.log(patient);
            patientService.create($scope.patient);
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
                    onSelect: function (dateText) {
                        $scope.$apply(function (scope) {
                            ngModel.assign(scope, dateText);
                        });
                    }
                });
            });
        }
    });
