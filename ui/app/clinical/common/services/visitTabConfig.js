'use strict';

angular.module('bahmni.clinical')
    .service('visitTabConfig', ['$q', 'appService', function ($q, appService) {
        var mandatoryConfigPromise = function () {
            return appService.loadMandatoryConfig(Bahmni.Clinical.Constants.mandatoryVisitConfigUrl);
        };

        var configPromise = function () {
            return appService.loadConfig('visit.json');
        };

        this.load = function () {
            return $q.all([mandatoryConfigPromise(), configPromise()]).then(function (results) {
                results[0].data.sections = _.sortBy(results[0].data.sections, function (section) {
                    return section.displayOrder;
                });

                for (var tab in results[1]) {
                    var sortedSections = _.sortBy(results[1][tab].sections, function (section) {
                        return section.displayOrder;
                    });

                    if (sortedSections.length > 0) {
                        results[1][tab].sections = sortedSections;
                    }
                }

                var mandatoryConfig = results[0].data;
                var tabs = _.values(results[1]);
                var firstTabWithDefaultSection = _.find(tabs, function (tab) { return tab.defaultSections; });

                // TODO: Patch for #1461 lokbiradari-config: It's bad. But to err is Human, to forgive is Divine!
                if (_.find(mandatoryConfig.sections, {title: "Treatments"}) && _.find(firstTabWithDefaultSection.sections, {title: "Treatments"})) {
                    mandatoryConfig.sections = _.filter(mandatoryConfig.sections, function (section) {
                        return section.title !== "Treatments";
                    });
                }
                var mandatorySections = _.map(_.values(mandatoryConfig.sections), function (item) {
                    return _.assign(item, _.find(_.values(firstTabWithDefaultSection.sections), ['type', item.type]));
                });
                firstTabWithDefaultSection.sections = _.unionWith(_.values(mandatorySections), _.values(firstTabWithDefaultSection.sections), _.isEqual);

                var tabWithDefaultSectionsExcludes = _.find(tabs, function (tab) { return tab.defaultSectionsExcludes; });
                var excludedDefaultSections = tabWithDefaultSectionsExcludes ? tabWithDefaultSectionsExcludes.defaultSectionsExcludes : [];
                firstTabWithDefaultSection.sections = _.filter(firstTabWithDefaultSection.sections, function (section) {
                    return !excludedDefaultSections.includes(section.type);
                });

                firstTabWithDefaultSection.sections = _.sortBy(firstTabWithDefaultSection.sections, function (section) {
                    return section.displayOrder;
                });

                return new Bahmni.Clinical.VisitTabConfig(tabs);
            });
        };
    }]);
