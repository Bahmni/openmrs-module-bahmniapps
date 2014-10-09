Bahmni.Clinical.DiseaseTemplate = function (diseaseTemplateResponse) {

    var diseaseTemplate = {
        name: diseaseTemplateResponse.name,
        obsTemplates: []
    };

    var getPropertyIfExists = function (propertyName, obj) {
        return obj && obj[propertyName] ? obj[propertyName] : null;
    };

    diseaseTemplateResponse.observationTemplates.forEach(function (obsTemplate) {
        
        if (obsTemplate.bahmniObservations.length > 0) {
            
            var observations = _.map(obsTemplate.bahmniObservations, function (bahmniObservation) {
                return new Bahmni.Clinical.DashboardObservation(bahmniObservation);
            });
            
            diseaseTemplate.obsTemplates.push({
                name: obsTemplate.concept.name,
                // TODO : Shruthi - implement visitStartDate on the server side
//                visitStartDate: getPropertyIfExists("visitStartDate", obsTemplate[0]),
                observations: observations
            });
        }
    });

    diseaseTemplate.notEmpty = function () {
        return diseaseTemplate.obsTemplates && diseaseTemplate.obsTemplates.length > 0;
    };

    return diseaseTemplate;
};

