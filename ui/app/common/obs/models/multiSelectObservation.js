Bahmni.Common.Obs.MultiSelectObservation = (function () {

    var MultiSelectObservation = function (groupMembers, conceptConfig) {
        this.type = "multiSelect";
        this.concept = groupMembers[0].concept;
        this.groupMembers = groupMembers;
        this.conceptConfig = conceptConfig;
    };

    MultiSelectObservation.prototype = {

    };
    
    return MultiSelectObservation;
    
})();
