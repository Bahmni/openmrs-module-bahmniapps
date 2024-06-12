'use strict';

describe("DrugOrderHistoryController", function () {
    beforeEach(module('bahmni.clinical'));

    var scope, prescribedDrugOrders, activeDrugOrder, scheduledOrder, _treatmentService,
        retrospectiveEntryService, appService, rootScope, visitHistory, allergyService;
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var treatmentConfig = {
        drugOrderHistoryConfig: {
            numberOfVisits: 4
        }
    };

    var translate;
    beforeEach(module(function ($provide) {
        translate = jasmine.createSpyObj('$translate', ['instant']);
        $provide.value('$translate', translate);
        $provide.value('appService', appService);
    }));

    var $q, $controller, spinner;
    beforeEach(inject(function (_$controller_, $rootScope, _$q_) {
        $q = _$q_;
        $controller = _$controller_;
        _treatmentService = jasmine.createSpyObj('treatmentService', ['getPrescribedDrugOrders', 'getMedicationSchedulesForOrders']);
        _treatmentService.getPrescribedDrugOrders.and.callFake(function () {
            return specUtil.respondWithPromise($q, prescribedDrugOrders);
        });
        _treatmentService.getMedicationSchedulesForOrders.and.callFake(function () {
            return specUtil.respondWithPromise($q, []);
        });
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function (config) {
                return false;
            }
        });
        allergyService = jasmine.createSpyObj('allergyService', ['getAllergyForPatient']);

        rootScope = $rootScope;
        spyOn($rootScope, '$broadcast');
        $rootScope.visit = {startDate: 1410322624000};
        scope = $rootScope.$new();
        scope.consultation = {
            preSaveHandler: new Bahmni.Clinical.Notifier(),
            discontinuedDrugs: [],
            activeAndScheduledDrugOrders: [
                Bahmni.Clinical.DrugOrderViewModel.createFromContract(scheduledOrder),
                Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder)
            ]
        };
        scope.currentBoard = {extensionParams: {}};

        var retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(Date.now());
        retrospectiveEntryService = jasmine.createSpyObj('retrospectiveEntryService', ['getRetrospectiveEntry']);
        retrospectiveEntryService.getRetrospectiveEntry.and.returnValue(retrospectiveEntry);
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        visitHistory = {};
        allergyService = jasmine.createSpyObj('allergyService', ['getAllergyForPatient']);
    }));

    var initController = function () {
        $controller('DrugOrderHistoryController', {
            $scope: scope,
            $translate: translate,
            activeDrugOrders: [activeDrugOrder, scheduledOrder],
            treatmentService: _treatmentService,
            retrospectiveEntryService: retrospectiveEntryService,
            $stateParams: {patientUuid: "patientUuid"},
            visitContext: {},
            spinner: spinner,
            visitHistory: visitHistory,
            treatmentConfig: treatmentConfig,
            appService: appService,
            allergyService: allergyService
        });
        rootScope.$apply();
    };

    beforeEach(initController);

    describe("when initialized", function () {
        it("should setup scope variables", function () {
            translate.instant.and.returnValue("Recent");

            initController();
            expect(scope.consultation.drugOrderGroups.length).toBe(3);
            expect(scope.consultation.drugOrderGroups[0].label).toEqual("Recent");
            expect(scope.consultation.drugOrderGroups[0].drugOrders.length).toBe(3);
            expect(scope.consultation.drugOrderGroups[0].drugOrders[0].uuid).toBe(scheduledOrder.uuid);
            expect(scope.consultation.drugOrderGroups[0].drugOrders[1].uuid).toBe(activeDrugOrder.uuid);
            expect(scope.consultation.drugOrderGroups[0].drugOrders[2].uuid).toBe('drugOrder2Uuid');
            expect(scope.consultation.drugOrderGroups[0].selected).toBeTruthy();
            expect(scope.consultation.drugOrderGroups[1].visitStartDate.getTime()).toEqual(1410349317000);
            expect(scope.consultation.drugOrderGroups[1].drugOrders.length).toBe(1);
            expect(scope.consultation.drugOrderGroups[2].visitStartDate.getTime()).toEqual(1397028261000);

            var secondDrugOrder = scope.consultation.drugOrderGroups[2].drugOrders[0];
            expect(secondDrugOrder.drug.name).toBe(prescribedDrugOrders[0].drug.name);
        });
        it("should get prescribed and active Drugorders with correct no of visits ", function () {
            expect(_treatmentService.getPrescribedDrugOrders).toHaveBeenCalledWith("patientUuid", true, 4, undefined, undefined);
        });
        it("should selectAllDrugs for print", function () {
            translate.instant.and.returnValue("Recent");
            initController();
            expect(scope.consultation.drugOrderGroups.length).toBe(3);

            scope.selectAllDrugs(scope.consultation.drugOrderGroups[0], 0);
            expect(Object.keys(scope.selectedDrugs).length).toBe(3);
            expect()
        })
        it("should not selectAllDrugs for print when auto select is not allowed", function () {
            translate.instant.and.returnValue("Recent");
            initController();
            expect(scope.consultation.drugOrderGroups.length).toBe(3);
            
            scope.autoSelectNotAllowed = true

            scope.selectAllDrugs(scope.consultation.drugOrderGroups[0], 0);
            expect(Object.keys(scope.selectedDrugs).length).toBe(0);
            expect()
        })

        it("should get prescribed and active Drugorders with correct number of visits", function () {
            expect(_treatmentService.getPrescribedDrugOrders).toHaveBeenCalledWith("patientUuid", true, 4, undefined, undefined);
        });

        it("should select all drugs for print", function () {
            translate.instant.and.returnValue("Recent");
            initController();
            expect(scope.consultation.drugOrderGroups.length).toBe(3);

            scope.selectAllDrugs(scope.consultation.drugOrderGroups[0], 0);
            expect(Object.keys(scope.selectedDrugs).length).toBe(3);
        });

        it("should not select all drugs for print when auto select is not allowed", function () {
            translate.instant.and.returnValue("Recent");
            initController();
            expect(scope.consultation.drugOrderGroups.length).toBe(3);

            scope.autoSelectNotAllowed = true;
            scope.selectAllDrugs(scope.consultation.drugOrderGroups[0], 0);
            expect(Object.keys(scope.selectedDrugs).length).toBe(0);
        });
    });

    it('should broadcast undoDiscontinueDrugOrder event on undoDiscontinue', function () {
        var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
        scope.undoDiscontinue(drugOrder);
        expect(rootScope.$broadcast).toHaveBeenCalledWith('event:undoDiscontinueDrugOrder', drugOrder);
    });

    describe('shouldBeDisabled', function () {
        it('should return true if drugOrder is being edited', function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
            drugOrder.isBeingEdited = true;
            expect(scope.shouldBeDisabled(drugOrder, {})).toBe(true);
        });

        it('should return true if drugOrder is not active', function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
            spyOn(drugOrder, 'isActive').and.returnValue(false);
            expect(scope.shouldBeDisabled(drugOrder, {})).toBe(true);
        });

        it('should return true if orderAttribute has an obsUuid', function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
            expect(scope.shouldBeDisabled(drugOrder, {obsUuid: 'some-uuid'})).toBe('some-uuid');
        });
    });

    describe('updateOrderAttribute', function () {
        it('should update the order attribute if it is not disabled', function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
            var orderAttribute = {};
            spyOn(scope, 'shouldBeDisabled').and.returnValue(false);
            spyOn(scope, 'toggleDrugOrderAttribute');
            scope.consultation.drugOrdersWithUpdatedOrderAttributes = {};
            scope.updateOrderAttribute(drugOrder, orderAttribute, true);
            expect(scope.toggleDrugOrderAttribute).toHaveBeenCalledWith(orderAttribute, true);
            expect(scope.consultation.drugOrdersWithUpdatedOrderAttributes[drugOrder.uuid]).toBe(drugOrder);
        });

        it('should not update the order attribute if it is disabled', function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
            var orderAttribute = {};
            spyOn(scope, 'shouldBeDisabled').and.returnValue(true);
            spyOn(scope, 'toggleDrugOrderAttribute');
            scope.consultation.drugOrdersWithUpdatedOrderAttributes = {};
            scope.updateOrderAttribute(drugOrder, orderAttribute, true);
            expect(scope.toggleDrugOrderAttribute).not.toHaveBeenCalled();
            expect(scope.consultation.drugOrdersWithUpdatedOrderAttributes[drugOrder.uuid]).toBeUndefined();
        });
    });

    describe('toggleDrugOrderAttribute', function () {
        it('should toggle the value of the order attribute if valueToSet is not provided', function () {
            var orderAttribute = {value: true};
            scope.toggleDrugOrderAttribute(orderAttribute);
            expect(orderAttribute.value).toBe(false);
        });

        it('should set the value of the order attribute to valueToSet if it is provided', function () {
            var orderAttribute = {value: true};
            scope.toggleDrugOrderAttribute(orderAttribute, false);
            expect(orderAttribute.value).toBe(false);
        });
    });

    it('should return order attributes from treatmentConfig', function () {
        treatmentConfig.orderAttributes = ['attr1', 'attr2'];
        expect(scope.getOrderAttributes()).toEqual(['attr1', 'attr2']);
    });

    describe("when conditionally enable or disable order reason text for drug stoppage", function () {
        it("should enable reason text only for configured reason concepts", function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
            Bahmni.ConceptSet.FormConditions.rules = {
                "Medication Stop Reason": function (drugOrder, conceptName) {
                    if (conceptName == "Adverse event") {
                        drugOrder.orderReasonNotesEnabled = true;
                        return true;
                    } else { return false; }
                }
            };
            drugOrder.orderReasonConcept = {name: {name: "Adverse event"}};
            scope.discontinue(drugOrder);

            expect(drugOrder.orderReasonNotesEnabled).toBe(true);
        });

        it("should disable reason text only for unconfigured reason concepts", function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
            Bahmni.ConceptSet.FormConditions.rules = {
                "Medication Stop Reason": function (drugOrder, conceptName) {
                    if (conceptName == "Adverse event") {
                        drugOrder.orderReasonNotesEnabled = true;
                        return true;
                    } else { return false; }
                }
            };
            drugOrder.orderReasonConcept = {name: {name: "Adverse event"}};
            scope.updateFormConditions(drugOrder);
            expect(drugOrder.orderReasonNotesEnabled).toBe(true);

            drugOrder.orderReasonConcept = {name: {name: "other event"}};
            scope.updateFormConditions(drugOrder);
            expect(drugOrder.orderReasonNotesEnabled).toBe(false);
        });

        it("should enable reason text for all concepts when nothing is configured", function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);

            drugOrder.orderReasonConcept = {name: {name: "Adverse event"}};
            scope.discontinue(drugOrder);

            expect(drugOrder.orderReasonNotesEnabled).toBe(true);
        });

        it("should enable reason text only for configured reason concepts", function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
            Bahmni.ConceptSet.FormConditions.rules = {
                "Medication Stop Reason": function (drugOrder, conceptName) {
                    if (conceptName == "Adverse event") {
                        drugOrder.orderReasonNotesEnabled = true;
                        return true;
                    } else {
                        return false;
                    }
                }
            };
            drugOrder.orderReasonConcept = {name: {name: "Adverse event"}};
            scope.discontinue(drugOrder);

            expect(drugOrder.orderReasonNotesEnabled).toBe(true);
        });

        it("should disable reason text only for unconfigured reason concepts", function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
            Bahmni.ConceptSet.FormConditions.rules = {
                "Medication Stop Reason": function (drugOrder, conceptName) {
                    if (conceptName == "Adverse event") {
                        drugOrder.orderReasonNotesEnabled = true;
                        return true;
                    } else {
                        return false;
                    }
                }
            };
            drugOrder.orderReasonConcept = {name: {name: "Adverse event"}};
            scope.updateFormConditions(drugOrder);
            expect(drugOrder.orderReasonNotesEnabled).toBe(true);

            drugOrder.orderReasonConcept = {name: {name: "other event"}};
            scope.updateFormConditions(drugOrder);
            expect(drugOrder.orderReasonNotesEnabled).toBe(false);
        });
    });

    it('should broadcast refillDrugOrder event on refill', function () {
        var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
        scope.refill(drugOrder);
        expect(rootScope.$broadcast).toHaveBeenCalledWith('event:refillDrugOrder', drugOrder);
    });

    it('should broadcast reviseDrugOrder event on revise', function () {
        var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
        scope.consultation.drugOrdersWithUpdatedOrderAttributes = {};
        scope.revise(drugOrder, prescribedDrugOrders);
        expect(rootScope.$broadcast).toHaveBeenCalledWith('event:reviseDrugOrder', drugOrder, prescribedDrugOrders);
    });

    it('should broadcast discontinueDrugOrder event on discontinue and update form conditions', function () {
        var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
        spyOn(scope, 'updateFormConditions');
        scope.discontinue(drugOrder);
        expect(rootScope.$broadcast).toHaveBeenCalledWith('event:discontinueDrugOrder', drugOrder);
        expect(scope.updateFormConditions).toHaveBeenCalled();
    });

    it('should broadcast refillDrugOrder event on refill', function () {
        var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
        scope.refill(drugOrder);
        expect(rootScope.$broadcast).toHaveBeenCalledWith('event:refillDrugOrder', drugOrder);
    });

    it('should broadcast reviseDrugOrder event on revise', function () {
        var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
        scope.consultation.drugOrdersWithUpdatedOrderAttributes = {};
        scope.revise(drugOrder, prescribedDrugOrders);
        expect(rootScope.$broadcast).toHaveBeenCalledWith('event:reviseDrugOrder', drugOrder, prescribedDrugOrders);
    });

    it('should broadcast discontinueDrugOrder event on discontinue and update form conditions', function () {
        var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
        spyOn(scope, 'updateFormConditions');
        scope.discontinue(drugOrder);
        expect(rootScope.$broadcast).toHaveBeenCalledWith('event:discontinueDrugOrder', drugOrder);
        expect(scope.updateFormConditions).toHaveBeenCalled();
    });

    describe("Min stop date", function () {
        it("should be same as start date of drug order if past drug", function () {
            var pastDrugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder);
            var minDate = scope.getMinDateForDiscontinue(pastDrugOrder);
            expect(minDate).toEqual(moment(pastDrugOrder.effectiveStartDate).format("YYYY-MM-DD"));
        });

        it("should be same as current date if scheduled drug", function () {
            var pastDrugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(scheduledOrder);
            var minDate = scope.getMinDateForDiscontinue(pastDrugOrder);
            expect(minDate).toEqual(moment().format("YYYY-MM-DD"));
        });
    });

    describe("sortOrderSetDrugsFollowedByDrugOrders", function () {
        it("should not return duplicate orderSet orders if orders are from previous visit", function () {
            var orderSetOrderFromPreviousVisit = {
                orderGroup: {
                    uuid: "orderGroupUuid",
                    orderSet: {}
                },
                "visit": {
                    "startDateTime": new Date("Wed Apr 09 2014 12:00:00 GMT+0530 (IST)"),
                    "uuid": "002efa33-4c4f-469f-968a-faedfe3a5e90"
                },
                "drug": {
                    "form": "Injection",
                    "uuid": "8d7e3dc0-f4ad-400c-9468-5a9e2b1f4230",
                    "strength": null,
                    "name": "Methylprednisolone 2ml"
                },
                "concept": {
                    "shortName": "Methylprednisolone 2ml"
                }
            };

            scope.consultation.activeAndScheduledDrugOrders = [
                Bahmni.Clinical.DrugOrderViewModel.createFromContract(orderSetOrderFromPreviousVisit)
            ];

            _treatmentService.getPrescribedDrugOrders.and.returnValue(
                specUtil.respondWithPromise($q, [orderSetOrderFromPreviousVisit])
            );

            visitHistory.activeVisit = {
                "startDateTime": new Date("Wed Apr 09 2014 12:54:21 GMT+0530 (IST)")
            };

            initController();
            expect(scope.consultation.drugOrderGroups[0].drugOrders.length).toBe(1);
        });
    });

    activeDrugOrder = {
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
            "shortName": "Methylprednisolone 200ml"
        },
        "provider": {name: "superman"}
    };

    prescribedDrugOrders = [
        activeDrugOrder,
        scheduledOrder,
        {
            "uuid": "drugOrder2Uuid",
            "action": "NEW",
            "careSetting": "Outpatient",
            "orderType": "Drug Order",
            "orderNumber": "ORD-3456",
            "autoExpireDate": 1397892379000,
            "scheduledDate": null,
            "dateStopped": null,
            "instructions": null,
            "visit": {
                "startDateTime": 1410349317000,
                "uuid": "002efa33-4c4f-469f-968a-faedfe3a5e0c"
            },
            "drug": {
                "form": "Tablet",
                "uuid": "42878383-488c-4f9a-8818-e82ce9f64006",
                "strength": null,
                "name": "Calcium + Vit D 500mg"
            },
            "dosingInstructions": {
                "doseUnits": "Tablet",
                "dose": 1,
                "quantity": null,
                "route": null,
                "frequency": null,
                "asNeeded": null,
                "quantityUnits": null,
                "administrationInstructions": null,
                "numberOfRefills": null
            },
            "durationUnits": null,
            "dateActivated": 1397028379000,
            "commentToFulfiller": null,
            "effectiveStartDate": 1410322624001,
            "effectiveStopDate": 1397892379000,
            "orderReasonConcept": null,
            "dosingInstructionType": "org.openmrs.FreeTextDosingInstructions",
            "previousOrderUuid": null,
            "orderReasonText": null,
            "duration": 10,
            "concept": {
                "shortName": "Methylprednisolone 2ml"
            },
            "provider": {name: "superman"}
        }];
});

