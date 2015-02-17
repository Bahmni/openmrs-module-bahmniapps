'use strict';

Bahmni.Clinical.VisitTabConfig = function (tabs) {
    var self = this;
    this.tabs = tabs;
    this.openTabs = [_.find(this.tabs, function (tab) {
        return tab.default;
    })];

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
            for (var key in  tab) {
                if (_.isPlainObject(tab[key])) {
                    tab[key].visitUuids = visitUuids;
                    tab[key].patientUuid = patientUuid;
                }
            }
        });
    };

    this.switchTab = function (tab) {
        this.currentTab = tab;

        if (findOpenTab(tab)) {
            this.openTabs.push(tab);
        }

    };

    this.closeTab = function (tab) {
        event.stopPropagation();
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