Bahmni.Clinical.DashboardObservation = (function () {

    var DashboardObservation = function (bahmniObservation) {
        angular.extend(this, bahmniObservation);
        this.groupMembers = _.map(bahmniObservation.groupMembers, function (member) {
            return new Bahmni.Clinical.DashboardObservation(member);
        });
    };

    DashboardObservation.prototype = {

        isFormElement: function () {
            return this.type == "multiSelect" || this.type === "grid" || (this.groupMembers && this.groupMembers.length <= 0);
        },

        getDisplayValue: function () {
            var displayValue = "";
            var allValues = [];
            if (this.type === "Boolean") {
                return this.value === true ? "Yes" : "No";
            } else if (this.type === "multiSelect") {
                this.groupMembers.forEach(function (member) {
                    allValues.push(member.value.shortName || member.value.name || member.value);
                });
                displayValue = allValues.join(", ");
                return displayValue;
            } else if (this.type === "grid") {
                displayValue = this.value;
                return displayValue;
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
        }

    };
    return DashboardObservation;
})();
