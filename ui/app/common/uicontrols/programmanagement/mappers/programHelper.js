'use strict';

angular.module('bahmni.common.uicontrols.programmanagment')
    .service('programHelper', ['appService',function (appService) {

    var self = this;
    var programConfiguration = appService.getAppDescriptor().getConfig("program") && appService.getAppDescriptor().getConfig("program").value;

    var isAttributeRequired = function(attribute){
        var attributeName = attribute.attributeType.display;
        return programConfiguration && programConfiguration[attributeName] && programConfiguration[attributeName].required;
    };

    this.filterRetiredPrograms = function (programs) {
        return _.filter(programs, function (program) {
            return !program.retired;
        });
    };

    this.filterRetiredWorkflowsAndStates = function (workflows) {
        var allWorkflows = _.filter(workflows, function (workflow) {
            return !workflow.retired;
        });
        _.forEach(allWorkflows, function (workflow) {
            workflow.states = _.filter(workflow.states, function (state) {
                return !state.retired
            })
        });
        return allWorkflows;
    };

    this.filterRetiredOutcomes = function (outcomes) {
        return _.filter(outcomes, function (outcome) {
            return !outcome.retired;
        })
    };

    var mapAttributes = function(attribute){
        attribute.name = attribute.attributeType.description ? attribute.attributeType.description : attribute.name;
        attribute.value = attribute.value;
        attribute.required = isAttributeRequired(attribute);

    };
    var mapPrograms = function(program){
        program.dateEnrolled = Bahmni.Common.Util.DateUtil.parseServerDateToDate(program.dateEnrolled);
        program.dateCompleted = Bahmni.Common.Util.DateUtil.parseServerDateToDate(program.dateCompleted);
        program.program.allWorkflows = self.filterRetiredWorkflowsAndStates(program.program.allWorkflows);
        _.forEach(program.attributes,function(attribute){
            mapAttributes(attribute);
        });
    };

    this.filterProgramAttributes = function (patientPrograms, programAttributeTypes) {
        var programDisplayControlConfig = appService.getAppDescriptor().getConfigValue('programDisplayControl');
        var config = programDisplayControlConfig ? programDisplayControlConfig['programAttributes'] : [];
        var configAttrList = programAttributeTypes.filter(function (each) {
            return config && config.indexOf(each.name) !== -1;
        });

        if (config && config.length === 0 && programDisplayControlConfig) {
            return patientPrograms.map(function (patientProgram) {
                patientProgram.attributes = [];
                return patientProgram;
            });
        }

        if (programDisplayControlConfig && configAttrList.length) {
            patientPrograms.forEach(function (program) {
                var attrsToBeDisplayed = [];

                configAttrList.forEach(function (configAttr) {
                    var attr = _.find(program.attributes, function (progAttr) {
                        return progAttr.attributeType.display === configAttr.name;
                    });

                    attr = attr ? attr : {
                        attributeType: {
                            display: configAttr.name,
                            description : configAttr.description
                        },
                        value: ""
                    };

                    attrsToBeDisplayed.push(attr);
                });

                program.attributes = attrsToBeDisplayed;
            });
        }
        return patientPrograms;
    };

    this.groupPrograms = function(patientPrograms) {
        var activePrograms = [];
        var endedPrograms = [];
        var groupedPrograms = {};
        if (patientPrograms) {
            var filteredPrograms = this.filterRetiredPrograms(patientPrograms);
            _.forEach(filteredPrograms, function (program) {
                mapPrograms(program);
                if (program.dateCompleted) {
                    endedPrograms.push(program);
                } else {
                    activePrograms.push(program);
                }
            });
            groupedPrograms.activePrograms =  _.sortBy(activePrograms, function(program){ return moment(program.dateEnrolled).toDate() }).reverse();
            groupedPrograms.endedPrograms = _.sortBy(endedPrograms, function(program){ return moment(program.dateCompleted).toDate() }).reverse();
        }
        return groupedPrograms;
    };
}]);

