Bahmni.Clinical.DashboardObservation = (function () {

    var DashboardObservation = function (bahmniObservation) {
        angular.extend(this, bahmniObservation);
        this.groupMembers = _.map(bahmniObservation.groupMembers, function (member) {
            return new Bahmni.Clinical.DashboardObservation(member);
        });
    };

    DashboardObservation.prototype = {
        getDisplayValue: function () {
            var displayValue = "";
            if (this.type === "Boolean") {
                return this.value === true ? "Yes" : "No";
            } else if (this.type === "multiSelect") {
                var allValues = [];
                this.memberObs.forEach(function (member) {
                    allValues.push(member.value.shortName || member.value.name || member.value);
                });
                displayValue = allValues.join();
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
