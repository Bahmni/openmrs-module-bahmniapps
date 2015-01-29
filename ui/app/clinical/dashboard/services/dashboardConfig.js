'use strict';

angular.module('bahmni.clinical')
    .service('dashboardConfig', ['appService', function (appService) {
        var self = this;

        this.load = function() {
            return appService.loadConfig('dashboard').then(function (response) {
                angular.extend(self, new Bahmni.Clinical.DashboardConfig(response.data));
            });
        }

    }]);