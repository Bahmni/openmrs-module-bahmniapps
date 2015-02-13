'use strict';

describe("DrugOrderHistoryController", function () {

    beforeEach(module('bahmni.clinical'));

    var scope, prescribedDrugOrders, activeDrugOrder, _treatmentService, clinicalAppConfigService, retrospectiveEntryService;
    var fetchActiveTreatmentsDeferred;
    var DateUtil = Bahmni.Common.Util.DateUtil;

    beforeEach(module(function ($provide) {
        $provide.value('$q', Q);
        fetchActiveTreatmentsDeferred = Q.defer();

        _treatmentService = jasmine.createSpyObj('TreatmentService', ['getActiveDrugOrders']);
        _treatmentService.getActiveDrugOrders.and.callFake(function () {
            fetchActiveTreatmentsDeferred.resolve();
            return specUtil.respondWith([activeDrugOrder, scheduledOrder]);
        });
    }));

    beforeEach(inject(function ($controller, $rootScope) {
        $rootScope.visit = {startDate: 1410322624000};
        scope = $rootScope.$new();
        scope.consultation = {saveHandler: new Bahmni.Clinical.SaveHandler()};
        scope.currentBoard = {extensionParams: {}};
        clinicalAppConfigService = jasmine.createSpyObj('clinicalAppConfigService', ['getDrugOrderConfig']);
        clinicalAppConfigService.getDrugOrderConfig.and.returnValue([]);

        var retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(Date.now());
        retrospectiveEntryService = jasmine.createSpyObj('retrospectiveEntryService', ['getRetrospectiveEntry']);
        retrospectiveEntryService.getRetrospectiveEntry.and.returnValue(retrospectiveEntry);
         var spinner = jasmine.createSpyObj('spinner', ['forPromise']);


        $controller('DrugOrderHistoryController', {
            $scope: scope,
            prescribedDrugOrders: prescribedDrugOrders,
            TreatmentService: _treatmentService,
            clinicalAppConfigService: clinicalAppConfigService,
            retrospectiveEntryService: retrospectiveEntryService,
            $stateParams: {patientUuid: "patientUuid"},
            visitContext: {},
            spinner : spinner
        });
    }));

    describe("when initialized", function () {
        it("should setup scope variables", function (done) {
            fetchActiveTreatmentsDeferred.promise.then().then(function(){
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

                done();
            });
        });
    });

    describe("when discontinued", function () {
        it("should mark the drug order for discontinue", function () {

            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);

            scope.discontinue(drugOrder);

            expect(drugOrder.isMarkedForDiscontinue).toBe(true);
        });

        it("should add the drugOrder to removableDrugOrders", function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);

            scope.discontinue(drugOrder);

            expect(scope.consultation.discontinuedDrugs[0]).toBe(drugOrder);
        });
    });

    describe("when undo removing", function () {
        it("should change the action to new", function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);

            scope.discontinue(drugOrder);
            scope.undoDiscontinue(drugOrder);

            expect(drugOrder.isMarkedForDiscontinue).toBe(false);
        });

        it("should discontinue the drugOrder from removableDrugOrders", function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);

            scope.discontinue(drugOrder);
            scope.undoDiscontinue(drugOrder);

            expect(0).toBe(scope.consultation.discontinuedDrugs.length);
        });

        it("should discontinue the proper drugOrder from removableDrugOrders", function (done) {
            var drugOrder1 = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[0]);
            var drugOrder2 = Bahmni.Clinical.DrugOrderViewModel.createFromContract(prescribedDrugOrders[1]);

            scope.discontinue(drugOrder1);
            scope.discontinue(drugOrder2);

            fetchActiveTreatmentsDeferred.promise.then(function () {

                expect(2).toBe(scope.consultation.discontinuedDrugs.length);

                scope.undoDiscontinue(drugOrder2);

                expect(1).toBe(scope.consultation.discontinuedDrugs.length);
                expect(drugOrder1).toBe(scope.consultation.discontinuedDrugs[0]);
                done();
            });
        })
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
            "provider": {name: "superman"}
        }];
});