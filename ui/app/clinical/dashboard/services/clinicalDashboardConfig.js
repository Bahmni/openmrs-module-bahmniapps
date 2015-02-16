'use strict';

angular.module('bahmni.clinical')
    .service('clinicalDashboardConfig', ['appService', function (appService) {
        var self = this;

        this.load = function() {
            return appService.loadConfig('dashboard').then(function (response) {
                angular.extend(self, new Bahmni.Clinical.ClinicalDashboardConfig(response.data));
            });
        }

    }]);