'use strict';

angular.module('bahmni.clinical')
    .directive('treatmentData', ['TreatmentService', 'appService', 'spinner', '$stateParams', function (treatmentService, appService, spinner, $stateParams) {
        var controller = function ($scope) {
            var Constants = Bahmni.Clinical.Constants;
            var defaultParams = {
                showListView: true,
                showRoute: false,
                showDrugForm: false,
                numberOfVisits: 1
            };
            $scope.params = angular.extend(defaultParams, $scope.params);

            var init = function () {
                var getToDate = function () {
                    return $scope.visitSummary.stopDateTime || Bahmni.Common.Util.DateUtil.now();
                };

                var programConfig = appService.getAppDescriptor().getConfigValue("program") || {};

                var startDate = null, endDate = null, getOtherActive, getEffectiveOrdersOnly = false;
                if (programConfig.showDashBoardWithinDateRange) {
                    startDate = $stateParams.dateEnrolled;
                    endDate = $stateParams.dateCompleted;
                    $scope.params.showOtherActive=true;
                    getEffectiveOrdersOnly = true;
                }

                return treatmentService.getPrescribedAndActiveDrugOrders($scope.params.patientUuid, $scope.params.numberOfVisits,
                    $scope.params.showOtherActive, $scope.params.visitUuids || [], startDate, endDate, getEffectiveOrdersOnly)
                    .then(function (response) {
                        var groupedByVisit = _.groupBy(response.data.visitDrugOrders, function (drugOrder) {
                            return drugOrder.visit.startDateTime;
                        });
                        var treatmentSections = [];

                        for (var key in groupedByVisit) {
                            var values = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments(groupedByVisit[key]);
                            treatmentSections.push({visitDate: key, drugOrders: values});
                        }
                        if (!_.isEmpty(response.data[Constants.otherActiveDrugOrders])) {
                            var mergedOtherActiveDrugOrders = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments(response.data[Constants.otherActiveDrugOrders]);
                            treatmentSections.push({
                                visitDate: Constants.otherActiveDrugOrders,
                                drugOrders: mergedOtherActiveDrugOrders
                            });
                        }
                        $scope.treatmentSections = treatmentSections;
                        if ($scope.visitSummary) {
                            $scope.ipdDrugOrders = Bahmni.Clinical.VisitDrugOrder.createFromDrugOrders(response.data.visitDrugOrders, $scope.visitSummary.startDateTime, getToDate());
                        }
                    });
            };

            spinner.forPromise(init());
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                params: "=",
                visitSummary: "=?"
            },
            templateUrl: "displaycontrols/treatmentData/views/treatmentData.html"
        };
    }]);