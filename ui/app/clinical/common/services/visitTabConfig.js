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
                var configs = _.flatten(_.map(results, function(result) {return result.data}));
                angular.extend(self, new Bahmni.Clinical.VisitTabConfig(configs));
            });
        }
    }]);