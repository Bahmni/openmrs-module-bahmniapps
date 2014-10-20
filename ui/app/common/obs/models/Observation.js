Bahmni.Common.Obs.Observation = function (obs, conceptConfig) {
    angular.extend(this, obs);
    this.concept = obs.concept;
    this.conceptConfig = conceptConfig;
};