describe("DrugOrderHistoryControllerIPD", function () {

    beforeEach(module('bahmni.clinical'));

    var scope, prescribedDrugOrders, activeDrugOrder, updateDrugOrder, _treatmentService,
        retrospectiveEntryService, appService, rootScope, visitHistory, allergyService;
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var treatmentConfig = {
        drugOrderHistoryConfig: {
            numberOfVisits: 4
        }
    };

    var translate;
    beforeEach(module(function ($provide) {
        translate = jasmine.createSpyObj('$translate', ['instant']);
        $provide.value('$translate', translate);
        $provide.value('appService', appService);
    }));

    var $q, $controller, spinner;
    beforeEach(inject(function (_$controller_, $rootScope, _$q_) {
        $q = _$q_;
        $controller = _$controller_;
        _treatmentService = jasmine.createSpyObj('treatmentService', ['getPrescribedDrugOrders', 'getMedicationSchedulesForOrders']);
        _treatmentService.getPrescribedDrugOrders.and.callFake(function () {
            return specUtil.respondWithPromise($q, prescribedDrugOrders);
        });
        _treatmentService.getMedicationSchedulesForOrders.and.callFake(function () {
            return specUtil.respondWithPromise($q, []);
        });
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function (config) {
                return false;
            }
        });
        allergyService = jasmine.createSpyObj('allergyService', ['getAllergyForPatient']);

        rootScope = $rootScope;
        spyOn($rootScope, '$broadcast');
        $rootScope.visit = { startDate: 1410322624000 };
        scope = $rootScope.$new();
        scope.consultation = {
            preSaveHandler: new Bahmni.Clinical.Notifier(), discontinuedDrugs: [],
            activeAndScheduledDrugOrders: [Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder)]
        };
        scope.currentBoard = { extensionParams: {} };

        var retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(Date.now());
        retrospectiveEntryService = jasmine.createSpyObj('retrospectiveEntryService', ['getRetrospectiveEntry']);
        retrospectiveEntryService.getRetrospectiveEntry.and.returnValue(retrospectiveEntry);
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        visitHistory = {};
    }));

    var initController = function () {
        $controller('DrugOrderHistoryController', {
            $scope: scope,
            $translate: translate,
            activeDrugOrders: [activeDrugOrder],
            treatmentService: _treatmentService,
            retrospectiveEntryService: retrospectiveEntryService,
            $stateParams: { patientUuid: "patientUuid" },
            visitContext: {},
            spinner: spinner,
            visitHistory: visitHistory,
            treatmentConfig: treatmentConfig,
            appService: appService,
            allergyService: allergyService
        });
        rootScope.$apply();
    };

    beforeEach(initController);

    describe("DrugOrderTypeUpdate", function () {
        it("should update drug order type", function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder);
            scope.updateOrderType(drugOrder);
            expect(rootScope.$broadcast).toHaveBeenCalled();
        });
    });

    activeDrugOrder = {
        "uuid": "scheduledOrderUuid",
        "action": "NEW",
        "careSetting": "outPatient",
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
            "shortName": "Methylprednisolone 200ml"
        },
        "provider": { name: "superman" }
    };

    updateDrugOrder = {
        "uuid": "scheduledOrderUuid",
        "action": "NEW",
        "careSetting": "inPatient",
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
            "shortName": "Methylprednisolone 200ml"
        },
        "provider": { name: "superman" }
    };

    prescribedDrugOrders = [
        activeDrugOrder,
        {
            "uuid": "drugOrder2Uuid",
            "action": "NEW",
            "careSetting": "Outpatient",
            "orderType": "Drug Order",
            "orderNumber": "ORD-3456",
            "autoExpireDate": 1397892379000,
            "scheduledDate": null,
            "dateStopped": null,
            "instructions": null,
            "visit": {
                "startDateTime": 1410349317000,
                "uuid": "002efa33-4c4f-469f-968a-faedfe3a5e0c"
            },
            "drug": {
                "form": "Tablet",
                "uuid": "42878383-488c-4f9a-8818-e82ce9f64006",
                "strength": null,
                "name": "Calcium + Vit D 500mg"
            },
            "dosingInstructions": {
                "doseUnits": "Tablet",
                "dose": 1,
                "quantity": null,
                "route": null,
                "frequency": null,
                "asNeeded": null,
                "quantityUnits": null,
                "administrationInstructions": null,
                "numberOfRefills": null
            },
            "durationUnits": null,
            "dateActivated": 1397028379000,
            "commentToFulfiller": null,
            "effectiveStartDate": 1410322624001,
            "effectiveStopDate": 1397892379000,
            "orderReasonConcept": null,
            "dosingInstructionType": "org.openmrs.FreeTextDosingInstructions",
            "previousOrderUuid": null,
            "orderReasonText": null,
            "duration": 10,
            "concept": {
                "shortName": "Methylprednisolone 2ml"
            },
            "provider": { name: "superman" }
        }];
});
