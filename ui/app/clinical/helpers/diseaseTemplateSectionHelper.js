Bahmni.Clinical.DiseaseTemplateSectionHelper = {
    populateDiseaseTemplateSections: function (patientDashboardSections, diseaseTemplates) {
        var templateExists = function (diseaseTemplateName, patientDashboardSections) {
            return _.find(patientDashboardSections, function (section) {
                return section.title === diseaseTemplateName;
            });
        };

        var cleanUpOldTemplates = function () {
            _.remove(patientDashboardSections, function (patientDashboardSection) {
                return _.findIndex(diseaseTemplates, function (diseaseTemplate) {
                    return diseaseTemplate.name === patientDashboardSection.title;
                }) > -1;
            })
        };

        cleanUpOldTemplates();

        diseaseTemplates.forEach(function (diseaseTemplate) {
            if (!templateExists(diseaseTemplate.name, patientDashboardSections) && diseaseTemplate.notEmpty()) {
                patientDashboardSections.push({
                    title: diseaseTemplate.name,
                    name: 'diseaseTemplateSection'
                });
            }
        });
    }
};