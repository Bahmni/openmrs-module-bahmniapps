'use strict';

Bahmni.Clinical.PatientDashboardSection = function (section) {
    this.title = section.title;
    this.conceptNames = section.conceptNames || [];
    this.numberOfVisits = section.numberOfVisits;
    this.isObservation = section.isObservation || false;
    this.scope = section.scope;
    if (this.isObservation && section.scope == "latest") {
        this.viewName = "views/dashboardSections/latestObservationSection.html";
    } else if (this.isObservation) {
        this.viewName = "views/dashboardSections/observationSection.html";
    }
    else {
        this.viewName = "views/dashboardSections/" + section.name + ".html";
    }
};
