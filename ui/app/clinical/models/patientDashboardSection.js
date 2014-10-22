'use strict';

Bahmni.Clinical.PatientDashboardSection = function (section) {
    this.title = section.title;
    this.data = section.data || {};
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

Bahmni.Clinical.PatientDashboardSection.create = function(section) { return new Bahmni.Clinical.PatientDashboardSection(section); }
