'use strict';

Bahmni.Clinical.ClinicalDashboardConfig = function (config) {

    var self = this;
    this.dashboards = config;
    this.openDashboards = [];

    this._getDefaultDashboard = function () {
        return _.find(this.dashboards, function (dashboard) {
            return dashboard.default;
        });
    };

    this.findOpenDashboard = function (dashboard) {
        return !_.findWhere(this.openDashboards, {'dashboardName': dashboard.dashboardName});
    };

    this.getUnOpenedDashboards = function () {
        return _.filter(this.dashboards, function (dashboard) {
            return self.findOpenDashboard(dashboard);
        })
    };

    this.getCurrentDashboard = function () {
        return this.currentDashboard;
    };

    this.switchDashboard = function (dashboard) {
        this.currentDashboard = dashboard;

        if (this.findOpenDashboard(dashboard)) {
            this.openDashboards.push(dashboard);
        }
    };

    var addDisplayByDefaultDashboards = function(){
        self.openDashboards = self.openDashboards.concat( _.filter(self.dashboards, function (tab) {
            return tab.displayByDefault
        }));
    };

    this.init = function () {
        self.switchDashboard(self._getDefaultDashboard());
        addDisplayByDefaultDashboards();
    }();

    this.getDiseaseTemplateSections = function () {
        return _.rest(this.currentDashboard.sections, function (section) {
            return section.name !== "diseaseTemplate";
        });
    };

    this.closeDashboard = function (dashboard) {
        _.remove(this.openDashboards, {'dashboardName': dashboard.dashboardName});
        this.switchDashboard(this._getDefaultDashboard());
    };

    this.isCurrentDashboard = function (dashboard) {
        return this.currentDashboard && this.currentDashboard.dashboardName === dashboard.dashboardName;
    };

    this.showTabs = function () {
        return this.dashboards.length > 1;
    };

    this.showPrint = function () {
        return !_.isEmpty(this.currentDashboard.printing);
    };

    this.getPrintConfigForCurrentDashboard = function () {
        return this.getCurrentDashboard().printing;
    }
};