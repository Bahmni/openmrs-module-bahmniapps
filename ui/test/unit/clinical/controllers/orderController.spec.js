'use strict';

describe("OrderController", function () {

    var scope, rootScope, ngDialog, appDescriptor;

    beforeEach(module('bahmni.common.conceptSet'));
    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);

        scope.consultation = {orders: []};
        var retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(Date.parse('2015-07-01'));
        var retrospectiveEntryService = jasmine.createSpyObj('retrospectiveEntryService', ['getRetrospectiveEntry']);
        retrospectiveEntryService.getRetrospectiveEntry.and.returnValue(retrospectiveEntry);

        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfig']);
        var appServiceMock = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appDescriptor.getConfig = function (param) {
            if (param === "enableRadiologyOrderOptions") {
                return {
                    value: ["NeedsPrint", "Urgent"]
                };
            } else if (param === "enableLabOrderOptions") {
                return {
                    value: ["Urgent"]
                };
            }
        };
        appServiceMock.getAppDescriptor = function() { return appDescriptor };

        var translate = jasmine.createSpyObj('$translate',['instant']);
        translate.instant.and.returnValue("Need Print for this order.");


        $controller('OrderController', {
            $scope: scope,
            $rootScope: rootScope,
            allOrderables: allOrderables,
            ngDialog: ngDialog,
            retrospectiveEntryService: retrospectiveEntryService,
            appService: appServiceMock,
            $translate: translate
        });
    }));

    it("should return true if it is in retrospective mode", function() {
        expect(scope.isRetrospectiveMode()).toBeTruthy();
    });

    it("should fetch ordersConfig and set in tabs", function () {
        scope.$digest();
        expect(scope.tabs.length).toBe(2);
        expect(scope.tabs[0].name).toBe("Lab Samples");
        expect(scope.tabs[0].topLevelConcept).toBe("Lab Samples");
        expect(scope.tabs[0]).toBe(scope.activeTab);
        expect(scope.tabs[1].name).toBe("Radiology Orders");
        expect(scope.tabs[1].topLevelConcept).toBe("Radiology Orders");
    });

    it("should fetch all orders templates", function () {
        scope.$digest();
        expect(scope.allOrdersTemplates['\'Lab Samples\''].name.name).toBe("Lab Samples");
        expect(scope.allOrdersTemplates['\'Lab Samples\''].conceptClass.name).toBe("ConvSet");
    });

    it("showLabSampleTests() should set the particular LabOrder to be active", function () {
        scope.showLeftCategoryTests({"name": "Blood"});
        expect(scope.activeTab.leftCategory.klass).toBe("active");
        expect(scope.activeTab.leftCategory.name).toBe("Blood");
    });

    it("getConceptClassesInSet() should get concept classes sorted by name", function () {
        var bloodSample = allOrderables['\'Lab Samples\''].setMembers[0];
        var conceptClassesInSet = scope.getConceptClassesInSet(bloodSample);
        expect(conceptClassesInSet).toEqual([{name: 'LabSet', description: 'Panel'}, {
            name: 'LabTest',
            description: 'Lab tests'
        }]);
    });

    it("getOrderTemplate :should return the Order template", function () {
        scope.$digest();
        expect(scope.getOrderTemplate("Lab Samples").name.name).toBe("Lab Samples");
    });

    describe("getName", function () {
        it("should get short name if exists", function () {
            var sample = {
                "names": [
                    {
                        "name": "Other",
                        "conceptNameType": "SHORT"
                    },
                    {
                        "name": "Other Samples",
                        "conceptNameType": "FULLY_SPECIFIED"
                    }
                ]
            };
            expect(scope.getName(sample)).toBe("Other");
        });

        it("should get fully specified name if short name doesn't exist", function () {
            var sample = {
                "names": [
                    {
                        "name": "Other Samples",
                        "conceptNameType": "FULLY_SPECIFIED"
                    }
                ]
            };
            expect(scope.getName(sample)).toBe("Other Samples");
        });

        it("should get undefined if both fully specified name and short name don't exist", function () {
            var sample = {
                "names": []
            };
            expect(scope.getName(sample)).toBe(undefined);
        });
    });

    describe("activateTab", function () {
        it("should update the selectedOrders when some other tab is activated", function () {
            scope.consultation.orders.push({
                    "uuid": undefined,
                    "concept": {
                        "uuid": "ab137c0f-5a23-4314-ab8d-29b8ff91fbfb",
                        "name": "ESR"
                    },
                    "isDiscontinued": false
                }
            );
            var radiologyOrderTab = _.find(scope.tabs, function (tab) {
                return tab.name == 'Radiology Orders'
            });
            scope.activateTab(radiologyOrderTab);
            expect(scope.selectedOrders.length).toBe(1);
        });

        it("should open the first left category by default on activating a tab", function () {

            var radiologyOrderTab = _.find(scope.tabs, function (tab) {
                return tab.name == 'Radiology Orders'
            });
            scope.activateTab(radiologyOrderTab);

            expect(scope.activeTab.leftCategory).toEqual(allOrderables["'Radiology Orders'"].setMembers[0]);
        });

        it("should not update selected orders if no tab is active", function () {
            scope.activeTab = undefined;
            scope.updateSelectedOrdersForActiveTab();
            expect(scope.selectedOrders.length).toBe(0);
        });

        it("should return true when orders is not saved and NeedsPrint configured for Radiology", function () {
            scope.activeTab = {
                name: 'Radiology'
            };
            expect(scope.isPrintShown(false)).toBeTruthy();
        });

        it("should return false when order was saved and NeedsPrint configured for Radiology", function () {
            scope.activeTab = {
                name: 'Radiology'
            };
            expect(scope.isPrintShown(true)).toBeFalsy();
        });

        it("should return true if there is Urgent configuration for Radiology", function () {
            scope.activeTab = {
                name: 'Radiology'
            };
            expect(scope.isUrgent()).toBeTruthy();
        });

        it("should return false if there is no configuration for NeedsPrint in Lab Orders and order is not saved", function () {
            scope.activeTab = {
                name: 'Lab'
            };
            expect(scope.isPrintShown(false)).toBeFalsy();
        });

        it("should return false if there is no configuration for NeedsPrint in Lab Orders and order was saved", function () {
            scope.activeTab = {
                name: 'Lab'
            };
            expect(scope.isPrintShown(true)).toBeFalsy();
        });

        it("should return true if there is configuration for Urgent in Lab Orders", function () {
            scope.activeTab = {
                name: 'Lab'
            };
            expect(scope.isUrgent()).toBeTruthy();
        });

        it("should return false if there is no configuration for Urgent in Lab Orders", function () {
            scope.enableLabOrderOptions = null;
            scope.activeTab = {
                name: 'Lab'
            };
            expect(scope.isUrgent()).toBeFalsy();
        });
    });

    it("should open notes popup", function () {
        var order = {commentToFulfiller: "comment"}

        scope.openNotesPopup(order);

        expect(scope.orderNoteText).toBe("comment");
        expect(ngDialog.open).toHaveBeenCalledWith({
            template: 'consultation/views/orderNotes.html',
            className: 'selectedOrderNoteContainer-dialog ngdialog-theme-default', data: order, scope: scope
        });
    });

    describe("appendPrintNotes",function (){
        it("should append needs print text in start of notes", function (){
            var order = {uuid: "uuid",previousNote:"comment" };
            scope.appendPrintNotes(order);
            expect(scope.orderNoteText).toBe("Need Print for this order.comment");
        });
        it("should not append needs print text in start of notes if its already there", function (){
            var order = {uuid: "uuid",previousNote:"Need Print for this order.comment" };
            scope.orderNoteText = "Need Print for this order.comment";
            scope.appendPrintNotes(order);
            expect(scope.orderNoteText).toBe("Need Print for this order.comment");
        });
    });

    describe("setEditedFlag", function () {
        it("should set edited flag when the commentToFulfiller is not same as previous note and close the popup", function () {
            var order = {uuid: "uuid", previousNote: "older comment"};

            scope.setEditedFlag(order, "comment");

            expect(order.hasBeenModified).toBe(true);
            expect(ngDialog.close).toHaveBeenCalled();
            expect(order.commentToFulfiller).toBe("comment")
        });

        it("should not set edited flag when the commentToFulfiller is same as previous note and close the popup", function () {
            var order = {uuid: "uuid", previousNote: "comment", commentToFulfiller: "comment"};

            scope.setEditedFlag(order, "comment");

            expect(order.hasBeenModified).toBe(undefined);
            expect(ngDialog.close).toHaveBeenCalled();
            expect(order.commentToFulfiller).toBe(order.previousNote)
        });
    });

    describe("isActiveOrderPresent", function () {
        it("should return true if the test is directly present in the selected test orders", function () {
            var someTest = allOrderables["\'Lab Samples\'"].setMembers[0].setMembers[0];
            var someOrder = Bahmni.Clinical.Order.create(someTest);
            scope.consultation.orders.push(someOrder);

            expect(scope.isActiveOrderPresent(someTest)).toBeTruthy();
        });

        it("should return true if the child order is present for the selected test order", function () {
            var someTest = allOrderables["\'Lab Samples\'"].setMembers[0].setMembers[1];
            var someOrder = Bahmni.Clinical.Order.create(someTest);
            scope.consultation.orders.push(someOrder);

            var someTestsChild = someTest.setMembers[0];
            expect(scope.isActiveOrderPresent(someTestsChild)).toBeTruthy();
        });
    });

    describe("isTestIndirectlyPresent", function () {
        it("should return false if the order is directly present", function () {
            var someTest = allOrderables["\'Lab Samples\'"].setMembers[0].setMembers[0];
            var someOrder = Bahmni.Clinical.Order.create(someTest);
            scope.consultation.orders.push(someOrder);

            expect(scope.isTestIndirectlyPresent(someTest)).toBeFalsy();
        });

        it("should return false for test if panel has been discontinued", function () {
            var test = allOrderables["\'Lab Samples\'"].setMembers[0].setMembers[1].setMembers[0];
            var somePanel = allOrderables["\'Lab Samples\'"].setMembers[0].setMembers[1];

            var panel = Bahmni.Clinical.Order.create(somePanel);
            panel.isDiscontinued = true;
            scope.consultation.orders.push(panel);

            expect(scope.isTestIndirectlyPresent(test)).toBeFalsy();
        });

        it("should return true if the order is indirectly present so that it can be made readonly", function () {
            var someTest = allOrderables["\'Lab Samples\'"].setMembers[0].setMembers[1];
            var someOrder = Bahmni.Clinical.Order.create(someTest);
            scope.consultation.orders.push(someOrder);

            var someTestsChild = someTest.setMembers[0];
            expect(scope.isTestIndirectlyPresent(someTestsChild)).toBeTruthy();
        });
    });

    describe("isOrderNotEditable", function () {
        it("child order should not be editable if it is parent is present", function () {
            var someParentTest = allOrderables["\'Lab Samples\'"].setMembers[0].setMembers[1];
            var parentOrder = Bahmni.Clinical.Order.create(someParentTest);
            scope.consultation.orders.push(parentOrder);

            var childTest = someParentTest.setMembers[0];
            var childOrder = Bahmni.Clinical.Order.create(childTest);
            expect(scope.isOrderNotEditable(childOrder)).toBeTruthy();
        });

        it("child order should be editable if its parent is not selected", function () {
            var childTest = allOrderables["\'Lab Samples\'"].setMembers[0].setMembers[1].setMembers[0];
            var childOrder = Bahmni.Clinical.Order.create(childTest);

            expect(scope.isOrderNotEditable(childOrder)).toBeFalsy();
        });

        it("parent order should always be editable", function () {
            var someParentTest = allOrderables["\'Lab Samples\'"].setMembers[0].setMembers[1];
            var parentOrder = Bahmni.Clinical.Order.create(someParentTest);
            scope.consultation.orders.push(parentOrder);

            expect(scope.isOrderNotEditable(parentOrder)).toBeFalsy();
        });
    });

    describe("toggleOrderSelection", function() {
        it("should add an order if it is not present", function() {
            var someTest = allOrderables["\'Lab Samples\'"].setMembers[0].setMembers[0];
            scope.toggleOrderSelection(someTest);

            var addedOrder = _.find(scope.consultation.orders, function(testOrder){
                return testOrder.concept.uuid == someTest.uuid;
            });
            expect(addedOrder).not.toBeUndefined();
        });

        it("should remove an order if it is present", function() {
            var someTest = allOrderables["\'Lab Samples\'"].setMembers[0].setMembers[0];
            var someOrder = Bahmni.Clinical.Order.create(someTest);
            scope.consultation.orders.push(someOrder);

            scope.toggleOrderSelection(someTest);

            expect(scope.consultation.orders).not.toContain(someOrder);
        });

        it("should remove all the child orders if its parent is added", function() {
            var parentTest = allOrderables["\'Lab Samples\'"].setMembers[0].setMembers[1];
            var childTest = parentTest.setMembers[0];
            var childOrder = Bahmni.Clinical.Order.create(childTest);
            scope.consultation.orders.push(childOrder);

            scope.toggleOrderSelection(parentTest);

            expect(scope.consultation.orders).not.toContain(childOrder);
        });

        it("already saved order should be marked as discontinued if removed", function() {
            var someTest = allOrderables["\'Lab Samples\'"].setMembers[0].setMembers[0];
            var someOrder = Bahmni.Clinical.Order.create(someTest);
            someOrder.uuid = "uuid1";
            scope.consultation.orders.push(someOrder);

            scope.toggleOrderSelection(someTest);

            expect(someOrder.isDiscontinued).toBeTruthy();
        });

        it("should revise the discontinued order if the same order is added", function(){
            var someTest = allOrderables["\'Lab Samples\'"].setMembers[0].setMembers[0];
            var someOrder = Bahmni.Clinical.Order.create(someTest);
            someOrder.uuid = "uuid1";
            someOrder.isDiscontinued = "true";
            scope.consultation.orders.push(someOrder);

            scope.toggleOrderSelection(someTest);

            expect(someOrder.isDiscontinued).toBeFalsy();
        })
    });

    describe("search tests and panels", function () {
        it("reset search string", function () {
            scope.search.string = "random";
            scope.resetSearchString();
            expect(scope.search.string).toBe('');
        });
    });


    var allOrderables = {
            "\'Lab Samples\'": {
                "conceptClass": {"name": "ConvSet"},
                "name": {"name": "Lab Samples", "display": "Lab Samples"},
                "uuid": "10517b93-aff1-11e3-be87-005056821db0",
                "setMembers": [
                    {
                        "conceptClass": {
                            "name": "ConvSet",
                            "uuid": "7bba17a2-6c1d-11e4-a1f2-ba526e30a5ee"
                        },
                        "name": {"name": "Blood", "display": "Blood"},
                        "uuid": "88024166-9bcd-11e3-927e-8840ab96f0f1",
                        "setMembers": [
                            {
                                "conceptClass": {
                                    "name": "LabTest",
                                    "description": "Lab tests",
                                    "uuid": "7bba17a2-6c1d-11e4-a1f2-ba526e30a5ad"
                                },
                                "name": {"name": "Biochemistry", "display": "Biochemistry"},
                                "uuid": "3b5ea063-b6e5-48cd-b39d-dce69f00f26a",
                                "setMembers": []
                            },
                            {
                                "conceptClass": {
                                    "name": "LabSet",
                                    "description": "Panel",
                                    "uuid": "8d492026-c2cc-11de-8d13-0010c6dffd0f"
                                },
                                "name": {"name": "Biochemistry1", "display": "Biochemistry1"},
                                "uuid": "3c5ea063-b6e5-48cd-b39d-dce69f00f26a",
                                "setMembers": [{
                                    "name": {"name": "Packed Cell Volume (PCV)", "display": "Packed Cell Volume (PCV)"},
                                    "uuid": "17a67549-0ba1-46bb-92eb-dca9f81fafa1",
                                    "conceptClass": {
                                        "name": "LabTest",
                                        "description": "Lab tests",
                                        "uuid": "7bba17a2-6c1d-11e4-a1f2-ba526e30a5ad"
                                    }
                                }]
                            },
                            {
                                "name": {"name": "Packed Cell Volume (PCV)", "display": "Packed Cell Volume (PCV)"},
                                "uuid": "17a67549-0ba1-46bb-92eb-dca9f81fafa1",
                                "conceptClass": {
                                    "name": "LabTest",
                                    "description": "Lab tests",
                                    "uuid": "7bba17a2-6c1d-11e4-a1f2-ba526e30a5ad"
                                },
                                "setMembers": []
                            }
                        ]
                    }
                ]
            },
            "\'Radiology Orders\'": {
                "conceptClass": {"name": "ConvSet"},
                "name": {"name": "Radiology Orders", "display": "Radiology Orders"},
                "uuid": "93b9c6fd-9bc6-11e3-927e-8840ab96f0f1",
                "setMembers": [
                    {
                        "conceptClass": {"name": "ConvSet"},
                        "name": {"name": "Special X Rays", "display": "Special X Rays"},
                        "uuid": "20517b93-aff1-11e3-be87-005056821db0",
                        "setMembers": [
                            {
                                "conceptClass": {
                                    "name": "LabTest",
                                    "description": "Lab tests",
                                    "uuid": "7bba17a2-6c1d-11e4-a1f2-ba526e30a5ad"
                                },
                                "name": {"name": "ESR", "display": "ESR"},
                                "uuid": "ab137c0f-5a23-4314-ab8d-29b8ff91fbfb",
                                "setMembers": []
                            }
                        ]
                    }
                ]

            }
        }

});
