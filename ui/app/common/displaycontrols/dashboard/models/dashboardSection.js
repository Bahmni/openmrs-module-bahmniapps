'use strict';

(function () {
    var OBSERVATION_SECTION_URL = "../common/displaycontrols/dashboard/views/sections/observationSection.html";
    var COMMON_DISPLAY_CONTROL_URL = "../common/displaycontrols/dashboard/views/sections/SECTION_NAME.html";
    var CLINICAL_DISPLAY_CONTROL_URL = "../clinical/dashboard/views/dashboardSections/SECTION_NAME.html";
    var commonDisplayControlNames = [
        "admissionDetails",
        "bacteriologyResultsControl",
        "chronicTreatmentChart",
        "custom",
        "diagnosis",
        "disposition",
        "drugOrderDetails",
        "forms",
        "observationGraph",
        "obsToObsFlowSheet",
        "pacsOrders",
        "patientInformation"
    ];

    var getViewUrl = function (section) {
        if (section.isObservation) {
            return OBSERVATION_SECTION_URL;
        }
        var isCommonDisplayControl = _.includes(commonDisplayControlNames, section.type);
        if (isCommonDisplayControl) {
            return COMMON_DISPLAY_CONTROL_URL.replace('SECTION_NAME', section.type);
        }
        return CLINICAL_DISPLAY_CONTROL_URL.replace('SECTION_NAME', section.type);
    };

    Bahmni.Common.DisplayControl.Dashboard.Section = function (section) {
        angular.extend(this, section);
        this.displayOrder = section.displayOrder;
        this.data = section.data || {};
        this.isObservation = !!section.isObservation;
        this.patientAttributes = section.patientAttributes || [];
        this.viewName = getViewUrl(this);
    };

    Bahmni.Common.DisplayControl.Dashboard.Section.create = function (section) {
        return new Bahmni.Common.DisplayControl.Dashboard.Section(section);
    };

})();
