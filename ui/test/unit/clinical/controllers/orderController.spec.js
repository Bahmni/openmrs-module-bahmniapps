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
            expect(scope.tabs.length).toBe(1);
            expect(scope.tabs[0].name).toBe("Lab Samples");
            expect(scope.tabs[0].topLevelConcept).toBe("Lab Samples");
            expect(scope.tabs[0]).toBe(scope.activeTab);

        });

        it("should fetch all orders templates", function () {
            scope.$digest();
            expect(scope.consultation.allOrdersTemplates['\'Lab Samples\''].name.name).toBe("Lab Samples");
            expect(scope.consultation.allOrdersTemplates['\'Lab Samples\''].conceptClass.name).toBe("ConvSet");
        });

        it("diSelect() should unselect order", function () {
            scope.consultation = tempConsultation;
            scope.diSelect({"concept": {"uuid": "3b5ea063-b6e5-48cd-b39d-dce69f00f26a"}});
            expect(scope.consultation.testOrders[0].voided).toBe(true);
            scope.diSelect({"concept": {"uuid": "3c5ea063-b6e5-48cd-b39d-dce69f00f26a"}});
            expect(scope.consultation.testOrders.length).toBe(1);
        });

        it("showLabSampleTests() should set the particular LabOrder to be active", function () {
            scope.showLeftCategoryTests({"name": "Blood"});
            expect(scope.activeTab.leftCategory.klass).toBe("active");
            expect(scope.activeTab.leftCategory.name).toBe("Blood");
        });

        it("getOrderTemplate :should return the Order template", function () {
            scope.$digest();
            expect(scope.getOrderTemplate("Lab Samples").name.name).toBe("Lab Samples");
            expect(scope.getTabInclude()).toBe('consultation/views/orderTemplateViews/ordersTemplate.html');
        });
    });

    var allOrderables ={
        "\'Lab Samples\'" : {
            "conceptClass" : {"name" : "ConvSet"},
            "name" : {"name" : "Lab Samples", "display" : "Lab Samples"},
            "uuid" : "10517b93-aff1-11e3-be87-005056821db0",
            "setMembers" : [
                {
                    "conceptClass" : {"name" : "ConvSet"},
                    "name" : {"name" : "Blood", "display" : "Blood"},
                    "uuid" : "20517b93-aff1-11e3-be87-005056821db0",
                    "setMembers" : [
                        {
                            "conceptClass" : {"name" : "Test", "display" : "Test"},
                            "name" : {"name" : "ESR", "display" : "ESR"},
                            "uuid" : "10517b93-aff1-11e3-be87-005056821db0"
                        }
                    ]
                }
            ]
        }
    },

     tempConsultation = {
        "testOrders" : [
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
                "dateCreated": "2015-04-22T19:16:13.000+0530",
                "instructions": null,
                "concept": {
                    "conceptClass": "LabSet",
                    "uuid": "3c5ea063-b6e5-48cd-b39d-dce69f00f26a",
                    "name": "Biochemistry1",
                    "set": true
                },
                "voided": false,
                "dateChanged": null,
                "orderNumber": "ORD-1013",
                "voidReason": null,
                "orderTypeUuid": "a28516de-a2a1-11e3-af88-005056821db0"
            }
        ]
    };

});