'use strict';

Bahmni.Clinical.DashboardConfig = function (config) {

    var self = this;
    this.dashboards = config;
    this.openDashboards = [];

    this.getDefaultDashboard = function () {
        this.currentDashboard = _.find(this.dashboards, function (dashboard) {
            return dashboard.default;
        });
        return this.currentDashboard;
    };

    this.findOpenDashboard = function(dashboard) {
        return !_.findWhere(this.openDashboards, {'dashboardName': dashboard.dashboardName});
    }

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

    this.closeDashboard = function (dashboard) {
        _.remove(this.openDashboards, {'dashboardName': dashboard.dashboardName});
    };

    this.getSectionByName = function (name) {
        return _.find(this.currentDashboard.sections, function (section) {
            return section.name === name;
        }) || {};
    };

    this.isCurrentDashboard = function (dashboard) {
        return this.currentDashboard && this.currentDashboard.dashboardName === dashboard.dashboardName;
    };

    this.getDiseaseTemplateSections = function () {
        return _.rest(this.currentDashboard && this.currentDashboard.sections, function (section) {
            return section.name !== "diseaseTemplate";
        });
    };

    this.getDashboardSections = function (diseaseTemplates) {
        var sectionsToBeDisplayed = _.filter(this.currentDashboard && this.currentDashboard.sections, function (section) {
            return section.name !== "diseaseTemplate" || _.find(diseaseTemplates, function (diseaseTemplate) {
                return diseaseTemplate.name === section.templateName && diseaseTemplate.obsTemplates.length > 0;
            });
        });
        return _.map(sectionsToBeDisplayed, Bahmni.Clinical.PatientDashboardSection.create);
    };

    this.showTabs = function () {
        return this.dashboards.length > 1;
    };

    this.showPrint = function () {
        return !_.isEmpty(this.currentDashboard.printing);
    };

    this.getPrintConfigForCurrentDashboard = function(){
        return this.getCurrentDashboard().printing;
    }
};