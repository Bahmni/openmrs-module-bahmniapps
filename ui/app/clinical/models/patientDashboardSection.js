'use strict';

Bahmni.Clinical.PatientDashboardSection = function(section) {
    this.viewName = "views/dashboardSections/" + section.name + ".html";
    this.title = section.title;
    this.conceptNames = section.conceptNames || [];
    this.numberOfVisits = section.numberOfVisits || 1;
};
