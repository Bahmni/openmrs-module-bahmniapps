'use strict';

angular.module('bahmni.clinical')
    .service('visitTabConfig', ['$q', 'appService', function ($q, appService) {
        var self = this;

        var mandatoryConfigPromise = function() {
            return appService.loadMandatoryConfig(Bahmni.Clinical.Constants.mandatoryVisitConfigUrl);
        };

        var configPromise = function() {
            return appService.loadConfig('visit.json');
        };

        this.load = function () {
            return $q.all([mandatoryConfigPromise(), configPromise()]).then(function(results) {
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
                var firstTabWithDefaultSection = _.find(tabs, function(tab) {return tab.defaultSections});
                firstTabWithDefaultSection.sections = _.union(_.values(mandatoryConfig.sections), _.values(firstTabWithDefaultSection.sections));
                firstTabWithDefaultSection.sections = _.sortBy( firstTabWithDefaultSection.sections, function(section) {
                    return section.displayOrder;
                });
                return new Bahmni.Clinical.VisitTabConfig(tabs);
            });
        }
    }]);