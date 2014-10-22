Bahmni.Clinical.DiseaseTemplateSectionHelper = {
    populateDiseaseTemplateSections: function (patientDashboardSections, diseaseTemplates) {
        diseaseTemplates.forEach(function (diseaseTemplate) {
            if (diseaseTemplate.notEmpty()) {
                patientDashboardSections.push(Bahmni.Clinical.PatientDashboardSection.create({
                    data: {diseaseTemplateName: diseaseTemplate.name},
                    title: diseaseTemplate.label,
                    name: 'diseaseTemplateSection'
                }));
            }
        });
    }
};