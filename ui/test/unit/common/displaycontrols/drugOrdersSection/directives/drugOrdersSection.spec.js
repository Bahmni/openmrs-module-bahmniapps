'use strict';

describe('DrugOrdersSection DisplayControl', function () {
    var drugOrders,
        $compile,
        mockBackend,
        scope,
        params, element, q,
        treatmentService,
        simpleHtml = '<drug-orders-section patient-uuid="patientUuid" config="params" treatment-config="treatmentConfig"></drug-orders-section>';
    var DateUtil = Bahmni.Common.Util.DateUtil;

    var activeDrugOrder = {
        "uuid": "activeOrderUuid",
        "action": "NEW",
        "careSetting": "Outpatient",
        "orderType": "Drug Order",
        "orderNumber": "ORD-1234",
        "autoExpireDate": null,
        "scheduledDate": null,
        "dateStopped": null,
        "instructions": null,
        "visit": {
            "startDateTime": 1397028261000,
            "uuid": "002efa33-4c4f-469f-968a-faedfe3a5e0c"
        },
        "drug": {
            "form": "Injection",
            "uuid": "8d7e3dc0-f4ad-400c-9468-5a9e2b1f4230",
            "strength": null,
            "name": "Methylprednisolone 2ml"
        },
        "dosingInstructions": {
            "quantity": 100,
            "route": "Intramuscular",
            "frequency": "Twice a day",
            "doseUnits": "Tablespoon",
            "asNeeded": false,
            "quantityUnits": "Tablet",
            "dose": 5,
            "administrationInstructions": "{\"instructions\":\"In the evening\",\"additionalInstructions\":\"helylo\"}",
            "numberOfRefills": null
        },
        "durationUnits": "Days",
        "dateActivated": 1410322624000,
        "commentToFulfiller": null,
        "effectiveStartDate": 1410322624000,
        "effectiveStopDate": null,
        "orderReasonConcept": null,
        "dosingInstructionType": "org.openmrs.module.bahmniemrapi.drugorder.dosinginstructions.FlexibleDosingInstructions",
        "previousOrderUuid": null,
        "orderReasonText": null,
        "duration": 10,
        "concept": {
            "shortName": "Methylprednisolone 2ml"
        },
        "provider": {name: "superman"}
    };

    var scheduledOrder = {
        "uuid": "scheduledOrderUuid",
        "action": "NEW",
        "careSetting": "Outpatient",
        "orderType": "Drug Order",
        "orderNumber": "ORD-2345",
        "autoExpireDate": null,
        "scheduledDate": null,
        "dateStopped": null,
        "instructions": null,
        "visit": {
            "startDateTime": 1397028261000,
            "uuid": "002efa33-4c4f-469f-968a-faedfe3a5e0c"
        },
        "drug": {
            "form": "Injection",
            "uuid": "8d7e3dc0-f4ad-400c-9468-5a9e2b1f4230",
            "strength": null,
            "name": "Methylprednisolone 200ml"
        },
        "dosingInstructions": {
            "quantity": 100,
            "route": "Intramuscular",
            "frequency": "Twice a day",
            "doseUnits": "Tablespoon",
            "asNeeded": false,
            "quantityUnits": "Tablet",
            "dose": 5,
            "administrationInstructions": "{\"instructions\":\"In the evening\",\"additionalInstructions\":\"helylo\"}",
            "numberOfRefills": null
        },
        "durationUnits": "Days",
        "dateActivated": DateUtil.addDays(new Date(), 2).valueOf(),
        "commentToFulfiller": null,
        "effectiveStartDate": DateUtil.addDays(new Date(), 2).valueOf(),
        "effectiveStopDate": null,
        "orderReasonConcept": null,
        "dosingInstructionType": "org.openmrs.module.bahmniemrapi.drugorder.dosinginstructions.FlexibleDosingInstructions",
        "previousOrderUuid": null,
        "orderReasonText": null,
        "duration": 10,
        "concept": {
            "shortName": "Methylprednisolone 2ml"
        },
        "provider": {name: "superman"}
    };

    drugOrders = [activeDrugOrder, scheduledOrder
    ];

    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.displaycontrol.drugOrdersSection'));

    beforeEach(module(function ($provide) {
        treatmentService = jasmine.createSpyObj('treatmentService', ['getAllDrugOrdersFor', 'voidDrugOrder']);
        $provide.value('treatmentService', treatmentService);

    }));

    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend, $q) {
        scope = $rootScope;
        q = $q;
        $compile = _$compile_;
        scope.patientUuid = "abcd-1234";
        scope.params = {
            title: "Active TB Drugs",
            columns: ["drugName", "dosage", "route"]
        };
        scope.treatmentConfig = {};
        treatmentService.getAllDrugOrdersFor.and.returnValue(specUtil.respondWithPromise(q, drugOrders));

        mockBackend = $httpBackend;
        mockBackend.expectGET('../common/displaycontrols/drugOrdersSection/views/drugOrdersSection.html').respond("<div>dummy</div>");
    }));

    it("should return all configured drug orders taken by the patient", function () {
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.drugOrders.length).toBe(drugOrders.length);
    });

    it("should initialise columns if not specified in config", function () {
        scope.params = {
            title: "Active TB Drugs"
        };
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();
        var expectedColumns = ["drugName", "dosage", "startDate", "frequency", "route"]
        expect(compiledElementScope.columns.length).toBe(5);
        expect(compiledElementScope.columns).toEqual(expectedColumns)
    });

    it("should assign Drug Orders as default title if title is not specified in config", function () {
        scope.params = {};
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.config.title).toBe("Drug Orders");
    });

    it('should broadcast refillDrugOrder event on refill', function () {
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();
        spyOn(scope, '$broadcast');

        var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder);
        compiledElementScope.refill(drugOrder);
        expect(scope.$broadcast).toHaveBeenCalledWith('event:refillDrugOrder', drugOrder);
    });

    describe("reviseDrugOrder", function () {
        it('should broadcast reviseDrugOrder event on revise', function () {
            element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();
            spyOn(scope, '$broadcast');

            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder);
            compiledElementScope.revise(drugOrder, drugOrders);
            expect(scope.$broadcast).toHaveBeenCalledWith('event:reviseDrugOrder', drugOrder, drugOrders);
        });

        it("should clear drug action flags for drug orders on listening to reviseDrugOrder event", function () {
            element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            compiledElementScope.drugOrders[0].isDiscontinuedAllowed = false;
            compiledElementScope.drugOrders[0].isBeingEdited = true;
            compiledElementScope.drugOrders[1].isDiscontinuedAllowed = false;
            compiledElementScope.drugOrders[1].isBeingEdited = true;


            scope.$broadcast("event:reviseDrugOrder", compiledElementScope.drugOrders[0]);

            expect(compiledElementScope.drugOrders[0].isDiscontinuedAllowed).toBeFalsy();
            expect(compiledElementScope.drugOrders[0].isBeingEdited).toBeTruthy();
            expect(compiledElementScope.drugOrders[1].isDiscontinuedAllowed).toBeTruthy();
            expect(compiledElementScope.drugOrders[1].isBeingEdited).toBeFalsy();


        })
    });

    it('should broadcast discontinueDrugOrder event on discontinue and update form conditions', function () {
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder);
        spyOn(scope, '$broadcast');
        spyOn(compiledElementScope, 'updateFormConditions');
        compiledElementScope.discontinue(drugOrder);
        expect(scope.$broadcast).toHaveBeenCalledWith('event:discontinueDrugOrder', drugOrder);
        expect(compiledElementScope.updateFormConditions).toHaveBeenCalled();
    });


    describe("when conditionally enable or disable order reason text for drug stoppage", function () {

        it("should enable reason text for all concepts when nothing is configured", function () {
            element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrders[0]);
            Bahmni.ConceptSet.FormConditions.rules = {};
            drugOrder.orderReasonConcept = {name: {name: "Other"}};
            compiledElementScope.discontinue(drugOrder);

            expect(drugOrder.orderReasonNotesEnabled).toBe(true);

        });

        it("should enable reason text only for configured reason concepts", function () {
            element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrders[0]);
            Bahmni.ConceptSet.FormConditions.rules = {
                "Medication Stop Reason": function (drugOrder, conceptName) {
                    if (conceptName == "Adverse event") {
                        drugOrder.orderReasonNotesEnabled = true;
                        return true;
                    }
                    else
                        return false;
                }
            };
            drugOrder.orderReasonConcept = {name: {name: "Adverse event"}};
            compiledElementScope.discontinue(drugOrder);

            expect(drugOrder.orderReasonNotesEnabled).toBe(true);

        });

        it("should disable reason text only for unconfigured reason concepts", function () {
            element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrders[0]);
            Bahmni.ConceptSet.FormConditions.rules = {
                "Medication Stop Reason": function (drugOrder, conceptName) {
                    if (conceptName == "Adverse event") {
                        drugOrder.orderReasonNotesEnabled = true;
                        return true;
                    }
                    else
                        return false;
                }
            };
            drugOrder.orderReasonConcept = {name: {name: "Adverse event"}};
            compiledElementScope.updateFormConditions(drugOrder);
            expect(drugOrder.orderReasonNotesEnabled).toBe(true);

            drugOrder.orderReasonConcept = {name: {name: "other event"}};
            compiledElementScope.updateFormConditions(drugOrder);
            expect(drugOrder.orderReasonNotesEnabled).toBe(false);

        });

    });

    describe("Column header Internationalization", function () {
        it("should pick the column name header key from treatmentConfig", function () {
            scope.params = {
                columnHeaders: {
                    drugName: "drugg"
                }
            };
            element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();
            expect(compiledElementScope.columnHeaders.drugName).toBe("drugg");
        });

        it("should pick the default column name header key if not present in treatmentConfig", function () {
            element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();
            expect(compiledElementScope.columnHeaders.drugName).toBe("DRUG_DETAILS_DRUG_NAME");
        });
    })

    describe("voidDrugOrder", function () {
        it('should broadcast sectionUpdated event on void', function () {
            element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.flush();

            treatmentService.voidDrugOrder.and.callFake(function() {
                return q.defer().promise;
            });

            var compiledElementScope = element.isolateScope();

            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder);
            compiledElementScope.remove(drugOrder);

            expect(treatmentService.voidDrugOrder).toHaveBeenCalledWith(drugOrder);
        });
    });
});