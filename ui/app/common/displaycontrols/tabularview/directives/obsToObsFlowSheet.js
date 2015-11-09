'use strict';

angular.module('bahmni.common.displaycontrol.obsVsObsFlowSheet')
    .directive('obsToObsFlowSheet', function () {
        var controller = function ($scope, observationsService, spinner) {
            $scope.config = $scope.isOnDashboard ? $scope.section.dashboardParams : $scope.section.allDetailsParams;
            var patient = $scope.patient;
            var init = function () {
                return observationsService.getObsInFlowSheet(patient.uuid, $scope.config.templateName,
                    $scope.config.groupByConcept, $scope.config.conceptNames, $scope.config.numberOfVisits).success(function (data) {
                        var foundElement = _.find(data.headers, function (header) {
                            return header.name === $scope.config.groupByConcept;
                        });
                        data.headers = _.without(data.headers, foundElement);
                        data.headers.unshift(foundElement);
                        $scope.obsTable = data;
                    });
            };

            $scope.isClickable = function () {
                return $scope.isOnDashboard && $scope.section.allDetailsParams;
            };

            $scope.dialogData = {
                "patient": $scope.patient,
                "section": $scope.section
            };

            spinner.forPromise(init());
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                patient: "=",
                section: "=",
                visitSummary: "=",
                isOnDashboard: "="
            },
            templateUrl: "../common/displaycontrols/tabularview/views/obsToObsFlowSheet.html"
        };
    });
