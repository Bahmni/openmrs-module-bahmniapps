'use strict';

describe("OrderController", function () {

    var scope, rootScope;

    beforeEach(module('bahmni.common.conceptSet'));
    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope, $q) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        scope.consultation = {testOrders: []};


        $controller('OrderController', {
            $scope: scope,
            $rootScope: rootScope,
            allOrderables: allOrderables
        });
    }));

    describe('test the OrderController', function () {
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
            expect(scope.consultation.allOrdersTemplates['\'Lab Samples\''].name.name).toBe("Lab Samples");
            expect(scope.consultation.allOrdersTemplates['\'Lab Samples\''].conceptClass.name).toBe("ConvSet");
        });

        it("diSelect() should unselect order", function () {
            scope.consultation.testOrders.push(testOrders[0]);
            scope.consultation.testOrders.push(testOrders[1]);
            scope.$digest();

            //diselect already saved order
            scope.diSelect({"concept": {"uuid": "3b5ea063-b6e5-48cd-b39d-dce69f00f26a"}});
            scope.$digest();
            expect(scope.consultation.testOrders[0].voided).toBe(true);
            expect(scope.selectedOrders.length).toBe(2);

            //diselect newly added order
            scope.diSelect({"concept": {"uuid": "3c5ea063-b6e5-48cd-b39d-dce69f00f26a"}});
            scope.$digest();
            expect(scope.consultation.testOrders.length).toBe(1);
            expect(scope.selectedOrders.length).toBe(1);
        });

        it("showLabSampleTests() should set the particular LabOrder to be active", function () {
            scope.showLeftCategoryTests({"name": "Blood"});
            expect(scope.activeTab.leftCategory.klass).toBe("active");
            expect(scope.activeTab.leftCategory.name).toBe("Blood");
        });

        it("getOrderTemplate :should return the Order template", function () {
            scope.$digest();
            expect(scope.getOrderTemplate("Lab Samples").name.name).toBe("Lab Samples");
        });

        it("getName: should get short name if exists", function () {
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

        it("getName: should get fully specified name if short name doesn't exist", function () {
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

        it("getName: should get undefined if both fully specified name and short name don't exist", function () {
            var sample = {
                "names": []
            };
            expect(scope.getName(sample)).toBe(undefined);
        });

        it("should update the selectedOrders when some other tab is activated", function(){
            scope.consultation.testOrders.push({
                    "uuid": undefined,
                    "concept": {
                        "uuid": "ab137c0f-5a23-4314-ab8d-29b8ff91fbfb",
                        "name": "ESR"
                    },
                    "voided": false
                }
            );
            var radiologyOrderTab = _.find(scope.tabs, function (tab) {
               return tab.name == 'Radiology Orders'
            });
            scope.activateTab(radiologyOrderTab);
            expect(scope.selectedOrders.length).toBe(1);
        });

    });

    var allOrderables = {
            "\'Lab Samples\'": {
                "conceptClass": {"name": "ConvSet"},
                "name": {"name": "Lab Samples", "display": "Lab Samples"},
                "uuid": "10517b93-aff1-11e3-be87-005056821db0",
                "setMembers": [
                    {
                        "conceptClass": {"name": "ConvSet"},
                        "name": {"name": "Blood", "display": "Blood"},
                        "uuid": "88024166-9bcd-11e3-927e-8840ab96f0f1",
                        "setMembers": [
                            {
                                "conceptClass": {"name": "Test", "display": "Test"},
                                "name": {"name": "Biochemistry", "display": "Biochemistry"},
                                "uuid": "3b5ea063-b6e5-48cd-b39d-dce69f00f26a"
                            },
                            {
                                "conceptClass": {"name": "Test", "display": "Test"},
                                "name": {"name": "Biochemistry1", "display": "Biochemistry1"},
                                "uuid": "3c5ea063-b6e5-48cd-b39d-dce69f00f26a"
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
                                "conceptClass": {"name": "Test", "display": "Test"},
                                "name": {"name": "ESR", "display": "ESR"},
                                "uuid": "ab137c0f-5a23-4314-ab8d-29b8ff91fbfb"
                            }
                        ]
                    }
                ]

            }
        },

        testOrders =  [
                {
                    "dateCreated": "2015-04-22T19:16:13.000+0530",
                    "instructions": null,
                    "concept": {
                        "conceptClass": "LabSet",
                        "uuid": "3b5ea063-b6e5-48cd-b39d-dce69f00f26a",
                        "name": "Biochemistry",
                        "set": true
                    },
                    "voided": false,
                    "dateChanged": null,
                    "orderNumber": "ORD-1013",
                    "uuid": "5e5b4484-7435-4600-a71d-e288c965d1db",
                    "voidReason": null,
                    "orderTypeUuid": "a28516de-a2a1-11e3-af88-005056821db0"
                },
                {
                    "concept": {
                        "uuid": "3c5ea063-b6e5-48cd-b39d-dce69f00f26a",
                        "name": "Biochemistry1"
                    },
                    "voided": false
                }
            ];
});