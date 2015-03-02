'use strict';

Bahmni.Common.DisplayControl.Dashboard.Section = function (section) {
    angular.extend(this, section);
    this.data = section.data || {};
    this.isObservation = section.isObservation || false;
    this.patientAttributes = section.patientAttributes || [];
    if (this.isObservation === true) {
        this.viewName = "../common/displaycontrols/dashboard/views/sections/observationSection.html";
    } else if (this.name == "disposition") {
        this.viewName = "../common/displaycontrols/dashboard/views/sections/disposition.html";
    } else if (this.name == "admissionDetails") {
        this.viewName = "../common/displaycontrols/dashboard/views/sections/admissionDetails.html";
    } else if (this.name == "patientInformation") {
        this.viewName = "../common/displaycontrols/dashboard/views/sections/patientInformation.html";
    } else if (this.name == "diagnosis") {
        this.viewName = "../common/displaycontrols/dashboard/views/sections/diagnosis.html";
    }else {
        this.viewName = "../clinical/dashboard/views/dashboardSections/" + section.name + ".html";
    }
};

Bahmni.Common.DisplayControl.Dashboard.Section.create = function (section) {
    return new Bahmni.Common.DisplayControl.Dashboard.Section(section);
};
