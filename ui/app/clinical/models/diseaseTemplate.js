Bahmni.Clinical.DiseaseTemplate = function (serverDiseaseTemplate){
    var diseaseTemplate  = {
        name : serverDiseaseTemplate.name,
        sections: []
    };

    var getPropertyIfExists = function(propertyName,obj){
        return obj && obj[propertyName]? obj[propertyName]: null;
    };
    diseaseTemplate.sections = serverDiseaseTemplate.observations.map(function(obsSection){
        if(obsSection.length === 0) return;
        return {
            name: getPropertyIfExists("rootConcept", obsSection[0]),
            visitStartDate: getPropertyIfExists("visitStartDate", obsSection[0]),
            observations: obsSection
        };
    });

    return diseaseTemplate;
};

