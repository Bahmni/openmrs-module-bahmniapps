'use strict';

Bahmni.Common.DisplayControl.Dashboard = function (config) {

    this._sections = _.sortBy(_.map(config.sections, Bahmni.Common.DisplayControl.Dashboard.Section.create),function(section) { return section.displayOrder; });

    this.getSectionByName = function (name) {
        return _.find(this._sections, function (section) {
            return section.name === name;
        }) || {};
    };

    this.getSections = function (diseaseTemplates) {
        return _.filter(this._sections, function (section) {
            return section.name !== "diseaseTemplate" || _.find(diseaseTemplates, function (diseaseTemplate) {
                return diseaseTemplate.name === section.templateName && diseaseTemplate.obsTemplates.length > 0;
            });
        });
    };
};

Bahmni.Common.DisplayControl.Dashboard.create = function (config) {
    return new Bahmni.Common.DisplayControl.Dashboard(config);
};