'use strict';

Bahmni.Common.DisplayControl.Dashboard = function (config, $filter) {
    if (config.startDate || config.endDate) {
        _.each(config.sections, function (section) {
            section.startDate = config.startDate;
            section.endDate = config.endDate;
        });
    }

    var _sections = _.sortBy(_.map(config.sections, function (section) { return Bahmni.Common.DisplayControl.Dashboard.Section.create(section, $filter); }), function (section) {
        return section.displayOrder;
    });

    this.getSectionByType = function (name) {
        return _.find(_sections, function (section) {
            return section.type === name;
        }) || {};
    };

    this.getSections = function (diseaseTemplates) {
        var sections = _.filter(_sections, function (section) {
            return section.type !== "diseaseTemplate" || _.find(diseaseTemplates, function (diseaseTemplate) {
                return diseaseTemplate.name === section.templateName && diseaseTemplate.obsTemplates.length > 0;
            });
        });
        return this.groupSectionsByType(sections);
    };

    this.groupSectionsByType = function (sections) {
        var sectionGroups = [[]];
        for (var sectionId in sections) {
            var section = sections[sectionId];
            var nextSection = (sectionId < sections.length) ? sections[++sectionId] : null;
            var lastElement = sectionGroups.length - 1;
            if (this.isFullPageSection(section)) {
                if (_.isEmpty(sectionGroups[lastElement])) {
                    sectionGroups.pop();
                }
                sectionGroups.push([section]);
                sectionGroups.push([]);
            } else {
                sectionGroups = this.groupSectionsIfNotFullPage(section, sectionGroups, lastElement, nextSection);
            }
        }
        return sectionGroups;
    };

    this.isFullPageSection = function (section) {
        return this.checkDisplayType(section, "Full-Page");
    };
    this.isThreeFourthPageSection = function (section) {
        return this.checkDisplayType(section, "LAYOUT_75_25");
    };
    this.isOneFourthPageSection = function (section) {
        return this.checkDisplayType(section, "LAYOUT_25_75");
    };
    this.isHalfPageSection = function (section) {
        return this.checkDisplayType(section, "Half-Page") || this.isDisplayTypeWrong(section) || !(section['displayType']);
    };
    this.isDisplayTypeWrong = function (section) {
        var allDisplayTypes = ['Full-Page', 'LAYOUT_75_25', 'LAYOUT_25_75', 'Half-Page'];
        return (allDisplayTypes.indexOf(section['displayType']) <= -1);
    };
    this.checkDisplayType = function (section, typeToCheck) {
        return section && section.displayType && section.displayType === typeToCheck;
    };

    this.groupSectionsIfNotFullPage = function (section, sectionGroups, lastElement, nextSection) {
        var lastSection = sectionGroups[lastElement];
        var lastSectionIndex = _.isEmpty(lastSection) ? 0 : lastSection.length - 1;

        if (this.isThreeFourthPageSection(section)) {
            sectionGroups = this.groupThreeFourthPageSection(lastSection, lastElement, lastSectionIndex, section, sectionGroups);
        } else if (this.isOneFourthPageSection(section)) {
            sectionGroups = this.groupOneFourthPageSection(lastSection, lastElement, lastSectionIndex, section, sectionGroups, nextSection);
        } else {
            sectionGroups = this.groupHalfPageSection(lastSection, lastElement, lastSectionIndex, section, sectionGroups);
        }
        return sectionGroups;
    };

    this.groupThreeFourthPageSection = function (lastSection, lastElement, lastSectionIndex, section, sectionGroups) {
        var lastSectionLength = lastSection.length;
        var isLastSectionOneFourth = lastSectionLength == 1 && this.isOneFourthPageSection(lastSection[lastSectionIndex]);

        if (_.isEmpty(lastSection) || isLastSectionOneFourth) {
            sectionGroups[lastElement].push(section);
        } else {
            sectionGroups.push([section]);
        }
        return sectionGroups;
    };

    this.groupOneFourthPageSection = function (lastSection, lastElement, lastSectionIndex, section, sectionGroups, nextSection) {
        if (this.addOneFourthElementToLastSection(lastSection, lastElement, lastSectionIndex, nextSection)) {
            sectionGroups[lastElement].push(section);
        } else {
            sectionGroups.push([section]);
        }
        return sectionGroups;
    };

    this.addOneFourthElementToLastSection = function (lastSection, lastElement, lastSectionIndex, nextSection) {
        var lastSectionLength = lastSection.length;
        var isNextSectionThreeFourth = nextSection ? this.isThreeFourthPageSection(nextSection) : false;
        var isLastSectionNotThreeFourth = !this.isThreeFourthPageSection(lastSection[lastSectionIndex]) && !this.isThreeFourthPageSection(lastSection[0]);
        return lastSection.length <= 1 && (this.isThreeFourthPageSection(lastSection[0]) || !isNextSectionThreeFourth) || lastSectionLength >= 2 && (isLastSectionNotThreeFourth && !isNextSectionThreeFourth);
    };

    this.groupHalfPageSection = function (lastSection, lastElement, lastSectionIndex, section, sectionGroups) {
        var lastSectionLength = lastSection.length;
        var isLastSectionNotThreeFourth = !this.isThreeFourthPageSection(lastSection[lastSectionIndex]) && !this.isThreeFourthPageSection(lastSection[0]);
        if (_.isEmpty(lastSection) || lastSectionLength > 2 || isLastSectionNotThreeFourth) {
            sectionGroups[lastElement].push(section);
        } else {
            sectionGroups.push([section]);
        }
        return sectionGroups;
    };
};

Bahmni.Common.DisplayControl.Dashboard.create = function (config, $filter) {
    return new Bahmni.Common.DisplayControl.Dashboard(config, $filter);
};
