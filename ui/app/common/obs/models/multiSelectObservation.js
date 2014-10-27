Bahmni.Common.Obs.MultiSelectObservation = (function () {

    var MultiSelectObservation = function (groupMembers, conceptConfig) {
        this.type = "multiSelect";
        this.concept = groupMembers[0].concept;
        this.groupMembers = groupMembers;
        this.conceptConfig = conceptConfig;
    };

    MultiSelectObservation.prototype = {

        isFormElement: function () {
            return true;
        },

        getDisplayValue: function () {
            var allValues = [];
            this.groupMembers.forEach(function (member) {
                allValues.push(member.value.shortName || member.value.name || member.value);
            });
            return allValues.join(", ");
        }

    };

    return MultiSelectObservation;

})();
