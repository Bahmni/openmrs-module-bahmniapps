'use strict';

Bahmni.Common.Obs.ImageObservation = function (observation, concept, provider) {
    this.concept = concept;
    this.imageObservation = observation;
    this.dateTime = observation.observationDateTime;
    this.provider = provider;
};
