'use strict';

Bahmni.Clinical.SpecimenMapper = function () {
    this.mapObservationToSpecimen = function (observation, allSamples, conceptsConfig, dontSortByObsDateTime) {
        var specimen = new Bahmni.Clinical.Specimen(observation, allSamples);
        specimen.specimenId = specimen.identifier;
        specimen.specimenSource = specimen.type.shortName ? specimen.type.shortName : specimen.type.name;
        specimen.specimenCollectionDate = specimen.dateCollected;

        if (specimen.report && specimen.report.results) {
            specimen.report.results = (specimen.report.results) instanceof Array ? specimen.report.results : [specimen.report.results];

            var obs = new Bahmni.Common.Obs.ObservationMapper().map(specimen.report.results, conceptsConfig, dontSortByObsDateTime);
            specimen.sampleResult = obs && obs.length > 0 ? obs[0] : obs;
        }
        if (specimen.sample && specimen.sample.additionalAttributes) {
            specimen.sample.additionalAttributes = (specimen.sample.additionalAttributes) instanceof Array ? specimen.sample.additionalAttributes : [specimen.sample.additionalAttributes];
        }
        return specimen;
    };

    this.mapSpecimenToObservation = function (specimen) {
        var observation = {};
        observation.dateCollected = moment(specimen.dateCollected).format("YYYY-MM-DD");
        observation.existingObs = specimen.existingObs;
        observation.identifier = specimen.identifier;
        observation.sample = {};
        observation.report = {};
        observation.type = specimen.type;
        observation.voided = specimen.voided;
        observation.typeFreeText = specimen.typeFreeText;
        observation.uuid = specimen.uuid;

        var observationFilter = new Bahmni.Common.Domain.ObservationFilter();
        // eslint-disable-next-line angular/typecheck-array
        observation.sample.additionalAttributes = Array.isArray(specimen.sample.additionalAttributes) ? specimen.sample.additionalAttributes : [specimen.sample.additionalAttributes];
        observation.sample.additionalAttributes = observationFilter.filter(specimen.sample.additionalAttributes)[0];
        // eslint-disable-next-line angular/typecheck-array
        observation.report.results = Array.isArray(specimen.report.results) ? specimen.report.results : [specimen.report.results];
        observation.report.results = observationFilter.filter(specimen.report.results)[0];
        return observation;
    };
};
