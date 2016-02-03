'use strict';

angular.module('bahmni.common.uicontrols.programmanagment')
    .controller('ProgramAttributesController', ['$scope', function ($scope) {
        $scope.getProgramAttributesMap = function () {
            var programAttributesMap = {};
            var programAttributes = $scope.program.attributes;
            _.forEach($scope.programAttributeTypes, function (programAttributeType) {
                var programAttribute = getProgramAttributeByType(programAttributes, programAttributeType);

                if(programAttribute != undefined && !programAttribute.voided) {
                    programAttributesMap[programAttributeType.name] = programAttribute.value;
                    if(programAttributeType.format === "org.bahmni.module.bahmnicore.customdatatype.datatype.CodedConceptDatatype") {
                        programAttributesMap[programAttributeType.name] = programAttribute.value && programAttribute.value.uuid;
                    }
                    if (isDateFormat(programAttributeType.format)) {
                        programAttributesMap[programAttributeType.name] = Bahmni.Common.Util.DateUtil.parseServerDateToDate(programAttributesMap[programAttributeType.name]);
                    }
                }
            });
            return programAttributesMap;
        };

        $scope.getValueForAttributeType = function(attributeType){
            var programAttributesMap = $scope.program.patientProgramAttributes;

            if(isDateFormat(attributeType.format)){
                return programAttributesMap[attributeType.name] ? Bahmni.Common.Util.DateUtil.formatDateWithoutTime(programAttributesMap[attributeType.name]) : "";
            }
            else if(isCodedConceptFormat(attributeType.format)) {
                var programAttribute = getProgramAttributeByType($scope.program.attributes, attributeType);
                if (programAttribute == undefined)
                    return "";
                var mrsAnswer = programAttribute.value;
                var displayName = mrsAnswer.display;
                if (mrsAnswer.names && mrsAnswer.names.length == 2) {
                    if (mrsAnswer.name.conceptNameType == 'FULLY_SPECIFIED') {
                        if (mrsAnswer.names[0].display == displayName)
                            displayName = mrsAnswer.names[1].display;
                        else
                            displayName = mrsAnswer.names[0].display;
                    }
                }
                return displayName;
            }
            else
              return programAttributesMap[attributeType.name];

        };

        var getProgramAttributeByType = function(programAttributes, attributeType) {
            return _.find(programAttributes, function (programAttribute) {
                return programAttribute.attributeType.uuid == attributeType.uuid;
            });
        };

        var isDateFormat = function(format){
            return format == "org.openmrs.util.AttributableDate" || format == "org.openmrs.customdatatype.datatype.DateDatatype";
        };

        var isCodedConceptFormat = function(format){
            return format == "org.bahmni.module.bahmnicore.customdatatype.datatype.CodedConceptDatatype";
        };

        $scope.program.patientProgramAttributes = $scope.getProgramAttributesMap();
    }])
    .directive('programAttributes', function(){
        return {
            controller: 'ProgramAttributesController',
            templateUrl: "../common/uicontrols/programmanagement/views/programAttributes.html",
            scope:{
                program: "=",
                programAttributeTypes: "="
            }
        }

    });

