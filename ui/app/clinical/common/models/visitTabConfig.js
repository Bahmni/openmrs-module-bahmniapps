'use strict';

Bahmni.Clinical.VisitTabConfig = function (tabs) {
    var tabConfig = new Bahmni.Clinical.TabConfig(tabs);
    if (!tabConfig.identifierKey) {
        tabConfig.identifierKey = "title";
    }
    angular.extend(this, tabConfig);

    this.setVisitUuidsAndPatientUuidToTheSections = function (visitUuids, patientUuid) {
        _.each(this.tabs, function (tab) {
            _.each(tab.sections, function (section) {
                section.config.visitUuids = visitUuids;
                section.config.patientUuid = patientUuid;
            });
        });
    };
};
