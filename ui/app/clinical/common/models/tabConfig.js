'use strict';

Bahmni.Clinical.TabConfig = function (tabs) {
    var self = this;
    this.tabs = _.filter(tabs, function (tab) {
        return angular.isObject(tab);
    });
    this.identifierKey = null;

    var initDisplayByDefaultTabs = function () {
        self.visibleTabs = _.filter(self.tabs, function (tab) {
            return tab.displayByDefault;
        });
    };

    var init = function () {
        initDisplayByDefaultTabs();
        self.currentTab = self.getFirstTab();
        if (self.currentTab && self.currentTab.translationKey) {
            self.identifierKey = "translationKey";
        }
    };

    var isTabClosed = function (tab) {
        return !_.find(self.visibleTabs, function (visibleTab) {
            return visibleTab[self.identifierKey] === tab[self.identifierKey];
        });
    };

    this.getTab = function (id) {
        return _.find(self.tabs, function (tab) {
            return tab[self.identifierKey] === id;
        });
    };

    this.getFirstTab = function () {
        return self.visibleTabs[0];
    };

    this.switchTab = function (tab) {
        this.currentTab = tab;

        if (isTabClosed(tab)) {
            this.visibleTabs.push(tab);
        }
    };

    this.showTabs = function () {
        return this.tabs.length > 1;
    };

    this.closeTab = function (tab) {
        if (tab.displayByDefault) {
            return;
        }
        _.remove(self.visibleTabs, function (visibleTab) {
            return tab[self.identifierKey] === visibleTab[self.identifierKey];
        });
        this.switchTab(this.getFirstTab());
    };

    this.getUnOpenedTabs = function () {
        return _.difference(this.tabs, this.visibleTabs);
    };

    this.isCurrentTab = function (tab) {
        return this.currentTab && this.currentTab[self.identifierKey] === tab[self.identifierKey];
    };

    this.showPrint = function () {
        return !_.isEmpty(this.currentTab.printing);
    };

    this.getPrintConfigForCurrentTab = function () {
        return this.currentTab.printing;
    };

    init();
};
