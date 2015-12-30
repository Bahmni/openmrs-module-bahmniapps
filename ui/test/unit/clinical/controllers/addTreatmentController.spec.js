'use strict';

describe("AddTreatmentController", function () {

    beforeEach(module('bahmni.common.uiHelper'));
    beforeEach(module('bahmni.clinical'));
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


    var scope, rootScope, contextChangeHandler, newTreatment,
        editTreatment, clinicalAppConfigService, ngDialog, drugService, defaultDrugs,
        encounterDateTime, appService, appConfig, defaultDrugsPromise;
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        encounterDateTime = moment("2014-03-02").toDate();
        scope.consultation = {preSaveHandler: new Bahmni.Clinical.Notifier(), encounterDateTime: encounterDateTime};
        var now = DateUtil.now();
        ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);
        spyOn(Bahmni.Common.Util.DateUtil, 'now').and.returnValue(now);
        newTreatment = new Bahmni.Clinical.DrugOrderViewModel({}, {}, {}, encounterDateTime);
        editTreatment = new Bahmni.Clinical.DrugOrderViewModel(null, null);
        scope.currentBoard = {extension: {}, extensionParams: {}};
        contextChangeHandler = jasmine.createSpyObj('contextChangeHandler', ['add']);
        scope.addForm = {$invalid: false, $valid: true};

        clinicalAppConfigService = jasmine.createSpyObj('clinicalAppConfigService', ['getTreatmentActionLink', 'getDrugOrderConfig']);
        clinicalAppConfigService.getTreatmentActionLink.and.returnValue([]);
        clinicalAppConfigService.getDrugOrderConfig.and.returnValue({});
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appConfig = jasmine.createSpyObj('appConfig', ['getConfig', 'getConfigForPage']);
        appConfig.getConfigForPage.and.returnValue({
            "conceptNameForDefaultDrugs": "All TB Drugs"
        });

        drugService = jasmine.createSpyObj('drugService', ['getSetMembersOfConcept']);
        defaultDrugs = [
            {name: "T", dosageForm: {display: "something"}, uuid: "123-12321"},
            {name: "A", dosageForm: {display: "something"}, uuid: "123-12321"},
            {name: "P", dosageForm: {display: "something"}, uuid: "123-12321"}
        ];
        defaultDrugsPromise = specUtil.respondWith(defaultDrugs);
        drugService.getSetMembersOfConcept.and.returnValue(defaultDrugsPromise);

        appService.getAppDescriptor.and.returnValue(appConfig);

        $controller('AddTreatmentController', {
            $scope: scope,
            $rootScope: rootScope,
            treatmentService: null,
            activeDrugOrders : [activeDrugOrder, scheduledOrder],
            contextChangeHandler: contextChangeHandler,
            clinicalAppConfigService: clinicalAppConfigService,
            ngDialog: ngDialog,
            appService: appService,
            DrugService: drugService,
            treatmentConfig: {
                durationUnits: [
                    {name: "Day(s)", factor: 1},
                    {name: "Week(s)", factor: 7},
                    {name: "Month(s)", factor: 30}
                ]}
        });
    }));

    describe("drug service initialization", function() {
        it("calls drugService to find all default drugs", function(done) {
            defaultDrugsPromise.then(function() {
                expect(scope.defaultDrugs.length).toBe(defaultDrugs.length);
                done();
            });
        });
    });

    describe("add treatment()", function(){
        it("should save as a free text drug order on click of accept button", function(){
            var treatment = {drugNameDisplay : "Some New Drug", drug: {name : "CodedDrug"}};
            scope.treatment = treatment;
            scope.onAccept();
            expect(scope.treatment.selectedItem).toBeFalsy();
            expect(scope.treatment.drug).toBeUndefined();
            expect(scope.treatment.isNonCodedDrug).toBe(true);
            expect(scope.treatment.drugNonCoded).toBe(treatment.drugNameDisplay);
        })

        it("should save as a coded-drug after the entered free text drug is edited to coded", function(){
            var treatment = {drugNameDisplay : "Some New Drug", drug: {name : "CodedDrug"}};
            scope.treatment = treatment;
            treatment.changeDrug = jasmine.createSpy(treatment,'changeDrug');

            scope.onSelect({
                drug : {
                    name:"CodedDrug",
                    uuid:"CodedDrugUuid",
                    dosageForm: {
                        display: "Once"
                    }
                }
            });

            scope.onChange();
            expect(treatment.changeDrug).toHaveBeenCalledWith({
                name:"CodedDrug",
                form:"Once",
                uuid:"CodedDrugUuid"
            });

            expect(scope.treatment.selectedItem).toBeUndefined();
        });

        it("should remove the added coded-drug on changing the drug name", function () {
            var treatment = {drugNameDisplay : "Some New Drug", drug: {name : "CodedDrug"}};
            scope.treatment=treatment;

            scope.onChange();

            expect(scope.treatment).toEqual({
                drugNameDisplay : "Some New Drug"
            });
        })
    });


    describe("add()", function () {
        it("adds treatment object to list of treatments", function () {
            var treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {drug: {name: true}});
            scope.treatment = treatment;
            scope.add();
            expect(scope.treatments.length).toBe(1);
            expect(scope.treatments[0]).toBe(treatment);
        });

        it("should empty treatment", function () {
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {drug: {name: true}});
            scope.add();
            expect(scope.treatment.drug).toBeFalsy();
        });

        it("clears existing treatment object", function () {
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {drug: {name: true}});
            scope.add();
            expect(scope.treatment.drug).toBeFalsy();
        });

        it("should set auto focus on drug name", function () {
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {drug: {name: true}});
            scope.add();
            expect(scope.startNewDrugEntry).toBeTruthy();
        });

        it("should not allow to add new order if there is already existing order", function () {
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                drug: {name: "abc"},
                effectiveStartDate: "2011-11-26",
                durationInDays: 2
            });
            scope.consultation.activeAndScheduledDrugOrders = [Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                drug: {name: "abc"},
                effectiveStartDate: "2011-11-26",
                durationInDays: 2,
                effectiveStopDate: "2011-11-28",
                uuid: "abcdef"
            })];
            expect(scope.treatments.length).toEqual(0);
            scope.add();
            expect(scope.treatments.length).toEqual(0);
            expect(ngDialog.open).toHaveBeenCalled();
        });
        it("should allow to add new drug order if new order is scheduled to start on same day as stop date of already existing order", function () {
            scope.consultation.activeAndScheduledDrugOrders = [Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                drug: {
                    name: "abc",
                    uuid: "123"
                },
                effectiveStartDate: DateUtil.parse("2014-12-02"),
                effectiveStopDate: DateUtil.parse("2014-12-04"),
                durationInDays: 2,
                uuid: "abcdef"
            })];
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                drug: {name: "abc", uuid: "123"},
                effectiveStartDate: DateUtil.parse("2014-12-04"),
                effectiveStopDate: DateUtil.parse("2014-12-06"),
                durationInDays: 2
            });
            expect(scope.treatments.length).toEqual(0);

            scope.add();
            expect(scope.treatments.length).toEqual(1);
            expect(scope.treatments[0].effectiveStartDate.getTime() == DateUtil.addSeconds("2014-12-04", 1).getTime()).toBeTruthy();
        });

        it("should allow to add new drug order if new order is scheduled to end on same day as start date of already existing order", function () {
            scope.consultation.activeAndScheduledDrugOrders = [Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                drug: {
                    name: "abc",
                    uuid: "123"
                },
                effectiveStartDate: DateUtil.parse("2014-12-02"),
                effectiveStopDate: DateUtil.parse("2014-12-04"),
                durationInDays: 2,
                uuid: "abcdef"
            })];
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                drug: {name: "abc", uuid: "123"},
                effectiveStartDate: DateUtil.parse("2014-11-30"),
                effectiveStopDate: DateUtil.parse("2014-12-02"),
                durationInDays: 2
            });
            expect(scope.treatments.length).toEqual(0);

            scope.add();
            expect(scope.treatments.length).toEqual(1);
            expect(scope.treatments[0].effectiveStopDate.getTime() == DateUtil.subtractSeconds("2014-12-02", 1).getTime()).toBeTruthy();
        });
        it("should allow to add new drug order if new order is scheduled to end on same day as start date of unsaved order", function () {
            scope.treatments = [Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                drug: {
                    name: "abc",
                    uuid: "123"
                },
                effectiveStartDate: DateUtil.parse("2014-12-02"),
                effectiveStopDate: DateUtil.parse("2014-12-04"),
                durationInDays: 2
            })];
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                drug: {name: "abc", uuid: "123"},
                effectiveStartDate: DateUtil.parse("2014-11-30"),
                effectiveStopDate: DateUtil.parse("2014-12-02"),
                durationInDays: 2
            });
            expect(scope.treatments.length).toEqual(1);

            scope.add();
            expect(scope.treatments.length).toEqual(2);
            var drugOrderToBeSaved = scope.treatments.filter(function (treatment) {
                return DateUtil.isSameDate(treatment.effectiveStartDate, "2014-11-30")
            })[0];
            expect(DateUtil.isSameDateTime(drugOrderToBeSaved.effectiveStopDate, DateUtil.subtractSeconds("2014-12-02", 1))).toBeTruthy();
        });

        it("should replace a drug order being edited in the same index it was originally in", function () {
            scope.treatments = [Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                drug: {
                    name: "abc",
                    uuid: "123"
                }
            }),
                Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "def",
                        uuid: "1234"
                    }
                }),
                Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "ghi",
                        uuid: "12345"
                    }
                })
            ];
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                drug: {name: "abc", uuid: "123"},
                isBeingEdited: true
            });
            expect(scope.treatments.length).toEqual(3);

            scope.add();
            expect(scope.treatments.length).toEqual(3);
            expect(scope.treatments[0].drug.name).toEqual("abc");
            expect(scope.treatments[1].drug.name).toEqual("def");
            expect(scope.treatments[2].drug.name).toEqual("ghi");
        });
    });
    describe("Detect Overlapping orders amongst new orders on Save", function () {

        describe("should allow potentially overlapping order whose dates can be set and be resolved", function () {

            var encounterDate = DateUtil.parse("2014-12-02");

            it("new drug orders for dates 2-4 and 5-6 and 4-5 in this order", function () {
                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [],
                    {
                        drug: {name: "abc", uuid: "123"},
                        effectiveStartDate: DateUtil.parse("2014-12-02"),
                        effectiveStopDate: DateUtil.parse("2014-12-04"),
                        durationInDays: 2
                    },
                    encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [],
                    {
                        drug: {name: "abc", uuid: "123"},
                        effectiveStartDate: DateUtil.parse("2014-12-05"),
                        effectiveStopDate: DateUtil.parse("2014-12-06"),
                        durationInDays: 1
                    },
                    encounterDate);
                var dec4_dec5order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [],
                    {
                        drug: {name: "abc", uuid: "123"},
                        effectiveStartDate: DateUtil.parse("2014-12-04"),
                        effectiveStopDate: DateUtil.parse("2014-12-05"),
                        durationInDays: 1
                    },
                    encounterDate);

                scope.treatment = dec2_dec4order;
                expect(scope.treatments.length).toEqual(0);
                scope.add();

                expect(scope.treatment).not.toEqual(dec2_dec4order);
                expect(scope.treatments.length).toEqual(1);
                var dec2_dec4orderAfterSave = scope.treatments[0];
                expect(DateUtil.isSameDateTime(dec2_dec4orderAfterSave.effectiveStartDate, DateUtil.parse("2014-12-02"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec2_dec4orderAfterSave.effectiveStopDate, DateUtil.parse("2014-12-04"))).toBeTruthy();
                expect(dec2_dec4orderAfterSave.scheduledDate).toEqual(dec2_dec4orderAfterSave.effectiveStartDate);
                expect(dec2_dec4orderAfterSave.autoExpireDate).toBeUndefined();

                scope.treatment = dec5_dec6order;
                scope.add();

                expect(scope.treatment).not.toEqual(dec5_dec6order);
                expect(scope.treatments.length).toEqual(2);
                var dec5_dec6orderAfterSave = scope.treatments.filter(function (treatment) {
                    return DateUtil.isSameDate(treatment.effectiveStartDate, "2014-12-05")
                })[0];

                expect(DateUtil.isSameDateTime(dec5_dec6orderAfterSave.effectiveStartDate, DateUtil.parse("2014-12-05"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec5_dec6orderAfterSave.effectiveStopDate, DateUtil.parse("2014-12-06"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec5_dec6orderAfterSave.scheduledDate, DateUtil.parse("2014-12-05"))).toBeTruthy();
                expect(dec5_dec6orderAfterSave.autoExpireDate).toBeUndefined();

                scope.treatment = dec4_dec5order;
                scope.add();

                expect(scope.treatment).not.toEqual(dec4_dec5order);
                expect(scope.treatments.length).toEqual(3);
                var dec4_dec5orderAfterSave = scope.treatments.filter(function (treatment) {
                    return DateUtil.isSameDate(treatment.effectiveStartDate, "2014-12-04")
                })[0];

                expect(DateUtil.isSameDateTime(dec4_dec5orderAfterSave.effectiveStartDate, DateUtil.parse("2014-12-04"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec4_dec5orderAfterSave.effectiveStopDate, DateUtil.subtractSeconds("2014-12-05", 1))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec4_dec5orderAfterSave.scheduledDate, DateUtil.parse("2014-12-04"))).toBeTruthy();
                expect(dec4_dec5orderAfterSave.autoExpireDate).toBeUndefined();
            });

            it("new drug orders for dates 2-4 and 4-5 and 5-6 in this order", function () {
                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [],
                    {
                        drug: {name: "abc", uuid: "123"},
                        effectiveStartDate: DateUtil.parse("2014-12-02"),
                        effectiveStopDate: DateUtil.parse("2014-12-04"),
                        durationInDays: 2
                    },
                    encounterDate);
                var dec4_dec5order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [],
                    {
                        drug: {name: "abc", uuid: "123"},
                        effectiveStartDate: DateUtil.parse("2014-12-04"),
                        effectiveStopDate: DateUtil.parse("2014-12-05"),
                        durationInDays: 1
                    },
                    encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [],
                    {
                        drug: {name: "abc", uuid: "123"},
                        effectiveStartDate: DateUtil.parse("2014-12-05"),
                        effectiveStopDate: DateUtil.parse("2014-12-06"),
                        durationInDays: 1
                    },
                    encounterDate);

                scope.treatment = dec2_dec4order;
                expect(scope.treatments.length).toEqual(0);
                scope.add();

                expect(scope.treatment).not.toEqual(dec2_dec4order);
                expect(scope.treatments.length).toEqual(1);
                var dec2_dec4orderAfterSave = scope.treatments[0];
                expect(DateUtil.isSameDateTime(dec2_dec4orderAfterSave.effectiveStartDate, DateUtil.parse("2014-12-02"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec2_dec4orderAfterSave.effectiveStopDate, DateUtil.parse("2014-12-04"))).toBeTruthy();
                expect(dec2_dec4orderAfterSave.scheduledDate).toEqual(dec2_dec4orderAfterSave.effectiveStartDate);
                expect(dec2_dec4orderAfterSave.autoExpireDate).toBeUndefined();

                scope.treatment = dec4_dec5order;
                scope.add();

                expect(scope.treatment).not.toEqual(dec4_dec5order);
                expect(scope.treatments.length).toEqual(2);
                var dec4_dec5orderAfterSave = scope.treatments.filter(function (treatment) {
                    return DateUtil.isSameDate(treatment.effectiveStartDate, "2014-12-04")
                })[0];

                expect(DateUtil.isSameDateTime(dec4_dec5orderAfterSave.effectiveStartDate, DateUtil.parse("2014-12-04"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec4_dec5orderAfterSave.effectiveStopDate, DateUtil.parse("2014-12-05"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec4_dec5orderAfterSave.scheduledDate, DateUtil.parse("2014-12-04"))).toBeTruthy();
                expect(dec4_dec5orderAfterSave.autoExpireDate).toBeUndefined();

                scope.treatment = dec5_dec6order;
                scope.add();

                expect(scope.treatment).not.toEqual(dec5_dec6order);
                expect(scope.treatments.length).toEqual(3);
                var dec5_dec6orderAfterSave = scope.treatments.filter(function (treatment) {
                    return DateUtil.isSameDate(treatment.effectiveStartDate, "2014-12-05")
                })[0];

                expect(DateUtil.isSameDateTime(dec5_dec6orderAfterSave.effectiveStartDate, DateUtil.parse("2014-12-05"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec5_dec6orderAfterSave.effectiveStopDate, DateUtil.parse("2014-12-06"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec5_dec6orderAfterSave.scheduledDate, DateUtil.parse("2014-12-05"))).toBeTruthy();
                expect(dec5_dec6orderAfterSave.autoExpireDate).toBeUndefined();
            });

            it("new scheduled drug orders for dates 2-4 and 5-6 and 4-5 in this order with past encounter date", function () {
                var newEncounterDate = DateUtil.parse("2014-11-02");
                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [],
                    {
                        drug: {name: "abc", uuid: "123"},
                        effectiveStartDate: DateUtil.parse("2014-12-02"),
                        effectiveStopDate: DateUtil.parse("2014-12-04"),
                        durationInDays: 2
                    },
                    newEncounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [],
                    {
                        drug: {name: "abc", uuid: "123"},
                        effectiveStartDate: DateUtil.parse("2014-12-05"),
                        effectiveStopDate: DateUtil.parse("2014-12-06"),
                        durationInDays: 1
                    },
                    newEncounterDate);
                var dec4_dec5order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [],
                    {
                        drug: {name: "abc", uuid: "123"},
                        effectiveStartDate: DateUtil.parse("2014-12-04"),
                        effectiveStopDate: DateUtil.parse("2014-12-05"),
                        durationInDays: 1
                    },
                    newEncounterDate);

                scope.treatment = dec2_dec4order;
                expect(scope.treatments.length).toEqual(0);
                scope.add();

                expect(scope.treatment).not.toEqual(dec2_dec4order);
                expect(scope.treatments.length).toEqual(1);
                var dec2_dec4orderAfterSave = scope.treatments[0];
                expect(DateUtil.isSameDateTime(dec2_dec4orderAfterSave.effectiveStartDate, DateUtil.parse("2014-12-02"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec2_dec4orderAfterSave.effectiveStopDate, DateUtil.parse("2014-12-04"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec2_dec4orderAfterSave.scheduledDate, DateUtil.parse("2014-12-02"))).toBeTruthy();
                expect(dec2_dec4orderAfterSave.autoExpireDate).toBeUndefined();

                scope.treatment = dec5_dec6order;
                scope.add();

                expect(scope.treatment).not.toEqual(dec5_dec6order);
                expect(scope.treatments.length).toEqual(2);
                var dec5_dec6orderAfterSave = scope.treatments.filter(function (treatment) {
                    return DateUtil.isSameDate(treatment.effectiveStartDate, "2014-12-05")
                })[0];

                expect(DateUtil.isSameDateTime(dec5_dec6orderAfterSave.effectiveStartDate, DateUtil.parse("2014-12-05"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec5_dec6orderAfterSave.effectiveStopDate, DateUtil.parse("2014-12-06"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec5_dec6orderAfterSave.scheduledDate, DateUtil.parse("2014-12-05"))).toBeTruthy();
                expect(dec5_dec6orderAfterSave.autoExpireDate).toBeUndefined();

                scope.treatment = dec4_dec5order;
                scope.add();

                expect(scope.treatment).not.toEqual(dec4_dec5order);
                expect(scope.treatments.length).toEqual(3);
                var dec4_dec5orderAfterSave = scope.treatments.filter(function (treatment) {
                    return DateUtil.isSameDate(treatment.effectiveStartDate, "2014-12-04")
                })[0];

                expect(DateUtil.isSameDateTime(dec4_dec5orderAfterSave.effectiveStartDate, DateUtil.parse("2014-12-04"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec4_dec5orderAfterSave.effectiveStopDate, DateUtil.subtractSeconds("2014-12-05", 1))).toBeTruthy();
                expect(DateUtil.isSameDateTime(dec4_dec5orderAfterSave.scheduledDate, DateUtil.parse("2014-12-04"))).toBeTruthy();
                expect(dec4_dec5orderAfterSave.autoExpireDate).toBeUndefined();
            });

        });

        describe("should allow potentially overlapping order whose dates can be set and be resolved", function () {
            var encounterDate = DateUtil.parse("2014-12-02");

            it("existing drug orders for dates 2-3 and 3-4 and revised drug order for 2-3", function () {
                var dec2_dec3order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02 10:00:00"),
                    effectiveStopDate: DateUtil.parse("2014-12-03 09:59:59"),
                    encounterDate: encounterDate,
                    durationInDays: 1,
                    duration: 1,
                    uuid: 'some-uuid'
                }, encounterDate);
                var dec3_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-03 10:00:00"),
                    encounterDate: encounterDate,
                    effectiveStopDate: DateUtil.parse("2014-12-04 09:59:59"),
                    durationInDays: 1
                }, encounterDate);
                scope.consultation.activeAndScheduledDrugOrders = [dec2_dec3order, dec3_dec4order];

                expect(scope.treatments.length).toEqual(0);

                scope.revise(dec2_dec3order, scope.consultation.activeAndScheduledDrugOrders);
                expect(dec2_dec3order.isBeingEdited).toBeTruthy();
                dec2_dec3order.effectiveStartDate = DateUtil.parse("2014-12-02 11:00:00");
                scope.add();

                expect(scope.treatments.length).toEqual(1);

                expect(DateUtil.isSameDateTime(scope.treatments[0].autoExpireDate, DateUtil.subtractSeconds("2014-12-03 10:00:00", 1))).toBeTruthy();
            });

            it("existing drug orders 4-5 and new drug order 2-4(starting today)", function(){
                var dec4_dec5order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-04 00:00:00"),
                    effectiveStopDate: DateUtil.parse("2014-12-04 23:59:59"),
                    durationInDays: 1,
                    uuid: 123
                }, encounterDate);

                scope.consultation.activeAndScheduledDrugOrders = [dec4_dec5order];

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: encounterDate,
                    encounterDate: encounterDate,
                    durationInDays: 2
                }, encounterDate);
                scope.treatment = dec2_dec4order;
                scope.add();
                expect(scope.treatments.length).toEqual(1);
                expect(DateUtil.isSameDateTime(dec2_dec4order.autoExpireDate, DateUtil.subtractSeconds("2014-12-04 00:00:00", 1))).toBeTruthy();

            })
        });

        describe("should not allow overlapping order", function () {
            var encounterDate = DateUtil.parse("2014-12-02");

            it("new orders for dates 2-4 and 3-6", function () {

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);
                scope.treatment = dec2_dec4order;
                scope.add();
                expect(scope.treatments.length).toEqual(1);

                var dec3_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-03"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatment = dec3_dec6order;
                scope.add();

                expect(scope.treatments.length).toEqual(1);
                expect(ngDialog.open).toHaveBeenCalled();
            });

            it("new orders for dates 2-4 and 5-6 and 4-6", function () {
                var encounterDate = DateUtil.parse("2014-12-02");

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);

                scope.treatment = dec2_dec4order;
                scope.add();
                expect(scope.treatments.length).toEqual(1);

                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);

                scope.treatment = dec5_dec6order;
                scope.add();
                expect(scope.treatments.length).toEqual(2);

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-04"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 2
                }, encounterDate);

                scope.treatment = overlappingOrder;
                scope.add();
                expect(scope.treatments.length).toEqual(2);
                expect(ngDialog.open).toHaveBeenCalled();
            });

            it("new orders for 2-4 and 5-6 and 3-4", function () {
                var encounterDate = DateUtil.parse("2014-12-02");
                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);

                scope.treatment = dec2_dec4order;
                scope.add();
                expect(scope.treatments.length).toEqual(1);

                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);

                scope.treatment = dec5_dec6order;
                scope.add();
                expect(scope.treatments.length).toEqual(2);

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-03"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 1
                });
                scope.treatment = overlappingOrder;
                scope.add();
                expect(scope.treatments.length).toEqual(2);
                expect(ngDialog.open).toHaveBeenCalled();
            });

            it("new orders for dates 2-4 and 5-6 and 5-6", function () {
                var encounterDate = DateUtil.parse("2014-12-02");

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);

                scope.treatment = dec2_dec4order;
                scope.add();
                expect(scope.treatments.length).toEqual(1);

                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);

                scope.treatment = dec5_dec6order;
                scope.add();
                expect(scope.treatments.length).toEqual(2);


                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatment = overlappingOrder;
                scope.add();
                expect(scope.treatments.length).toEqual(2);
                expect(ngDialog.open).toHaveBeenCalled();
            });

            it("new orders for dates 2-4 and 5-6 and 2-4", function () {
                var encounterDate = DateUtil.parse("2014-12-02");

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);

                scope.treatment = dec2_dec4order;
                scope.add();
                expect(scope.treatments.length).toEqual(1);

                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);

                scope.treatment = dec5_dec6order;
                scope.add();
                expect(scope.treatments.length).toEqual(2);

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 1
                }, encounterDate);

                scope.treatment = overlappingOrder;
                scope.add();
                expect(scope.treatments.length).toEqual(2);
                expect(ngDialog.open).toHaveBeenCalled();
            });
        });
    });

    describe("Detect Overlapping orders with existing Orders on Save", function () {

        describe("should allow potentially overlapping order whose dates can be set and be resolved", function () {
            var encounterDate = DateUtil.parse("2014-12-02");

            it("existing drug orders for dates 2-4 and 5-6 and new drug order for 4-5", function () {
                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatments = [dec2_dec4order, dec5_dec6order];

                var nonOverlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-04"),
                    effectiveStopDate: DateUtil.parse("2014-12-05"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatment = nonOverlappingOrder;

                expect(scope.treatments.length).toEqual(2);
                scope.add();
                expect(scope.treatments.length).toEqual(3);
                var drugOrderToBeSaved = scope.treatments.filter(function (treatment) {
                    return DateUtil.isSameDate(treatment.effectiveStartDate, "2014-12-04")
                })[0];

                expect(DateUtil.isSameDateTime(drugOrderToBeSaved.effectiveStartDate, DateUtil.parse("2014-12-04"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(drugOrderToBeSaved.effectiveStopDate, DateUtil.subtractSeconds("2014-12-05", 1))).toBeTruthy();
                expect(DateUtil.isSameDateTime(drugOrderToBeSaved.scheduledDate, DateUtil.parse("2014-12-04"))).toBeTruthy();
                expect(drugOrderToBeSaved.autoExpireDate).toBeUndefined();
            });

            it("existing drug orders for dates 2-4 and 5-6 and new drug order for 6-7", function () {
                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatments = [dec2_dec4order, dec5_dec6order];

                var nonOverlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-06"),
                    effectiveStopDate: DateUtil.parse("2014-12-07"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatment = nonOverlappingOrder;

                expect(scope.treatments.length).toEqual(2);
                scope.add();
                expect(scope.treatments.length).toEqual(3);
                var drugOrderToBeSaved = scope.treatments.filter(function (treatment) {
                    return DateUtil.isSameDate(treatment.effectiveStartDate, "2014-12-06")
                })[0];
                expect(DateUtil.isSameDateTime(drugOrderToBeSaved.effectiveStartDate, DateUtil.parse("2014-12-06"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(drugOrderToBeSaved.effectiveStopDate, DateUtil.parse("2014-12-07"))).toBeTruthy();
                expect(DateUtil.isSameDateTime(drugOrderToBeSaved.scheduledDate, DateUtil.parse("2014-12-06"))).toBeTruthy();
                expect(drugOrderToBeSaved.autoExpireDate).toBeUndefined();
            });
        });


        describe("should not allow overlapping order", function () {

            it("should not allow conflicting orders for dates 2-4 and new drug order for 3-6", function () {
                var encounterDate = DateUtil.parse("2014-12-02");

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);
                scope.treatments = [dec2_dec4order];

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-03"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);

                scope.treatment = overlappingOrder;
                expect(scope.treatments.length).toEqual(1);
                scope.add();
                expect(scope.treatments.length).toEqual(1);
                expect(ngDialog.open).toHaveBeenCalled();
            });

            it("should not allow conflicting orders for dates 2-4 and 5-6 and new drug order for 4-6", function () {
                var encounterDate = DateUtil.parse("2014-12-02");

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatments = [dec2_dec4order, dec5_dec6order];

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-04"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 2
                }, encounterDate);
                scope.treatment = overlappingOrder;
                expect(scope.treatments.length).toEqual(2);
                scope.add();
                expect(scope.treatments.length).toEqual(2);
                expect(ngDialog.open).toHaveBeenCalled();
            });

            it("should not allow conflicting orders for dates 2-4 and 5-6 and new drug order for 3-4", function () {
                var encounterDate = DateUtil.parse("2014-12-02");
                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatments = [dec2_dec4order, dec5_dec6order];

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-03"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 1
                });
                scope.treatment = overlappingOrder;
                expect(scope.treatments.length).toEqual(2);
                scope.add();
                expect(scope.treatments.length).toEqual(2);
                expect(ngDialog.open).toHaveBeenCalled();
            });

            it("should not allow conflicting orders for dates 2-4 and 5-6 and new drug order for 5-6", function () {
                var encounterDate = DateUtil.parse("2014-12-02");

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatments = [dec2_dec4order, dec5_dec6order];

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatment = overlappingOrder;
                expect(scope.treatments.length).toEqual(2);
                scope.add();
                expect(scope.treatments.length).toEqual(2);
                expect(ngDialog.open).toHaveBeenCalled();
            });

            it("should not allow conflicting orders for dates 2-4 and 5-6 and new drug order for 2-4", function () {
                var encounterDate = DateUtil.parse("2014-12-02");

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatments = [dec2_dec4order, dec5_dec6order];

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatment = overlappingOrder;
                expect(scope.treatments.length).toEqual(2);
                scope.add();
                expect(scope.treatments.length).toEqual(2);
                expect(ngDialog.open).toHaveBeenCalled();
            });
        });
    });

    describe("After selection from ng-dialog", function(){

        it("should edit the drug order if conflicting order is unsaved when revise is selected", function(){
            var encounterDate = DateUtil.parse("2014-12-02");

            var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                drug: {
                    name: "abc",
                    uuid: "123"
                },
                effectiveStartDate: DateUtil.parse("2014-12-02"),
                effectiveStopDate: DateUtil.parse("2014-12-04"),
                durationInDays: 2
            }, encounterDate);
            scope.treatment = dec2_dec4order;
            scope.add();
            expect(scope.treatments.length).toEqual(1);

            var new_dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                drug: {
                    name: "abc",
                    uuid: "123"
                },
                effectiveStartDate: DateUtil.parse("2014-12-02"),
                effectiveStopDate: DateUtil.parse("2014-12-03"),
                durationInDays: 1
            }, encounterDate);
            scope.treatment = new_dec2_dec4order;
            scope.add();
            expect(scope.treatments.length).toEqual(1);
            expect(ngDialog.open).toHaveBeenCalled();

            scope.revise(dec2_dec4order, 0);
            expect(ngDialog.close).toHaveBeenCalled();
            expect(dec2_dec4order.isBeingEdited).toBeTruthy();
            expect(scope.treatment.isBeingEdited).toBeTruthy();
            expect(scope.treatments.length).toBe(1);

        });
        it("should edit the drug order if conflicting order is a saved order when revise is selected", function(){
            var encounterDate = DateUtil.parse("2014-12-02");

            var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                drug: {
                    name: "abc",
                    uuid: "123"
                },
                effectiveStartDate: DateUtil.parse("2014-12-02"),
                effectiveStopDate: DateUtil.parse("2014-12-04"),
                durationInDays: 2,
                uuid: "some-uuid"
            }, encounterDate);
            scope.consultation.activeAndScheduledDrugOrders = [dec2_dec4order];
            expect(scope.treatments.length).toEqual(0);


            var new_dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, [], {
                drug: {
                    name: "abc",
                    uuid: "123"
                },
                effectiveStartDate: DateUtil.parse("2014-12-02"),
                effectiveStopDate: DateUtil.parse("2014-12-03"),
                durationInDays: 1
            }, encounterDate);
            scope.treatment = new_dec2_dec4order;
            scope.add();
            expect(scope.treatments.length).toEqual(0);
            expect(scope.alreadyActiveSimilarOrder).toBe(dec2_dec4order);
            expect(ngDialog.open).toHaveBeenCalled();

            scope.revise(dec2_dec4order, 0);
            expect(ngDialog.close).toHaveBeenCalled();
            expect(dec2_dec4order.isBeingEdited).toBeTruthy();
            expect(scope.treatment.isBeingEdited).toBeTruthy();
            expect(scope.treatment.previousOrderUuid).toBe("some-uuid");
            scope.add();
            expect(scope.treatments.length).toEqual(1);

        });

    });


    describe("Save", function () {
        it("should check for any incomplete drug orders", function () {
            scope.treatment.drug = {name: "calpol"};
            expect(scope.incompleteDrugOrders()).toBeFalsy();

            scope.treatment = {drug: {name: "calpol"}};
            scope.addForm = {$invalid: true, $valid: false};

            expect(scope.incompleteDrugOrders()).toBeTruthy();

        });
        it("should check for any unadded drug orders", function () {
            scope.addForm = {$valid: true};
            expect(scope.unaddedDrugOrders()).toBeTruthy();
            scope.addForm = {$valid: false};
            expect(scope.unaddedDrugOrders()).toBeFalsy();
        });
    });

    describe("Clear Form", function () {
        var isSameAs = function (obj1, obj2) {
            for (var key in obj1) {
                if (key !== "_effectiveStartDate" && key !== "effectiveStartDate" && key !== "isEditAllowed" && typeof obj1[key] !== 'function') {
                    if (!_.isEqual(obj1[key], obj2[key])) {
                        return false;
                    }
                }
            }
            return true;
        };
        it("should do nothing if form is blank", function () {
            scope.treatment = newTreatment;
            scope.clearForm();
            expect(isSameAs(scope.treatment, newTreatment)).toBeTruthy();
            expect(scope.treatment.isEditAllowed).toBeFalsy();
        });

        it("should clear treatment object", function () {
            scope.treatment = {drug: {name: 'Calpol'}};
            scope.clearForm();
            expect(isSameAs(scope.treatment, newTreatment)).toBeTruthy();
            expect(scope.treatment.effectiveStartDate).toEqual(encounterDateTime);
            expect(scope.treatment.isEditAllowed).toBeFalsy();
        });

        it("should reset the treatment being edited", function () {
            scope.treatments = [editTreatment, newTreatment, newTreatment];
            scope.edit(0);
            scope.clearForm();
            expect(isSameAs(scope.treatment, newTreatment)).toBeTruthy();
            expect(scope.treatment.isEditAllowed).toBeFalsy();
            expect(scope.treatments[0].isBeingEdited).toBeFalsy();
            expect(scope.treatments[0].isDiscontinuedAllowed).toBeTruthy();
        });

        it("should set auto focus on drug name", function () {
            scope.clearForm();
            expect(scope.startNewDrugEntry).toBeTruthy();
        });

    });


    describe("Edit DrugOrder()", function () {
        it("should set editDrugEntryUniformFrequency to true on edit of uniform dosing type drug", function () {
            var drugOrder = Bahmni.Tests.drugOrderViewModelMother.build({}, []);
            drugOrder.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
            scope.treatments = [drugOrder];
            scope.edit(0);
            expect(scope.editDrugEntryUniformFrequency).toBeTruthy();
        });

        it("should set editDrugEntryVariableFrequency to true on edit of variable dosing type drug", function () {
            var drugOrder = Bahmni.Tests.drugOrderViewModelMother.build({}, []);
            drugOrder.frequencyType = Bahmni.Clinical.Constants.dosingTypes.variable;
            scope.treatments = [drugOrder];
            scope.edit(0);
            expect(scope.editDrugEntryVariableFrequency).toBeTruthy();
        });
    });

    describe("Revise DrugOrder()", function () {
        it("should set editDrugEntryUniformFrequency to true on revise of uniform dosing type drug", function () {
            var drugOrder = Bahmni.Tests.drugOrderViewModelMother.build({}, []);
            drugOrder.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
            rootScope.$broadcast("event:reviseDrugOrder", drugOrder, []);
            expect(scope.editDrugEntryUniformFrequency).toBeTruthy();
        });

        it("should set editDrugEntryVariableFrequency to true on revise of variable dosing type drug", function () {
            var drugOrder = Bahmni.Tests.drugOrderViewModelMother.build({}, []);
            drugOrder.frequencyType = Bahmni.Clinical.Constants.dosingTypes.variable;
            rootScope.$broadcast("event:reviseDrugOrder", drugOrder, []);
            expect(scope.editDrugEntryVariableFrequency).toBeTruthy();
        });
    });

    describe("saveTreatment()", function () {

        it("should not save the treatment if a discontinued drug order is added at the same time", function () {
            var drugOrder = Bahmni.Tests.drugOrderViewModelMother.build({}, []);
            drugOrder.durationUnit = {name: "Days"};
            drugOrder.route = {name: "Orally"};
            drugOrder.uniformDosingType.dose = "1";
            drugOrder.doseUnits = "Capsule";
            drugOrder.uniformDosingType.frequency = {name: "Once a day"};
            drugOrder.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;

            scope.addForm = {};
            scope.consultation.newlyAddedTreatments = [];
            scope.consultation.newlyAddedTreatments.push(drugOrder);


            var discontinuedDrug = drugOrder;
            discontinuedDrug.isMarkedForDiscontinue = true;

            scope.consultation.discontinuedDrugs = [];
            scope.consultation.discontinuedDrugs.push(discontinuedDrug);
            scope.treatments = [];
            scope.treatments.push(discontinuedDrug);

            var add = contextChangeHandler.add;
            var contextChangeFunction = add.calls.mostRecent().args[0];

            contextChangeFunction();

            expect(contextChangeFunction()["errorMessage"]).toBe(Bahmni.Clinical.Constants.errorMessages.discontinuingAndOrderingSameDrug);
        });

        it("should not fail for empty treatments", function () {
            scope.consultation.newlyAddedTreatments = undefined;
            scope.consultation.preSaveHandler.fire();
        });
    })

    describe("selectAllCheckbox()", function() {
        it("should add additional attribute with the name as durationUpdateFlag", function() {
            var drugOrder = Bahmni.Tests.drugOrderViewModelMother.build({}, []);
            drugOrder.durationUnit = {name: "Days"};
            drugOrder.route = {name: "Orally"};
            drugOrder.uniformDosingType.dose = "1";
            drugOrder.doseUnits = "Capsule";
            drugOrder.uniformDosingType.frequency = {name: "Once a day"};
            drugOrder.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
            drugOrder.durationInDays = 1;

            scope.treatments = [];
            scope.treatments.push(drugOrder);
            scope.showBulkChangeToggle = true;

            scope.selectAllCheckbox();
            expect(scope.treatments.length).toBe(1);
            expect(scope.treatments[0].durationUpdateFlag).toBeTruthy();
        });
    });

    describe("bulkDurationChangeDone()", function() {
        it("should modify durationInDays and amount of drug units as per the new input", function() {
            var drugOrder = Bahmni.Tests.drugOrderViewModelMother.build({}, []);
            drugOrder.durationUnit = {name: "Days"};
            drugOrder.route = {name: "Orally"};
            drugOrder.uniformDosingType.dose = "1";
            drugOrder.doseUnits = "Capsule";
            drugOrder.uniformDosingType.frequency = {name: "Once a day"};
            drugOrder.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
            drugOrder.durationInDays = 1;
            drugOrder.durationUpdateFlag = true;

            scope.treatments = [];
            scope.treatments.push(drugOrder);
            scope.showBulkChangeToggle = true;

            scope.bulkDurationData.bulkDuration = 2;
            scope.bulkDurationData.bulkDurationUnit = "Day(s)";

            scope.bulkDurationChangeDone();

            expect(drugOrder.durationInDays).toBe(2);
        });
    });
});
