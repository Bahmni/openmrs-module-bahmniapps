Bahmni.Clinical.DashboardObservation = (function () {

    var DashboardObservation = function (bahmniObservation) {
        angular.extend(this, bahmniObservation);
    };

    DashboardObservation.prototype = {

        getDisplayValue: function () {
            if (this.type === "Boolean") {
                return this.value === true ? "Yes" : "No";
            }
            var displayValue = this.value.shortName || this.value.name || this.value;
            if (this.duration) {
                displayValue = displayValue + " " + this.getDurationDisplayValue();
            }
            return displayValue;
        },

        getDurationDisplayValue: function () {
            var durationForDisplay = Bahmni.Common.Util.DateUtil.convertToUnits(this.duration);
            if (durationForDisplay["value"] && durationForDisplay["unitName"]) {
                return "since " + durationForDisplay["value"] + " " + durationForDisplay["unitName"];
            }
            return "";
        }

    };

    return DashboardObservation;
})();
