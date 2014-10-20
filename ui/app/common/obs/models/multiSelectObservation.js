Bahmni.Common.Obs.MultiSelectObservation = (function () {

    var MultiSelectObservation = function (memberObs, conceptConfig) {
        this.type = "multiSelect";
        this.concept = memberObs[0].concept;
        this.memberObs = memberObs;
        this.conceptConfig = conceptConfig;
    };

    MultiSelectObservation.prototype = {

    };
    
    return MultiSelectObservation;
    
})();
