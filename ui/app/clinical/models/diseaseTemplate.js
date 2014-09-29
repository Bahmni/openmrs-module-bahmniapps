Bahmni.Clinical.DiseaseTemplate = function (serverDiseaseTemplate){
    var diseaseTemplate  = {
        name : serverDiseaseTemplate.name,
        sections: []
    };

    var getPropertyIfExists = function(propertyName,obj){
        return obj && obj[propertyName]? obj[propertyName]: null;
    };
    serverDiseaseTemplate.observations.forEach(function(obsSection){
        if(obsSection.length > 0){
            diseaseTemplate.sections.push({
                name: getPropertyIfExists("rootConcept", obsSection[0]),
                visitStartDate: getPropertyIfExists("visitStartDate", obsSection[0]),
                observations: obsSection
            })
        }
    });

    diseaseTemplate.toDashboardSection = function(){
        return {
            title:diseaseTemplate.name,
            name:'diseaseTemplate'
        }
    };

    return diseaseTemplate;
};

