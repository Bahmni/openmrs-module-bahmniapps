'use strict';

angular.module('bahmni.common.displaycontrol.obsVsObsFlowSheet')
    .directive('obsToObsFlowSheet', function () {
        var controller = function ($scope, observationsService, spinner) {
            $scope.config = $scope.isOnDashboard ? $scope.section.dashboardParams : $scope.section.allDetailsParams;
            $scope.isEditable = $scope.config.isEditable;
            var patient = $scope.patient;
            var init = function () {
                return observationsService.getObsInFlowSheet(patient.uuid, $scope.config.templateName,
                    $scope.config.groupByConcept, $scope.config.conceptNames, $scope.config.numberOfVisits, $scope.config.initialCount, $scope.config.latestCount, $scope.config.name).success(function (data) {
                        var groupByElement = _.find(data.headers, function (header) {
                            return header.name === $scope.config.groupByConcept;
                        });
                        data.headers = _.without(data.headers, groupByElement);
                        data.headers.unshift(groupByElement);
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

            $scope.getDisplayName = function(observation){
                return observation.concept.shortName || observation.concept.name ;

            };

            $scope.getEditObsData = function (observation) {
                return {
                    observation: {encounterUuid: observation.encounterUuid, uuid: observation.obsGroupUuid},
                    conceptSetName: $scope.config.templateName,
                    conceptDisplayName: $scope.config.templateName
                }
            };

            $scope.getPivotOn = function(){
                return $scope.config.pivotOn;
            };

            var getName = function(obs){
                return (obs && obs.value && obs.value.shortName) || (obs && obs.value && obs.value.name) || obs.value;
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

            $scope.isMonthAvailable = function(){
                return $scope.obsTable.rows[0].columns['Month'] != null
            }

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
