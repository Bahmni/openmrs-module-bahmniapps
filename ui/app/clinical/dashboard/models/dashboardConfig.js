'use strict';

Bahmni.Clinical.DashboardConfig = function (config) {

    var self = this;
    this.dashboards = config;
    this.openDashboards = [];

    this.getDefaultDashboard = function () {
        self.currentDashboard = _.first(self.dashboards, function (dashboard) {
            return dashboard.default;
        })[0];
        return self.currentDashboard;
    };

    this.getUnOpenedDashboards = function () {
        return _.filter(this.dashboards, function (dashboard) {
            return !_.findWhere(self.openDashboards, {'name': dashboard.name});
        })
    };

    this.getCurrentDashboard = function () {
        return this.currentDashboard;
    };

    this.switchDashboard = function (dashboard) {
        this.currentDashboard = dashboard;
        if (!_.findWhere(this.openDashboards, {'name': dashboard.name})) {
            this.openDashboards.push(dashboard);
        }
    };

    this.closeDashboard = function (dashboard) {
        _.remove(this.openDashboards, {'name': dashboard.name});
    };

    this.getSectionByName = function (name) {
        return _.find(this.currentDashboard.sections, function (section) {
            return section.name === name;
        }) || {};
    };

    this.isCurrentDashboard = function (dashboard) {
        return this.currentDashboard && this.currentDashboard.name === dashboard.name;
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
        return self.dashboards.length > 1;
    };

};