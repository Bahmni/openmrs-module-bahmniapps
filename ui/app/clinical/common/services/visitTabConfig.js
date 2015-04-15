'use strict';

angular.module('bahmni.clinical')
    .service('visitTabConfig', ['$q', 'appService', function ($q, appService) {
        var self = this;

        var mandatoryConfigPromise = function() {
            return appService.loadMandatoryConfig(Bahmni.Clinical.Constants.mandatoryVisitConfigUrl);
        };

        var configPromise = function() {
            return appService.loadConfig('visit');
        };

        this.load = function () {
            return $q.all([mandatoryConfigPromise(), configPromise()]).then(function(results) {
                var mandatoryConfig = results[0].data;
                var configTabs = results[1].data;
                var configTabWithDefaultSections = _.find(configTabs, function(tab) {return tab.defaultSections});
                var tabWithMandatorySections = _.merge(configTabWithDefaultSections, mandatoryConfig);

                var configs = _.flatten([tabWithMandatorySections, _.without(configTabs, configTabWithDefaultSections)]);
                return new Bahmni.Clinical.VisitTabConfig(configs);
            });
        }
    }]);