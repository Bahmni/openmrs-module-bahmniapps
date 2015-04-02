'use strict';

Bahmni.Clinical.VisitTabConfig = function (tabs) {
    var self = this;
    this.tabs = tabs;

    var addDefaultDashboard = function (){
        self.openTabs = [_.find(self.tabs, function (tab) {
            return tab.default;
        })];
    };

    var addDisplayByDefaultDashboards = function(){
        self.openTabs = self.openTabs.concat( _.filter(self.tabs, function (tab) {
            return tab.displayByDefault
        }));
    };

    var init = function(){
        addDefaultDashboard();
        addDisplayByDefaultDashboards();
    }();

    this.getDefaultTab = function () {
        return _.find(this.tabs, function (tab) {
            return tab.default;
        })
    };

    this.currentTab = this.getDefaultTab();

    this.getTab = function (title) {
        return _.find(this.tabs, function (tab) {
            return tab.title === title;
        })
    };

    this.setVisitUuidsAndPatientUuidToTheSections = function (visitUuids, patientUuid) {
        _.each(this.tabs, function (tab) {
            _.each(tab.sections, function(section){
                section.config.visitUuids = visitUuids;
                section.config.patientUuid = patientUuid;
            });
        });
    };

    this.switchTab = function (tab) {
        this.currentTab = tab;

        if (findOpenTab(tab)) {
            this.openTabs.push(tab);
        }

    };

    this.closeTab = function (tab) {
        _.remove(this.openTabs, {'title': tab.title});
        this.switchTab(this.getDefaultTab());
    };

    var findOpenTab = function (tab) {
        return !_.findWhere(self.openTabs, {'title': tab.title});
    };


    this.getUnOpenedTabs = function () {
        return _.filter(this.tabs, function (tab) {
            return findOpenTab(tab);
        })
    };

    this.isCurrentTab = function (tab) {
        return this.currentTab && this.currentTab.title === tab.title;
    };

    this.showPrint = function () {
        return !_.isEmpty(this.currentTab.printing);
    };
    this.getPrintConfigForCurrentVisit = function() {
        return this.currentTab.printing;
    }
};