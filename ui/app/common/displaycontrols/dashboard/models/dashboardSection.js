'use strict';

(function () {
    var OBSERVATION_SECTION_URL = "../common/displaycontrols/dashboard/views/sections/observationSection.html";
    var COMMON_DISPLAY_CONTROL_URL = "../common/displaycontrols/dashboard/views/sections/SECTION_NAME.html";
    var CLINICAL_DISPLAY_CONTROL_URL = "../clinical/dashboard/views/dashboardSections/SECTION_NAME.html";
    var DISPLAY_CONTROL_REACT_URL = "../common/displaycontrols/dashboard/views/sections/nextUISection.html";
    var commonDisplayControlNames = [
        "admissionDetails",
        "bacteriologyResultsControl",
        "chronicTreatmentChart",
        "custom",
        "diagnosis",
        "disposition",
        "drugOrderDetails",
        "forms",
        "formsV2",
        "observationGraph",
        "obsToObsFlowSheet",
        "pacsOrders",
        "patientInformation",
        "conditionsList"
    ];
    var reactDisplayControls = [
        "allergies",
        "formsV2React"
    ];

    var getViewUrl = function (section) {
        if (reactDisplayControls.includes(section.type)) {
            return DISPLAY_CONTROL_REACT_URL;
        }
        if (section.isObservation) {
            return OBSERVATION_SECTION_URL;
        }
        var isCommonDisplayControl = _.includes(commonDisplayControlNames, section.type);
        if (isCommonDisplayControl) {
            return COMMON_DISPLAY_CONTROL_URL.replace('SECTION_NAME', section.type);
        }
        return CLINICAL_DISPLAY_CONTROL_URL.replace('SECTION_NAME', section.type);
    };

    var getId = function (section, $filter) {
        if (section.type !== "custom") {
            var key = section.translationKey || section.title;
            return !_.isUndefined($filter) && key ? $filter('titleTranslate')(key).toValidId() : key;
        }
    };

    Bahmni.Common.DisplayControl.Dashboard.Section = function (section, $filter) {
        angular.extend(this, section);
        this.displayOrder = section.displayOrder;
        this.data = section.data || {};
        this.isObservation = !!section.isObservation;
        this.patientAttributes = section.patientAttributes || [];
        this.viewName = getViewUrl(this);
        this.hideEmptyDisplayControl = section.hideEmptyDisplayControl != undefined ? section.hideEmptyDisplayControl : false;
        this.isDataAvailable = true;

        this.id = getId(this, $filter);
    };

    Bahmni.Common.DisplayControl.Dashboard.Section.create = function (section, $filter) {
        return new Bahmni.Common.DisplayControl.Dashboard.Section(section, $filter);
    };
})();
