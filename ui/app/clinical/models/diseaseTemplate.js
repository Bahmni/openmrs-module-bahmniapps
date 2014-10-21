Bahmni.Clinical.DiseaseTemplate = function (name, obsTemplates) {

    var diseaseTemplate = {
        name: name,
        obsTemplates: obsTemplates || []
    };

    diseaseTemplate.notEmpty = function () {
        return diseaseTemplate.obsTemplates && diseaseTemplate.obsTemplates.length > 0;
    };

    return diseaseTemplate;
};
