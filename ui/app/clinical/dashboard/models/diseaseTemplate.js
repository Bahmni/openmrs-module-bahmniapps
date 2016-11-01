'use strict';

Bahmni.Clinical.DiseaseTemplate = function (concept, obsTemplates) {
    var diseaseTemplate = {
        name: concept.name,
        label: concept.shortName || concept.name,
        obsTemplates: obsTemplates || []
    };

    diseaseTemplate.notEmpty = function () {
        return diseaseTemplate.obsTemplates && diseaseTemplate.obsTemplates.length > 0;
    };

    return diseaseTemplate;
};
