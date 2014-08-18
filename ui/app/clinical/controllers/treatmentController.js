'use strict';

angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', '$rootScope', 'DrugService', 'contextChangeHandler', 'RegisterTabService', 'treatmentConfig', 'DrugService', '$filter',
        function ($scope, $rootScope, treatmentService, contextChangeHandler, registerTabService, treatmentConfig, drugService, $filter) {

            $scope.treatments = $rootScope.newlyAddedTreatments || [];
            $scope.treatmentConfig = treatmentConfig;
            var extensionParams = $scope.currentBoard.extensionParams;
            var routes = $scope.treatmentConfig.routes;
            var durationUnits = $scope.treatmentConfig.durationUnits;

            $scope.treatment = new Bahmni.Clinical.DrugOrderViewModel(extensionParams, routes, durationUnits);
            $scope.treatment.scheduledDate = $filter("date")($scope.treatment.scheduledDate, 'yyyy-MM-dd');

            $scope.add = function () {
                $scope.treatments.push($scope.treatment);
                $scope.treatment = {};
            };

            $scope.remove = function (index) {
                $scope.treatments.splice(index, 1);
            };

            $scope.edit = function (index) {
                $scope.treatment = $scope.treatments[index];
                $scope.treatments.splice(index, 1);
            };

            var allowContextChange = function () {
                $rootScope.newlyAddedTreatments = $scope.treatments;
                return true;
            };

            $scope.getDrugs = function(request){
                return drugService.search(request.term);
            };

            $scope.getDataResults = function(data){
                return data.map(function(drug) {
                    return {
                        label: drug.name + " (" + drug.dosageForm.display + ")",
                        value: drug.name
                    }
                });
            };

            contextChangeHandler.add(allowContextChange);

            var saveTreatment = function () {
                $rootScope.consultation.drugOrders = [];
                $rootScope.newlyAddedTreatments.forEach(function (treatment) {
                    $rootScope.consultation.drugOrders.push(Bahmni.Clinical.DrugOrder.createFromUIObject(treatment));
                });
            };
            registerTabService.register(saveTreatment);
        }]);
