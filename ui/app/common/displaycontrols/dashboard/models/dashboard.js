'use strict';

Bahmni.Common.DisplayControl.Dashboard = function (config) {

    if(config.startDate || config.endDate){
        _.each(config.sections, function(section){
            section.startDate = config.startDate;
            section.endDate = config.endDate;
        });
    }

    this._sections = _.sortBy(_.map(config.sections, Bahmni.Common.DisplayControl.Dashboard.Section.create),function(section) { return section.displayOrder; });

    this.getSectionByName = function (name) {
        return _.find(this._sections, function (section) {
            return section.name === name;
        }) || {};
    };

    this.getSections = function (diseaseTemplates) {
        var sections = _.filter(this._sections, function (section) {
            return section.name !== "diseaseTemplate" || _.find(diseaseTemplates, function (diseaseTemplate) {
                return diseaseTemplate.name === section.templateName && diseaseTemplate.obsTemplates.length > 0;
            });
        });
        return this.groupSectionsByType(sections);
    };

    this.groupSectionsByType = function(sections) {
        var sectionGroups = [[]];
        for(var sectionId in sections) {
            var section = sections[sectionId];
            var lastElement = sectionGroups.length-1;
            if(this.isFullPageSection(section)) {
                if(_.isEmpty(sectionGroups[lastElement])) {
                    sectionGroups.pop();
                }
                sectionGroups.push([section]);
                sectionGroups.push([]);
            } else {
                sectionGroups[lastElement].push(section);
            }
        }
        return sectionGroups;
    };

    this.isFullPageSection = function(section) {
        return section['displayType'] && section['displayType'] === 'Full-Page';
    };

};

Bahmni.Common.DisplayControl.Dashboard.create = function (config) {
    return new Bahmni.Common.DisplayControl.Dashboard(config);
};