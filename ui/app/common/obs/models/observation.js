Bahmni.Common.Obs.Observation = function () {

    var Observation = function (obs, conceptConfig) {
        angular.extend(this, obs);
        this.concept = obs.concept;
        this.conceptConfig = conceptConfig;
    };

    Observation.prototype = {

        isFormElement: function () {
            return this.groupMembers && this.groupMembers.length <= 0;
        },

        isImageConcept: function () {
            return this.concept.conceptClass === "Image";
        },

        getDisplayValue: function () {
            var displayValue = "";
            var allValues = [];
            if (this.type === "Boolean") {
                return this.value === true ? "Yes" : "No";
            }
            if(this.type === "Datetime") {
                var date = Bahmni.Common.Util.DateUtil.parseDatetime(this.value);
                return date != null ? date.format('DD MMM YYYY, hh:mm A') : "";
            }
            displayValue = this.value.shortName || this.value.name || this.value;
            if (this.duration) {
                displayValue = displayValue + " " + this.getDurationDisplayValue();
            }
            return displayValue;
        },

        getDurationDisplayValue: function () {
            var durationForDisplay = Bahmni.Common.Util.DateUtil.convertToUnits(this.duration);
            return "since " + durationForDisplay["value"] + " " + durationForDisplay["unitName"];
        }};



    return Observation;
    
}();

