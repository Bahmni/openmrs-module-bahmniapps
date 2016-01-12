'use strict';

angular.module('bahmni.common.uicontrols.programmanagment')
    .service('programHelper', ['appService',function (appService) {

    var self = this;
    var programConfiguration = appService.getAppDescriptor().getConfig("program").value;

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
        attribute.value = isNaN(Date.parse(attribute.value) )? attribute.value :  Bahmni.Common.Util.DateUtil.formatDateWithoutTime(attribute.value);
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

