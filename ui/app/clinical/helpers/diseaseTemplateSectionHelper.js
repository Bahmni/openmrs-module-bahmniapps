Bahmni.Clinical.DiseaseTemplateSectionHelper = {
    populateDiseaseTemplateSections: function (patientDashboardSections, diseaseTemplates) {
        var templateExists = function (diseaseTemplateName, patientDashboardSections) {
            return _.find(patientDashboardSections, function (section) {
                return section.data.diseaseTemplateName === diseaseTemplateName;
            });
        };

        var cleanUpOldTemplates = function () {
            _.remove(patientDashboardSections, function (patientDashboardSection) {
                return _.findIndex(diseaseTemplates, function (diseaseTemplate) {
                    return diseaseTemplate.name === patientDashboardSection.data.diseaseTemplateName;
                }) > -1;
            })
        };

        cleanUpOldTemplates();

        diseaseTemplates.forEach(function (diseaseTemplate) {
            if (!templateExists(diseaseTemplate.name, patientDashboardSections) && diseaseTemplate.notEmpty()) {
                patientDashboardSections.push(Bahmni.Clinical.PatientDashboardSection.create({
                    data: {diseaseTemplateName: diseaseTemplate.name},
                    title: diseaseTemplate.label,
                    name: 'diseaseTemplateSection'
                }));
            }
        });
    }
};