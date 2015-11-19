'use strict';

angular.module('bahmni.common.displaycontrol.obsVsObsFlowSheet')
    .directive('obsToObsFlowSheet', function () {
        var controller = function ($scope, observationsService, spinner) {
            $scope.config = $scope.isOnDashboard ? $scope.section.dashboardParams : $scope.section.allDetailsParams;
            var patient = $scope.patient;
            var init = function () {
                return observationsService.getObsInFlowSheet(patient.uuid, $scope.config.templateName,
                    $scope.config.groupByConcept, $scope.config.conceptNames, $scope.config.numberOfVisits, $scope.config.initialCount, $scope.config.latestCount).success(function (data) {
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

            var getName = function(obs){
                var name =  (obs && obs.value && obs.value.shortName) || (obs && obs.value && obs.value.name) || obs.value;
            };

            $scope.commafy = function (observations){
                var list = [];
                var unBoolean = function(boolValue) {
                    return boolValue ? "Yes" : "No";
                };

                for (var index in observations) {
                    var name =  getName(observations[index]);

                    if (observations[index].concept.dataType === "Boolean") name = unBoolean(name);

                    if(observations[index].concept.dataType === "Date"){
                        name = Bahmni.Common.Util.DateUtil.formatDateWithoutTime(name);
                    }

                    list.push(name);
                }

                return list.join(', ');
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
