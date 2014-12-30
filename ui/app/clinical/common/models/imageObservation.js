Bahmni.Clinical.ImageObservation = (function (observation, concept, provider) {
    this.concept = concept;
    this.imageObservation = observation;
    this.dateTime = observation.observationDateTime;
    this.provider = provider; 
});

Bahmni.Clinical.ImageObservation.prototype = {
};
