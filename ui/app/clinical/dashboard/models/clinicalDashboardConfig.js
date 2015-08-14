'use strict';

Bahmni.Clinical.ClinicalDashboardConfig = function (config) {

    var self = this;

    angular.extend(self, new Bahmni.Clinical.TabConfig(config, "dashboardName"));

    this.getDiseaseTemplateSections = function () {
        return _.rest(_.values(this.currentTab.sections), function (section) {
            return section.name !== "diseaseTemplate";
        });
    };

    this.getMaxRecentlyViewedPatients = function(){
        return self.currentTab.maxRecentlyViewedPatients || 10;
    }
};