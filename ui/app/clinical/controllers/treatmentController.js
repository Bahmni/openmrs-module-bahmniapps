'use strict';

angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', '$rootScope', 'DrugService', 'contextChangeHandler', 'RegisterTabService', 'treatmentConfig',
        function ($scope, $rootScope, treatmentService, contextChangeHandler, registerTabService, treatmentConfig) {
            $scope.treatment = {};
            $scope.treatments = [];
            $scope.treatmentConfig = treatmentConfig;

            $scope.add = function () {
                $scope.treatments.push($scope.treatment);
                $scope.treatment = {};
            };

            $scope.delete = function (index) {
                $scope.treatments.splice(index, 1);
            };

            $scope.edit = function (index) {
                $scope.treatment = $scope.treatments[index];
                $scope.treatments.splice(index, 1);
            };

            $scope.getText = function (treatment) {
                return treatment.drugName + " - " +
                    getDoseAndFrequency(treatment) + ", " +
                    treatment.instructions.name + ", " +
                    treatment.route.name + " - " +
                    treatment.duration + " " +
                    treatment.durationUnit.name + " (" +
                    treatment.quantity + " " +
                    treatment.quantityUnit.name + ")";
            };

            var getDoseAndFrequency = function (treatment) {
                return treatment.dose ? simpleDoseAndFrequency(treatment) : numberBasedDoseAndFrequency(treatment);
            };

            var simpleDoseAndFrequency = function (treatment) {
                return treatment.dose + " " +
                    treatment.doseUnit.name + ", " +
                    treatment.frequency.name;
            };

            var numberBasedDoseAndFrequency = function (treatment) {
                return treatment.morningDose + "-" + treatment.afternoonDose + "-" + treatment.eveningDose;
            };
        }]);