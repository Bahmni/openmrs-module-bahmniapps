'use strict';

angular.module('bahmni.common.displaycontrol.obsVsObsFlowSheet').directive('obsToObsFlowSheet', ['$translate', 'spinner', 'observationsService', 'conceptSetService', '$q', 'conceptSetUiConfigService',
    function ($translate, spinner, observationsService, conceptSetService, $q, conceptSetUiConfigService) {
        var link = function ($scope, element) {
            $scope.config = $scope.isOnDashboard ? $scope.section.dashboardConfig : $scope.section.expandedViewConfig;
            $scope.isEditable = $scope.config.isEditable;
            var patient = $scope.patient;

            var getTemplateDisplayName = function () {
                if ($scope.config.templateName) {
                    return conceptSetService.getConcept({
                        name: $scope.config.templateName,
                        v: "custom:(uuid,names,displayString)"
                    }).then(function (result) {
                        var templateConcept = result && result.data && result.data.results && result.data.results[0];
                        var displayName = templateConcept && templateConcept.displayString;
                        if (templateConcept && templateConcept.names && templateConcept.names.length === 1 && templateConcept.names[0].name != "") {
                            displayName = templateConcept.names[0].name;
                        } else if (templateConcept && templateConcept.names && templateConcept.names.length === 2) {
                            displayName = _.find(templateConcept.names, {conceptNameType: "SHORT"}).name;
                        }
                        $scope.conceptDisplayName = displayName;
                    });
                }
            };

            var removeEmptyRecords = function (records) {
                records.headers = _.filter(records.headers, function (header) {
                    return !(_.every(records.rows, function (record) {
                        return _.isEmpty(record.columns[header.name]);
                    }));
                });
                return records;
            };

            var getObsInFlowSheet = function () {
                return observationsService.getObsInFlowSheet(patient.uuid, $scope.config.templateName,
                    $scope.config.groupByConcept, $scope.config.orderByConcept, $scope.config.conceptNames, $scope.config.numberOfVisits,
                    $scope.config.initialCount, $scope.config.latestCount, $scope.config.type, $scope.section.startDate,
                    $scope.section.endDate, $scope.enrollment, $scope.config.formNames).success(function (data) {
                        var obsInFlowSheet = data;
                        var groupByElement = _.find(obsInFlowSheet.headers, function (header) {
                            return header.name === $scope.config.groupByConcept;
                        });
                        obsInFlowSheet.headers = _.without(obsInFlowSheet.headers, groupByElement);
                        obsInFlowSheet.headers.unshift(groupByElement);
                        if ($scope.config.hideEmptyRecords) {
                            obsInFlowSheet = removeEmptyRecords(obsInFlowSheet);
                        }
                        $scope.obsTable = obsInFlowSheet;
                        if (_.isEmpty($scope.obsTable.rows)) {
                            $scope.$emit("no-data-present-event");
                        }
                    });
            };

            var init = function () {
                return $q.all([getObsInFlowSheet(), getTemplateDisplayName()]).then(function () {
                });
            };

            $scope.isClickable = function () {
                return $scope.isOnDashboard && $scope.section.expandedViewConfig;
            };

            $scope.dialogData = {
                "patient": $scope.patient,
                "section": $scope.section
            };

            $scope.getEditObsData = function (observation) {
                var editData = {
                    observation: {encounterUuid: observation.encounterUuid}
                };
                if ($scope.config.templateName) {
                    editData.observation.uuid = observation.obsGroupUuid;
                    editData.conceptSetName = $scope.config.templateName;
                    editData.conceptDisplayName = $scope.conceptDisplayName;
                } else {
                    var formNameAndVersion = Bahmni.Common.Util.FormFieldPathUtil
                        .getFormNameAndVersion(observation.formFieldPath);
                    editData.observation = Object.assign({}, editData.observation,
                        {
                            formType: Bahmni.Common.Constants.formBuilderType,
                            formName: formNameAndVersion.formName,
                            formVersion: formNameAndVersion.formVersion
                        });
                }
                return editData;
            };

            $scope.getPivotOn = function () {
                return $scope.config.pivotOn;
            };

            $scope.getHeaderName = function (header) {
                var abbreviation = getSourceCode(header, $scope.section.headingConceptSource);
                var headerName = abbreviation || header.shortName || header.name;
                if (header.units) {
                    headerName = headerName + " (" + header.units + ")";
                }
                return headerName;
            };

            var getSourceCode = function (concept, conceptSource) {
                var result;
                if (concept && concept.mappings && concept.mappings.length > 0) {
                    result = _.result(_.find(concept.mappings, {"source": conceptSource}), "code");
                    result = $translate.instant(result);
                }

                return result;
            };

            var getName = function (obs) {
                return getSourceCode(obs.value, $scope.section.dataConceptSource) || (obs && obs.value && obs.value.shortName) || (obs && obs.value && obs.value.name) || obs.value;
            };

            $scope.commafy = function (observations) {
                var list = [];
                var config = conceptSetUiConfigService.getConfig();
                var unBoolean = function (boolValue) {
                    return boolValue ? $translate.instant("OBS_BOOLEAN_YES_KEY") : $translate.instant("OBS_BOOLEAN_NO_KEY");
                };

                for (var index in observations) {
                    var name = getName(observations[index]);

                    if (observations[index].concept.dataType === "Boolean") {
                        name = unBoolean(name);
                    }

                    if (observations[index].concept.dataType === "Date") {
                        var conceptName = observations[index].concept.name;
                        var date = new Date(observations[index].observationDateTime);
                        if (conceptName && config[conceptName] && config[conceptName].displayMonthAndYear == true) {
                            name = Bahmni.Common.Util.DateUtil.getDateInMonthsAndYears(date);
                        } else {
                            name = Bahmni.Common.Util.DateUtil.formatDateWithoutTime(date);
                        }
                    }
                    list.push(name);
                }

                return list.join($scope.config && $scope.config.obsDelimiter ? $scope.config.obsDelimiter : ', ');
            };

            $scope.isMonthAvailable = function () {
                return $scope.obsTable.rows[0].columns['Month'] != null;
            };

            $scope.hasPDFAsValue = function (data) {
                return data.value ? data.value.indexOf('.pdf') > 0 : false;
            };

            spinner.forPromise(init(), element);
        };
        return {
            restrict: 'E',
            link: link,
            scope: {
                patient: "=",
                section: "=",
                visitSummary: "=",
                isOnDashboard: "=",
                enrollment: "=",
                startDate: "=",
                endDate: "="
            },
            templateUrl: "../common/displaycontrols/tabularview/views/obsToObsFlowSheet.html"
        };
    }]);
