'use strict';

Bahmni.Common.Obs.Observation = (function () {
    var Observation = function (obs, conceptConfig, $translate) {
        angular.extend(this, obs);
        this.concept = obs.concept;
        this.conceptConfig = conceptConfig;
        // translate should be passed for chief complaint data check
        this.translate = $translate;
    };

    Observation.prototype = {

        isFormElement: function () {
            return this.groupMembers && this.groupMembers.length <= 0;
        },

        isImageConcept: function () {
            return this.concept.conceptClass === "Image";
        },
        isVideoConcept: function () {
            return this.concept.conceptClass === "Video";
        },

        hasPDFAsValue: function () {
            return (this.value.indexOf(".pdf") > 0);
        },

        isComplexConcept: function () {
            return this.concept.dataType === "Complex";
        },

        getComplexDataType: function () {
            return this.complexData ? this.complexData.dataType : null;
        },

        isLocationRef: function () {
            return this.isComplexConcept() && this.getComplexDataType() === "Location";
        },

        isProviderRef: function () {
            return this.isComplexConcept() && this.getComplexDataType() === "Provider";
        },

        isConceptClassConceptDetails: function () {
            return this.concept.conceptClass === "Concept Details";
        },
        getNewFormatFileNameSeparator: function () {
            // we are using this to separate random characters (patientID, uuid) and actual file name when saving the files in the new format
            return '__';
        },
        isFileNameOfNewFormat: function () {
            return this.getDisplayValue().lastIndexOf(this.getNewFormatFileNameSeparator()) > -1;
        },
        getDisplayFileName: function () {
            var displayValue = this.getDisplayValue();
            return this.isFileNameOfNewFormat() ? displayValue.substring(displayValue.lastIndexOf(this.getNewFormatFileNameSeparator()) + this.getNewFormatFileNameSeparator().length) : displayValue;
        },
        getChiefComplaintCodedComment: function () {
            if (this.isConceptNameChiefComplaintData()) {
                return this.groupMembers[0].comment;
            }
            return '';
        },
        isConceptNameChiefComplaintData: function () {
            // checks if the concept name  is Chief complaint data conceptset and it is part of form
            return this.groupMembers.length > 1 && this.formNamespace != null && this.translate && this.concept.name === this.translate.instant("CHIEF_COMPLAINT_DATA_CONCEPT_NAME_KEY");
        },
        getDisplayValue: function () {
            var value;
            if (this.type === "Boolean" || this.concept && this.concept.dataType === "Boolean") {
                return this.value === true ? "OBS_BOOLEAN_YES_KEY" : "OBS_BOOLEAN_NO_KEY";
            }
            if (this.type === "Datetime" || this.concept && this.concept.dataType === "Datetime") {
                var date = Bahmni.Common.Util.DateUtil.parseDatetime(this.value);
                return date != null ? Bahmni.Common.Util.DateUtil.formatDateWithTime(date) : "";
            }
            if (this.conceptConfig && this.conceptConfig.displayMonthAndYear) {
                value = Bahmni.Common.Util.DateUtil.getDateInMonthsAndYears(this.value);
                if (value != null) {
                    return value;
                }
            }
            if (this.type === "Date" || this.concept && this.concept.dataType === "Date") {
                return this.value ? Bahmni.Common.Util.DateUtil.formatDateWithoutTime(this.value) : "";
            }

            if (this.isLocationRef()) {
                return this.complexData.display;
            }

            if (this.isProviderRef()) {
                return this.complexData.display;
            }

            if (this.isConceptNameChiefComplaintData()) {
                if (this.groupMembers[0].value.name !== this.translate.instant("CHIEF_COMPLAINT_DATA_OTHER_CONCEPT_KEY")) {
                    return this.translate.instant("CHIEF_COMPLAINT_DATA_WITHOUT_OTHER_CONCEPT_TEMPLATE_KEY", {chiefComplaint: this.groupMembers[0].value.name, duration: this.groupMembers[1].value, unit: this.groupMembers[2].value.name});
                } else {
                    return this.translate.instant("CHIEF_COMPLAINT_DATA_OTHER_CONCEPT_TEMPLATE_KEY", {chiefComplaint: this.groupMembers[0].value.name, chiefComplaintText: this.groupMembers[1].value, duration: this.groupMembers[2].value, unit: this.groupMembers[3].value.name});
                }
            }

            value = this.value;
            var displayValue = value && (value.shortName || (value.name && (value.name.name || value.name)) || value);
            if (this.duration) {
                displayValue = displayValue + " " + this.getDurationDisplayValue();
            }
            return displayValue;
        },

        getDurationDisplayValue: function () {
            var durationForDisplay = Bahmni.Common.Util.DateUtil.convertToUnits(this.duration);
            return "since " + durationForDisplay["value"] + " " + durationForDisplay["unitName"];
        }
    };

    return Observation;
})();

