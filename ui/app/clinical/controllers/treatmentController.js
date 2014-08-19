'use strict';

angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', '$rootScope', 'DrugService', 'contextChangeHandler', 'RegisterTabService', 'treatmentConfig', 'DrugService', '$filter',
        function ($scope, $rootScope, treatmentService, contextChangeHandler, registerTabService, treatmentConfig, drugService, $filter) {

            $scope.treatments = $rootScope.newlyAddedTreatments || [];
            $scope.treatmentConfig = treatmentConfig;

            var newTreatment = function () {
                return new Bahmni.Clinical.DrugOrderViewModel($scope.currentBoard.extensionParams,
                    $scope.treatmentConfig.routes, $scope.treatmentConfig.durationUnits);
            }

            $scope.treatment = newTreatment();
            $scope.treatment.scheduledDate = $filter("date")($scope.treatment.scheduledDate, 'yyyy-MM-dd');

            $scope.add = function () {
                if ($scope.addForm.$invalid) {
                    $scope.formInvalid = true;
                    return;
                }
                $scope.treatments.push($scope.treatment);
                $scope.treatment = newTreatment();
                $scope.treatment.scheduledDate = $filter("date")($scope.treatment.scheduledDate, 'yyyy-MM-dd');
                $scope.formInvalid = false;
            };

            $scope.isVariableDosingType = function() {
                return $scope.isFrequencyType('variable');
            };

            $scope.isUniformDosingType = function() {
                return isFrequencyType("uniform");
            };

            $scope.isFrequencyType = function(type) {
                return $scope.treatment.frequencyType === type;
            };
            $scope.remove = function (index) {
                $scope.treatments.splice(index, 1);
            };

            $scope.toggle = function (line) {
                line.showNotes = !line.showNotes;
            }

            $scope.edit = function (index) {
                $scope.treatment = $scope.treatments[index];
                $scope.treatments.splice(index, 1);
            };

            var allowContextChange = function () {
                $rootScope.newlyAddedTreatments = $scope.treatments;
                return true;
            };

            $scope.getDrugs = function (request) {
                return drugService.search(request.term);
            };

            $scope.getDataResults = function (data) {
                return data.map(function (drug) {
                    return {
                        label: drug.name + " (" + drug.dosageForm.display + ")",
                        value: drug.name + " (" + drug.dosageForm.display + ")",
                        drug: drug
                    }
                });
            };

            $scope.populateBackingFields = function(item) {
                $scope.treatment.drugName = item.drug.name;
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
