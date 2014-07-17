'use strict';

Bahmni.Clinical.PatientDashboardSection = function(section) {
    this.title = section.title;
    this.conceptNames = section.conceptNames || [];
    this.numberOfVisits = section.numberOfVisits || 1;
    this.isObservation = section.isObservation || false;
    if(this.isObservation){
        this.viewName = "views/dashboardSections/" + "observationSection" + ".html";
    }
    else {
        this.viewName = "views/dashboardSections/" + section.name + ".html";
    }
};
