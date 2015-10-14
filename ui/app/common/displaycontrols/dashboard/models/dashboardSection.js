'use strict';

Bahmni.Common.DisplayControl.Dashboard.Section = function (section) {
    angular.extend(this, section);
    this.displayOrder = section.displayOrder;
    this.data = section.data || {};
    this.isObservation = section.isObservation || false;
    this.patientAttributes = section.patientAttributes || [];
    var commonDisplayControlNames = ["disposition", "admissionDetails", "patientInformation", "diagnosis", "observationGraph","custom","pacsOrders","bacteriologyResultsControl"];
    if (this.isObservation === true) {
        this.viewName = "../common/displaycontrols/dashboard/views/sections/observationSection.html";
    } else if (commonDisplayControlNames.some(function (name) {
            return name == section.name
	    })) {
               this.viewName = "../common/displaycontrols/dashboard/views/sections/" + this.name + ".html";
    } else {
        this.viewName = "../clinical/dashboard/views/dashboardSections/" + this.name + ".html";
    }
};

Bahmni.Common.DisplayControl.Dashboard.Section.create = function (section) {
    return new Bahmni.Common.DisplayControl.Dashboard.Section(section);
};
