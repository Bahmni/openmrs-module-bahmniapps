'use strict';

angular.module('bahmni.common.displaycontrol.obsVsObsFlowSheet')
    .directive('obsToObsFlowSheet', function () {
        var controller = function ($scope, observationsService, spinner,appService, conceptSetService, $q, $stateParams) {
            $scope.config = $scope.isOnDashboard ? $scope.section.dashboardParams : $scope.section.allDetailsParams;
            $scope.isEditable = $scope.config.isEditable;
            var patient = $scope.patient;

            var getTemplateDisplayName = function () {
                return conceptSetService.getConcept({
                    name: $scope.config.templateName,
                    v: "custom:(uuid,names,displayString)"
                }).then(function (result) {
                    var templateConcept = result.data.results[0];
                    var displayName = templateConcept.displayString;
                    if (templateConcept.names && templateConcept.names.length === 1 && templateConcept.names[0].name != "") {
                        displayName = templateConcept.names[0].name;
                    }
                    else if (templateConcept.names && templateConcept.names.length === 2) {
                        displayName = _.find(templateConcept.names, {conceptNameType: "SHORT"}).name;
                    }
                    $scope.conceptDisplayName = displayName;
                })
            };

            var getObsInFlowSheet = function () {
                var programConfig = appService.getAppDescriptor().getConfigValue("program") || {};
                var startDate = null, endDate = null, getOtherActive;
                if (programConfig.showDashBoardWithinDateRange) {
                    startDate = $stateParams.dateEnrolled;
                    endDate = $stateParams.dateCompleted;
                }

                return observationsService.getObsInFlowSheet(patient.uuid, $scope.config.templateName,
                        $scope.config.groupByConcept, $scope.config.conceptNames, $scope.config.numberOfVisits,
                        $scope.config.initialCount, $scope.config.latestCount, $scope.config.name, startDate, endDate)
                    .then(function (result) {
                        var obsInFlowSheet = result.data;
                        var groupByElement = _.find(obsInFlowSheet.headers, function (header) {
                            return header.name === $scope.config.groupByConcept;
                        });
                        obsInFlowSheet.headers = _.without(obsInFlowSheet.headers, groupByElement);
                        obsInFlowSheet.headers.unshift(groupByElement);
                        $scope.obsTable = obsInFlowSheet;
                    })
            };

            var init = function () {
                return $q.all([getObsInFlowSheet(), getTemplateDisplayName()]).then(function (results) {
                });
            };

            $scope.isClickable = function () {
                return $scope.isOnDashboard && $scope.section.allDetailsParams;
            };

            $scope.dialogData = {
                "patient": $scope.patient,
                "section": $scope.section
            };

            $scope.getEditObsData = function (observation) {
                return {
                    observation: {encounterUuid: observation.encounterUuid, uuid: observation.obsGroupUuid},
                    conceptSetName: $scope.config.templateName,
                    conceptDisplayName: $scope.conceptDisplayName
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
