'use strict';

describe("tab config", function () {

    var tabConfig;
    var config = [
        {
            dashboardName: "visit",
            displayByDefault: false
        },
        {
            dashboardName: "disposition",
            displayByDefault: true
        },
        {
            dashboardName: "trends",
            displayByDefault: true,
            printing: {title: "Awesome"}
        }
    ];

    beforeEach(function() {
        tabConfig = new Bahmni.Clinical.TabConfig(config);
        tabConfig.identifierKey = "dashboardName"
    });


    it("should initialise all display by default tabs and the first tab", function () {
        expect(tabConfig.getFirstTab()).toEqual(config[1]);
        expect(tabConfig.visibleTabs).toEqual([config[1], config[2]]);
    });

    it("should get the right tab", function () {
        expect(tabConfig.getTab("trends")).toEqual(config[2]);
    });

    it("should switch to visible tab", function () {
        tabConfig.switchTab(config[2]);
        expect(tabConfig.currentTab).toBe(config[2]);
    });

    it("should add the tab to visible tabs when switched to hidden tab", function() {
        expect(tabConfig.visibleTabs).toEqual([config[1], config[2]]);
        var hiddenTab = config[0];
        tabConfig.switchTab(hiddenTab);
        expect(tabConfig.currentTab).toBe(hiddenTab);
        expect(tabConfig.visibleTabs).toEqual([config[1], config[2], config[0]]);
    });

    it("should return true if there are tabs to show", function() {
        expect(tabConfig.showTabs()).toBe(true);
    });

    it("should return false if there are no tabs to show", function() {
        var emptyTabConfig = new Bahmni.Clinical.TabConfig([]);
        expect(emptyTabConfig.showTabs()).toBe(false);
    });

    it("should close the current tab and switch to the first tab", function() {
        tabConfig.closeTab(config[0]);
        expect(tabConfig.visibleTabs).toEqual([config[1], config[2]]);
        expect(tabConfig.currentTab).toEqual(config[1]);
    });

    it("should not close a display by default tab", function() {
        tabConfig.closeTab(config[1]);
        expect(tabConfig.visibleTabs).toEqual([config[1], config[2]]);
        expect(tabConfig.currentTab).toEqual(config[1]);
    });

    it("should return all the unopened tabs", function() {
        expect(tabConfig.getUnOpenedTabs()).toEqual([config[0]]);
    });

    it("should return true for the current tab", function() {
        expect(tabConfig.isCurrentTab(config[1])).toBe(true);
        expect(tabConfig.isCurrentTab(config[0])).toBe(false);
    });

    it("should return true if there is a print configuration for the tab", function() {
        tabConfig.switchTab(config[2]);
        expect(tabConfig.showPrint()).toBe(true);
    });

    it("should return false if there is no print configuration for the tab", function() {
        tabConfig.switchTab(config[0]);
        expect(tabConfig.showPrint()).toBe(false);
    });

    it("should return the print configuration", function() {
        tabConfig.switchTab(config[2]);
        expect(tabConfig.getPrintConfigForCurrentTab()).toEqual(config[2].printing);
    });


});
