'use strict';

angular.module('bahmni.clinical')
    .service('clinicalDashboardConfig', ['appService', function (appService) {
        var self = this;

        var customIPD = {
            displayByDefault: false,
            sections: {},
            maxRecentlyViewedPatients: 10,
            translationKey: "DASHBOARD_TAB_IPD_KEY"
        };
        this.load = function () {
            return appService.loadConfig('dashboard.json').then(function (response) {
                var hacked = Object.assign({}, response, {IPD: customIPD});
                angular.extend(self, new Bahmni.Clinical.ClinicalDashboardConfig(_.values(hacked)));
            });
        };
    }]);
