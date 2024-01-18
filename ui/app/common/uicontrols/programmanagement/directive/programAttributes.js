'use strict';

angular.module('bahmni.common.uicontrols.programmanagment')
    .controller('ProgramAttributesController', ['$scope', function ($scope) {
        var program = $scope.patientProgram.program;
        $scope.getProgramAttributesMap = function () {
            var programAttributesMap = {};
            var programAttributes = $scope.patientProgram.attributes;
            _.forEach($scope.programAttributeTypes, function (programAttributeType) {
                var programAttribute = getProgramAttributeByType(programAttributes, programAttributeType);

                if (programAttribute != undefined && !programAttribute.voided) {
                    programAttributesMap[programAttributeType.name] = programAttribute.value;
                    if (isCodedConceptFormat(programAttributeType.format)) {
                        programAttributesMap[programAttributeType.name] = programAttribute.value && programAttribute.value.uuid;
                    } else if (isDateFormat(programAttributeType.format)) {
                        programAttributesMap[programAttributeType.name] = Bahmni.Common.Util.DateUtil.parseServerDateToDate(programAttributesMap[programAttributeType.name]);
                    } else if (isOpenmrsConceptFormat(programAttributeType.format)) {
                        programAttributesMap[programAttributeType.name] = programAttribute.value && programAttribute.value.uuid;
                    }
                }
            });
            return programAttributesMap;
        };

        $scope.getValueForAttributeType = function (attributeType) {
            var programAttributesMap = $scope.patientProgram.patientProgramAttributes;

            if (isDateFormat(attributeType.format)) {
                return programAttributesMap[attributeType.name] ? Bahmni.Common.Util.DateUtil.formatDateWithoutTime(programAttributesMap[attributeType.name]) : "";
            } else if (isCodedConceptFormat(attributeType.format) || isOpenmrsConceptFormat(attributeType.format)) {
                var mrsAnswer = _.find(attributeType.answers, function (answer) {
                    return answer.conceptId == programAttributesMap[attributeType.name];
                });
                return mrsAnswer ? mrsAnswer.description : "";
            } else {
                return programAttributesMap[attributeType.name];
            }
        };

        $scope.isIncluded = function (attribute) {
            return !(program && _.includes(attribute.excludeFrom, program.name));
        };

        var getProgramAttributeByType = function (programAttributes, attributeType) {
            return _.find(programAttributes, function (programAttribute) {
                return programAttribute.attributeType.uuid == attributeType.uuid;
            });
        };

        var isDateFormat = function (format) {
            return format == "org.openmrs.util.AttributableDate" || format == "org.openmrs.customdatatype.datatype.DateDatatype";
        };

        var isCodedConceptFormat = function (format) {
            return format == "org.bahmni.module.bahmnicore.customdatatype.datatype.CodedConceptDatatype";
        };

        var isOpenmrsConceptFormat = function (format) {
            return format == "org.openmrs.customdatatype.datatype.ConceptDatatype";
        };

        $scope.patientProgram.patientProgramAttributes = $scope.getProgramAttributesMap();
    }])
    .directive('programAttributes', function () {
        return {
            controller: 'ProgramAttributesController',
            templateUrl: "../common/uicontrols/programmanagement/views/programAttributes.html",
            scope: {
                patientProgram: "=",
                programAttributeTypes: "="
            }
        };
    });

