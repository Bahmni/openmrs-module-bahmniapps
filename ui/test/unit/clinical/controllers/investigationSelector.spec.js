'use strict';

describe("InvestigationsSelectorControllerTest", function () {
    var scope, spinner, tests, getTestsPromise, testsProvider, configurations;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($rootScope) {
        var department1 = {name: "D1"};
        var department2 = {name: "D2"};
        var sample1 = {name: "S1"};
        var sample2 = {name: "S2"};
        var panel1 = {uuid: "p1-p1", sample: sample1, name: "S1P1", set: true};
        var panel2 = {uuid: "p2-p2", sample: sample2, name: "S2P2", set: true};
        var test1 = {uuid: "t1-t1", name: "S1P1D1T1", set: false, sample: sample1, panels: [panel1], department: department1};
        var test2 = {uuid: "t2-t2", name: "S1P1D1T2", set: false, sample: sample1, panels: [panel1], department: department1};
        var test3 = {uuid: "t3-t3", name: "S1P1D2T2", set: false, sample: sample1, panels: [panel1], department: department2};
        var test4 = {uuid: "t4-t4", name: "S2P2D2T2", set: false, sample: sample2, panels: [panel2], department: department2};
        var test5 = {uuid: "t5-t5", name: "S2P2D2T5", set: false, sample: sample2, panels: [panel2], department: department2};
        var test6 = {uuid: "t6-t6", name: "S2P0D0T6", set: false, sample: sample2, panels: [], department: null};
        tests = [test1, test2, test3, test4, test5, test6];
        
        
        configurations = jasmine.createSpyObj('configurations', ['encounterConfig']);
        configurations.encounterConfig.and.returnValue({"orderTypes" : []});
        
        testsProvider = jasmine.createSpyObj('testsProvider', ['getTests']);
        getTestsPromise = specUtil.createServicePromise('getTests');
        testsProvider.getTests.and.returnValue(getTestsPromise);

        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        spinner.forPromise.and.returnValue(getTestsPromise);
        
        scope = $rootScope.$new();
        scope.testsProvider = testsProvider;
        scope.filterColumn = "sample";
        scope.categoryColumn = "department";
        scope.investigations = [];
    }));

    var setUpController = function () {
        inject(function ($controller) {
            $controller('InvestigationsSelectorController', {
                $scope: scope,
                spinner: spinner,
                configurations: configurations
            });
        });
    };


    var getByName = function(items, name) {
        return items.filter(function(item) { return item.name == name})[0];
    }

    var getSelectableByName = function(name) {
        var selectables = scope.selectableTests.concat(scope.selectablePanels);
        return getByName(selectables, name);
    }

    describe("after loading tests", function(){
        beforeEach(function(){
            setUpController();
        });
        
        it("should initialize selectable tests, panels, filters, categories", function(){
            scope.investigations = [];

            getTestsPromise.callThenCallBack(tests);

            expect(scope.hasTests()).toBe(true);
            expect(scope.allSelectables().length).toBe(8);
            expect(scope.selectableTests.length).toBe(6);
            expect(scope.selectablePanels.length).toBe(2);
            expect(scope.categories.length).toBe(3);
            expect(scope.filters.length).toBe(2);
            expect(scope.categories[0].tests.length).toBe(2);
            expect(scope.categories[1].tests.length).toBe(3);
            expect(scope.selectablePanels[0].getChildrenCount()).toBe(3);
            expect(scope.selectablePanels[1].getChildrenCount()).toBe(2);
        });

        it("should show all tests and panels by default", function(){
            getTestsPromise.callThenCallBack(tests);

            var department1 = getByName(scope.categories, "D1");
            var department2 = getByName(scope.categories, "D2");
            var otherDepartment = getByName(scope.categories, "Other");
            expect(scope.filteredPanels.length).toBe(2);
            expect(department1.filteredTests.length).toBe(2);
            expect(department2.filteredTests.length).toBe(3);
            expect(otherDepartment.filteredTests.length).toBe(1);
        });

        it("should select the selectables and the children for existing investigations", function(){
            scope.investigations = [{uuid: "inv1", concept: {uuid: "t1-t1"}}, {uuid: "inv2", concept: {uuid: "p2-p2"}}];

            getTestsPromise.callThenCallBack(tests);

            expect(scope.selctedSelectables().length).toBe(2);
            expect(getSelectableByName("S1P1D1T1").isSelected()).toBe(true);            
            expect(getSelectableByName("S2P2").isSelected()).toBe(true);            
            expect(getSelectableByName("S2P2D2T2").isSelected()).toBe(true);            
            expect(getSelectableByName("S2P2D2T5").isSelected()).toBe(true);            
        });
        
        it("should not select the selectables for voided investigations", function(){
            scope.investigations = [{uuid: "inv1", concept: {uuid: "t1-t1"}, voided: true}];

            getTestsPromise.callThenCallBack(tests);

            expect(getSelectableByName("S1P1D1T1").isSelected()).toBe(false);            
        });

        it("should add an investigation on selecting a test", function(){
            scope.investigations = [];
            getTestsPromise.callThenCallBack(tests);

            getSelectableByName("S1P1D1T1").select();

            expect(scope.investigations.length).toBe(1);
            expect(scope.investigations[0].concept.name).toBe("S1P1D1T1");
            expect(scope.investigations[0].concept.uuid).toBe("t1-t1");
            expect(scope.investigations[0].concept.set).toBe(false);
            expect(scope.investigations[0].voided).toBe(false);
        });

        it("should add only one investigation on selecting a panel with tests", function(){
            scope.investigations = [];
            getTestsPromise.callThenCallBack(tests);

            getSelectableByName("S2P2").select();

            expect(scope.investigations.length).toBe(1);
            expect(scope.investigations[0].concept.name).toBe("S2P2");
            expect(scope.investigations[0].concept.uuid).toBe("p2-p2");
            expect(scope.investigations[0].concept.set).toBe(true);
        });

        it("should remove unsaved investigation when test is unselected", function(){
            scope.investigations = [];
            getTestsPromise.callThenCallBack(tests);

            getSelectableByName("S1P1D1T1").select();
            getSelectableByName("S1P1D1T1").unselect();

            expect(scope.investigations.length).toBe(0);            
        });

        it("should void saved investigation when corresponding test is unselected", function(){
            scope.investigations = [{uuid: "inv1", concept: {uuid: "t1-t1"}, voided: false}];
            getTestsPromise.callThenCallBack(tests);

            getSelectableByName("S1P1D1T1").unselect();

            expect(scope.investigations.length).toBe(1);            
            expect(scope.investigations[0].voided).toBe(true);            
        });

        it("should unvoid the voided investigation when corresponding test is selected", function(){
            scope.investigations = [{uuid: "inv1", concept: {uuid: "t1-t1"}, voided: true}];
            getTestsPromise.callThenCallBack(tests);

            getSelectableByName("S1P1D1T1").select();

            expect(scope.investigations.length).toBe(1);            
            expect(scope.investigations[0].voided).toBe(false);            
        });
    });

    describe("filterBy", function(){
        beforeEach(function(){
            setUpController();
        });
        
        it("should filter tests, panels and categories", function(){
            getTestsPromise.callThenCallBack(tests);
            var sample1 = getByName(scope.filters, "S1");
            var department1 = getByName(scope.categories, "D1");
            var department2 = getByName(scope.categories, "D2");

            scope.filterBy(sample1);

            expect(scope.hasFilter()).toBe(true);
            expect(scope.isFilteredBy(sample1)).toBe(true);
            expect(scope.filteredPanels.length).toBe(1);
            expect(department1.filteredTests.length).toBe(2);
            expect(department2.filteredTests.length).toBe(1);
        });
    });

    describe("showAll", function(){
        beforeEach(function(){
            setUpController();
        });
        
        it("should clear the filters", function(){
            getTestsPromise.callThenCallBack(tests);
            var sample1 = getByName(scope.filters, "S1");
            var department1 = getByName(scope.categories, "D1");
            var department2 = getByName(scope.categories, "D2");

            scope.filterBy(sample1)
            scope.showAll();

            expect(scope.filteredPanels.length).toBe(2);
            expect(department1.filteredTests.length).toBe(2);
            expect(department2.filteredTests.length).toBe(3);
        });
    });
});
