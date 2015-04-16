'use strict';

Bahmni.Clinical.VisitTabConfig = function (tabs) {

    angular.extend(this, new Bahmni.Clinical.TabConfig(tabs, "title"));

    this.setVisitUuidsAndPatientUuidToTheSections = function (visitUuids, patientUuid) {
        _.each(this.tabs, function (tab) {
            _.each(tab.sections, function(section){
                section.config.visitUuids = visitUuids;
                section.config.patientUuid = patientUuid;
            });
        });
    };

};