'use strict';

describe("OrderController", function () {

    var scope, spinner, deferred, rootScope, conceptSetService, fetchDeferred;

    beforeEach(module('bahmni.common.conceptSet'));
    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope, $q) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        scope.consultation = {testOrders: []};

        conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConceptSetMembers']);
        conceptSetService.getConceptSetMembers.and.callFake(function (param) {
            fetchDeferred = $q.defer();
            if(param.name === "All Orderables") {
                fetchDeferred.resolve(allOrderables);
            }
            else {
                fetchDeferred.resolve(orderTemplate);
            }
            return fetchDeferred.promise;
        });

        var _spinner = jasmine.createSpyObj('spinner',['forPromise','then']);
        _spinner.forPromise.and.callFake(function(promiseToResolve){
            deferred = $q.defer();
            deferred.resolve({data: promiseToResolve.$$state.value});
            return deferred.promise;
        });

        _spinner.then.and.callThrough(function(param){
            deferred = $q.defer();
            deferred.resolve({data: param.value});
            return deferred.promise;
        });

        $controller('OrderController', {
            $scope: scope,
            $rootScope: rootScope,
            conceptSetService: conceptSetService,
            spinner: _spinner,
            orderTypes: orderTypeConceptClassMap
        });
    }));

    describe('test the OrderController', function () {
        it("should fetch ordersConfig and set in tabs", function () {
            scope.$digest();
            expect(scope.tabs.length).toBe(1);
            expect(scope.tabs[0].name).toBe("Lab Order");
            expect(scope.tabs[0].tests.length).toBe(2);
            expect(scope.tabs[0].topLevelConcept).toBe("Lab Order");
            expect(scope.tabs[0]).toBe(scope.activeTab);

        });

        it("should fetch all orders templates", function () {
            scope.$digest();
            expect(scope.consultation.allOrdersTemplates['\'Lab Order\''].name.name).toBe("Lab Order");
            expect(scope.consultation.allOrdersTemplates['\'Lab Order\''].conceptClass.name).toBe("ConvSet");
        });

        it("diSelect() should unselect order", function () {
            scope.consultation = tempConsultation;
            scope.diSelect({"concept": {"uuid": "3b5ea063-b6e5-48cd-b39d-dce69f00f26a"}});
            expect(scope.consultation.testOrders[0].voided).toBe(true);
            scope.diSelect({"concept": {"uuid": "3c5ea063-b6e5-48cd-b39d-dce69f00f26a"}});
            expect(scope.consultation.testOrders.length).toBe(1);
        });

        it("showLabSampleTests() should set the particular LabOrder to be active", function () {
            scope.showleftCategoryTests({"name": "Blood"});
            expect(scope.leftCategory.klass).toBe("active");
            expect(scope.leftCategory.name).toBe("Blood");
        });

        it("getOrderTemplate :should return the Order template", function () {
            scope.$digest();
            expect(scope.getOrderTemplate("Lab Order").name.name).toBe("Lab Order");
            expect(scope.getTabInclude()).toBe('consultation/views/orderTemplateViews/ordersTemplate.html');
        });
    });

    var orderTypeConceptClassMap = {
        "\'Lab Order\'" : {
            "conceptClasses" : [
                {
                    "title": "LabSet",
                    "type": "LabSet"
                },
                {
                    "title": "LabTest",
                    "type": "LabTest"
                }
            ]
        }
    },
    orderTemplate = {
        "results" : [
        {
            "conceptClass" : {"name" : "ConvSet"},
            "name" : {"name" : "Lab Order"},
            "uuid" : "00517b93-aff1-11e3-be87-005056821db0",
            "setMembers" : [
                {
                    "conceptClass" : {"name" : "Test"},
                    "name" : {"name" : "ESR"},
                    "uuid" : "10517b93-aff1-11e3-be87-005056821db0"
                }
            ]

        }
    ]
    },

    allOrderables = {
        "results" : [
            {
                "conceptClass" : {"name" : "ConvSet"},
                "name" : {"name" : "All Orderables"},
                "uuid" : "00517b93-aff1-11e3-be87-005056821db0",
                "setMembers" : [
                    {
                        "conceptClass" : {"name" : "ConvSet"},
                        "name" : {"name" : "Lab Order"},
                        "uuid" : "10517b93-aff1-11e3-be87-005056821db0"
                    }
                ]

            }
        ]
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