'use strict';

describe("Visit Tab Config ", function () {
    var defaultTab = {
        title: "visit",
        default: true,
        investigationResult: {
            title: "Lab Investigations",
            showChart: false,
            showTable: false,
            numberOfVisits: 1
        },
        treatment: {
            title: "Treatments",
            showFlowSheet: false,
            showListView: false
        }
    };

    var defaultTab2 = {
        title: "visit",
        default: true,
        investigationResult: {
            title: "Lab Investigations",
            showChart: true,
            showTable: false,
            numberOfVisits: 1
        },
        treatment: {
            title: "Treatments",
            showFlowSheet: false,
            showListView: false
        }
    };

    var pivotTableTab = {
        title: "pivot table",
        pivotTable:{
            conceptNames:["vitals"]
        }
    };

    describe("Get default tab", function () {
        it("should return the default tab", function () {
            var visitTabConfig = new Bahmni.Clinical.VisitTabConfig([defaultTab, pivotTableTab]);
            expect(visitTabConfig.getDefaultTab()).toBe(defaultTab);
        });

        it("should return the first tab as default if there are two default tabs", function () {
            var visitTabConfig = new Bahmni.Clinical.VisitTabConfig([defaultTab2, defaultTab]);
            expect(visitTabConfig.getDefaultTab()).toBe(defaultTab2);
        })
    });

    describe("Get tab", function () {
        it("should return the tab given title", function () {
            var visitTabConfig = new Bahmni.Clinical.VisitTabConfig([defaultTab, pivotTableTab]);
            expect(visitTabConfig.getTab("pivot table")).toBe(pivotTableTab);
        });

        it("should return the first tab if there are two tabs with the same title", function () {
            var visitTabConfig = new Bahmni.Clinical.VisitTabConfig([defaultTab2, defaultTab]);
            expect(visitTabConfig.getTab("visit")).toBe(defaultTab2);
        })
    });

    describe("Switch tab", function () {
        it("should set the current tab as given tab and add that to openTabs", function () {
            var visitTabConfig = new Bahmni.Clinical.VisitTabConfig([defaultTab, pivotTableTab]);
            visitTabConfig.switchTab(pivotTableTab);
            expect(visitTabConfig.currentTab).toBe(pivotTableTab);
            expect(_.contains(visitTabConfig.openTabs, pivotTableTab)).toBeTruthy();
        });
    });

    describe("Close tab", function () {
        it("should remove the given tab from openTabs", function () {
            var visitTabConfig = new Bahmni.Clinical.VisitTabConfig([defaultTab, pivotTableTab]);
            visitTabConfig.switchTab(pivotTableTab);
            visitTabConfig.closeTab(pivotTableTab);
            expect(visitTabConfig.currentTab).toBe(defaultTab);
            expect(_.contains(visitTabConfig.openTabs, pivotTableTab)).toBeFalsy();
        });
    });

    describe("Get unopened tabs", function () {
        it("should return tabs which are not opened", function () {
            var visitTabConfig = new Bahmni.Clinical.VisitTabConfig([defaultTab, pivotTableTab]);
            expect(_.contains(visitTabConfig.getUnOpenedTabs(), pivotTableTab)).toBeTruthy();
            expect(_.contains(visitTabConfig.getUnOpenedTabs(), defaultTab)).toBeFalsy();
        });

        it("should not return the closed tabs", function () {
            var visitTabConfig = new Bahmni.Clinical.VisitTabConfig([defaultTab, pivotTableTab]);
            visitTabConfig.switchTab(pivotTableTab);
            expect(_.contains(visitTabConfig.getUnOpenedTabs(), pivotTableTab)).toBeFalsy();
            expect(_.contains(visitTabConfig.getUnOpenedTabs(), defaultTab)).toBeFalsy();

            visitTabConfig.closeTab(pivotTableTab);

            expect(_.contains(visitTabConfig.getUnOpenedTabs(), pivotTableTab)).toBeTruthy();
            expect(_.contains(visitTabConfig.getUnOpenedTabs(), defaultTab)).toBeFalsy();
        });

    });
});