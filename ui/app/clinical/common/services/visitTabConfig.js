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
                var mandatoryConfig = results[0].data;
                var tabs = results[1].data;
                var firstTabWithDefaultSection = _.find(tabs, function(tab) {return tab.defaultSections});
                firstTabWithDefaultSection.sections = _.union(mandatoryConfig.sections, firstTabWithDefaultSection.sections);
                return new Bahmni.Clinical.VisitTabConfig(tabs);
            });
        }
    }]);