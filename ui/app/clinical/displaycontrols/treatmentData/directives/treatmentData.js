'use strict';

angular.module('bahmni.clinical')
    .directive('treatmentData', ['TreatmentService', 'spinner', function (treatmentService, spinner) {
        var controller = function ($scope) {
            var defaultParams = {
                showListView: true,
                numberOfVisits: 1
            };
            $scope.params = angular.extend(defaultParams, $scope.params);

            var init = function () {
                return treatmentService.getPrescribedAndActiveDrugOrdersFromServer($scope.params.patientUuid, $scope.params.numberOfVisits, $scope.params.showOtherActive, $scope.params.visitUuids || []).then(function (response) {
                    var groupedByVisit = _.groupBy(response.data.visitDrugOrders, function (drugOrder) {
                        return drugOrder.visit.startDateTime;
                    });
                    var treatmentSections = [];

                    for(var key in groupedByVisit){
                        treatmentSections.push({visitDate: key, drugOrders: groupedByVisit[key]});
                    }

                    if(response.data["Other Active DrugOrders"]){
                        treatmentSections.push({visitDate: "Other Active DrugOrders", drugOrders: response.data["Other Active DrugOrders"]});
                    }
                    $scope.treatmentSections = treatmentSections;
                });
            };

            spinner.forPromise(init());

        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                params: "="
            },
            templateUrl: "displaycontrols/treatmentData/views/treatmentData.html"
        };
    }]);