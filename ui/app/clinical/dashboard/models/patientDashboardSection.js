'use strict';

Bahmni.Clinical.PatientDashboardSection = function (section) {
    angular.extend(this, section);
    this.data = section.data || {};
    this.conceptNames = section.conceptNames || [];
    this.isObservation = section.isObservation || false;
    this.patientAttributes = section.patientAttributes || [];
    if (this.isObservation && section.scope === "latest") {
        this.viewName = "dashboard/views/dashboardSections/latestObservationSection.html";
    } else if (this.isObservation) {
        this.viewName = "dashboard/views/dashboardSections/observationSection.html";
    }
    else {
        this.viewName = "dashboard/views/dashboardSections/" + section.name + ".html";
    }
};

Bahmni.Clinical.PatientDashboardSection.create = function (section) {
    return new Bahmni.Clinical.PatientDashboardSection(section);
};
