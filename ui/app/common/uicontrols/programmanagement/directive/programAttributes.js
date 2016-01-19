'use strict';

angular.module('bahmni.common.uicontrols.programmanagment')
    .controller('ProgramAttributesController', ['$scope', '$filter', function ($scope, $filter) {
        $scope.getProgramAttributesMap = function () {
            var programAttributesMap = {};
            var programAttributes = $scope.program.attributes;
            _.forEach($scope.programAttributeTypes, function (programAttributeType) {
               var programAttribute = _.find(programAttributes,function(programAttribute){
                    return programAttribute.attributeType.uuid == programAttributeType.uuid;
                });

                if(programAttribute != undefined && !programAttribute.voided) {
                    programAttributesMap[programAttributeType.name] = programAttribute.value;
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
            else
              return programAttributesMap[attributeType.name];

        };

        var isDateFormat = function(format){
            return format == "org.openmrs.util.AttributableDate" || format == "org.openmrs.customdatatype.datatype.DateDatatype"
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

