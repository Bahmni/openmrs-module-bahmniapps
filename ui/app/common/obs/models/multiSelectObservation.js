Bahmni.Common.Obs.MultiSelectObservation = (function () {

    var MultiSelectObservation = function (groupMembers, conceptConfig) {
        this.type = "multiSelect";
        this.concept = groupMembers[0].concept;
        this.encounterDateTime = groupMembers[0].encounterDateTime;
        this.groupMembers = groupMembers;
        this.conceptConfig = conceptConfig;
        this.observationDateTime = getLatestObservationDateTime(this.groupMembers);
        this.providers = groupMembers[0].providers;
    };
    var getLatestObservationDateTime = function(groupMembers){
        var latestObservationDateTime = groupMembers[0].observationDateTime;
        groupMembers.forEach(function(member){
            latestObservationDateTime = latestObservationDateTime < member.observationDateTime ? member.observationDateTime : latestObservationDateTime;
        });
        return latestObservationDateTime;
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
