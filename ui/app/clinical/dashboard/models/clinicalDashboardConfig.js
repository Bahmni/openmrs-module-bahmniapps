'use strict';

Bahmni.Clinical.ClinicalDashboardConfig = function (config) {

    var self = this;

    var tabConfig = new Bahmni.Clinical.TabConfig(config);
    if(!tabConfig.identifierKey){
        tabConfig.identifierKey= "dashboardName"
    }
    angular.extend(self, tabConfig);

    this.getDiseaseTemplateSections = function () {
        return _.filter(_.values(this.currentTab.sections), function (section) {
            return section.type === "diseaseTemplate";
        });
    };

    this.getMaxRecentlyViewedPatients = function(){
        return self.currentTab.maxRecentlyViewedPatients || 10;
    }
};