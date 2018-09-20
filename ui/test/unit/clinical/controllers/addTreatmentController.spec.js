'use strict';

describe("AddTreatmentController", function () {

    beforeEach(module('bahmni.common.uiHelper'));
    beforeEach(module('bahmni.common.services'));
    beforeEach(module('bahmni.clinical'));
    beforeEach(module(function ($provide) {
        var translate = jasmine.createSpyObj('$translate', ['instant']);
        translate.instant.and.callFake(function (key) {
            return key;
        });
        $provide.value('$translate', translate);
    }));
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


    var $q, scope, stateParams, rootScope, contextChangeHandler, newTreatment,
        editTreatment, clinicalAppConfigService, ngDialog, drugService, drugs,
        encounterDateTime, appService, appConfig, defaultDrugsPromise, orderSetService, locationService;


    stateParams = {
        tabConfigName: null
    };

    var orderSets;

    var treatmentConfig = {
        getDrugConceptSet: function () {
            return "All TB Drugs";
        },
        isDropDownForGivenConceptSet: function () {
            return false;
        },
        isAutoCompleteForGivenConceptSet: function () {
            return false;
        },
        isAutoCompleteForAllConcepts: function () {
            return true;
        },
        getDoseFractions: function () {
            return [{"value": 0.50, "label": "½"}];
        },
        frequencies: [{name: 'Twice a day', frequencyPerDay: 2}],
        durationUnits: [
            {name: "Day(s)", factor: 1},
            {name: "Week(s)", factor: 7},
            {name: "Month(s)", factor: 30}
        ],
        inputOptionsConfig: {},
        orderSet: {}
    };

    var initController = function () {
        inject(function ($controller, $rootScope, _$q_) {
            $q = _$q_;
            scope = $rootScope.$new();
            rootScope = $rootScope;
            encounterDateTime = moment("2014-03-02").toDate();
            scope.consultation = {preSaveHandler: new Bahmni.Clinical.Notifier(), encounterDateTime: encounterDateTime};
            ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);
            newTreatment = new Bahmni.Clinical.DrugOrderViewModel({}, {}, encounterDateTime);
            editTreatment = new Bahmni.Clinical.DrugOrderViewModel(null, null);
            scope.currentBoard = {extension: {}, extensionParams: {}};
            contextChangeHandler = jasmine.createSpyObj('contextChangeHandler', ['add']);
            scope.addForm = {$invalid: false, $valid: true};
            clinicalAppConfigService = jasmine.createSpyObj('clinicalAppConfigService', ['getTreatmentActionLink']);
            clinicalAppConfigService.getTreatmentActionLink.and.returnValue([]);
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            appConfig = jasmine.createSpyObj('appConfig', ['getConfig']);
            orderSetService = jasmine.createSpyObj('orderSetService', ['getCalculatedDose', 'getOrderSetsByQuery']);
            scope.patient = {uuid: "patient.uuid"};
            orderSetService.getCalculatedDose.and.returnValue(specUtil.respondWithPromise($q, {
                dose: 20, doseUnit: 'mg'
            }));
            locationService = jasmine.createSpyObj('locationService', ['getLoggedInLocation'])

            drugService = jasmine.createSpyObj('drugService', ['getSetMembersOfConcept']);
            drugs = [
                {name: "T", dosageForm: {display: "something"}, uuid: "123-12321"},
                {name: "A", dosageForm: {display: "something"}, uuid: "123-12321"},
                {name: "P", dosageForm: {display: "something"}, uuid: "123-12321"}
            ];
            defaultDrugsPromise = specUtil.respondWith(drugs);
            drugService.getSetMembersOfConcept.and.returnValue(defaultDrugsPromise);

            appService.getAppDescriptor.and.returnValue(appConfig);
            orderSets = [{
                "orderSetId": 3,
                "uuid": "497b959b-101b-41a8-8154-3f252b2771d7",
                "name": "test",
                "description": "test",
                "operator": "ALL",
                "orderSetMembers": [
                    {
                        "orderSetMemberId": 6,
                        "uuid": "7b375220-50c9-4193-a238-33a588caa0f3",
                        "orderTemplate": "{\"drug\":{\"name\":\"Paracetamol 500mg\",\"uuid\":\"d9c230a5-89d8-4e4d-b08b-2af3b1234c80\",\"form\":\"Tablet\"},\"dosingInstructions\":{\"dose\":2,\"frequency\":\"Twice a day\",\"doseUnits\":\"Capsule(s)\",\"route\":\"Intramuscular\"},\"duration\":2,\"durationUnits\":\"Day(s)\",\"administrationInstructions\":\"Before meals\",\"additionalInstructions\":\"Additional Instructions\"}",
                        "sortWeight": 1,
                        "retired": false,
                        "concept": {
                            "name": "Paracetamol"
                        }
                    },
                    {
                        "orderSetMemberId": 5,
                        "uuid": "6a204704-e18b-457a-9ed3-da2ef57524dd",
                        "orderTemplate": "{\"drug\":{\"name\":\"Aspirin 75mg\",\"uuid\":\"49f0c5c2-4738-4382-9928-69fd330d4624\",\"form\":\"Tablet\"},\"dosingInstructions\":{\"dose\":1,\"doseUnits\":\"Tablet(s)\",\"frequency\":\"Twice a day\",\"route\":\"Nasal\"},\"duration\":1,\"durationUnits\":\"Day(s)\",\"administrationInstructions\":\"Before meals\",\"additionalInstructions\":\"Additional Instructions\"}",
                        "sortWeight": 2,
                        "retired": false,
                        "concept": {
                            "name": "Rifampacin"
                        }
                    }
                ],
                "retired": false
            }];

            var fakePromise = {
                response: {
                    data: {
                        results: orderSets
                    }
                },
                then : function(cb) {
                    cb(this.response);
                }
            }
            orderSetService.getOrderSetsByQuery.and.returnValue(fakePromise);
            $controller('AddTreatmentController', {
                $scope: scope,
                $stateParams: stateParams,
                $rootScope: rootScope,
                treatmentService: null,
                activeDrugOrders: [activeDrugOrder, scheduledOrder],
                contextChangeHandler: contextChangeHandler,
                clinicalAppConfigService: clinicalAppConfigService,
                ngDialog: ngDialog,
                appService: appService,
                locationService :locationService,
                drugService: drugService,
                treatmentConfig: treatmentConfig,
                orderSetService: orderSetService
            });
            scope.treatments = [];
            scope.orderSetTreatments = [];
            scope.newOrderSet = {};
            scope.getFilteredOrderSets('dumm');
        })
    };
    beforeEach(initController);

    describe("DosingUnitsFractions()", function () {
        it("should return true if mantissa available", function () {
            scope.doseFractions = [
                {"value": 0.50, "label": "½"},
                {"value": 0.33, "label": "⅓"},
                {"value": 0.25, "label": "¼"},
                {"value": 0.75, "label": "¾"}
            ];
            expect(scope.isDoseFractionsAvailable()).toBeTruthy();
        });

        it("should return false if mantissa not available", function () {
            scope.doseFractions = undefined;
            expect(scope.isDoseFractionsAvailable()).toBeFalsy();
        });
    });

    describe("add()", function () {
        beforeEach(function () {
            scope.treatments = [];
        })

        it("adds treatment object to list of treatments if newOrderSet flag is false", function () {
            var treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {drug: {name: true}});
            treatment.isNewOrderSet = false;
            scope.treatment = treatment;
            scope.add();
            expect(scope.orderSetTreatments.length).toBe(0);
            expect(scope.treatments.length).toBe(1);
            expect(scope.treatments[0]).toBe(treatment);
        });

        it("adds treatment object to list of treatments if newOrderSet flag is true", function () {
            var treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {drug: {name: true}});
            treatment.isNewOrderSet = true;
            scope.treatment = treatment;
            scope.add();
            expect(scope.treatments.length).toBe(0);
            expect(scope.orderSetTreatments.length).toBe(1);
            expect(scope.orderSetTreatments[0]).toBe(treatment);
        });

        it("should not set effective stop date when duration is not specified", function () {
            var treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {drug: {name: true}});
            treatment.effectiveStopDate = null;
            treatment.durationInDays = null;
            scope.treatment = treatment;
            scope.add();
            expect(scope.treatments.length).toBe(1);
            expect(scope.treatments[0].effectiveStopDate).toBe(null);
        });

        it("should set effective stop date when duration is specified", function () {
            var treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {drug: {name: true}});
            treatment.effectiveStopDate = null;
            treatment.durationInDays = 2;
            treatment.effectiveStartDate = '2015-01-15';
            scope.treatment = treatment;
            scope.add();
            expect(scope.treatments.length).toBe(1);
            expect(scope.treatments[0].effectiveStopDate).toEqual(moment("2015-01-17").toDate());
        });

        it("should empty treatment", function () {
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {drug: {name: true}});
            scope.add();
            expect(scope.treatment.drug).toBeFalsy();
        });

        it("clears existing treatment object", function () {
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {drug: {name: true}});
            scope.add();
            expect(scope.treatment.drug).toBeFalsy();
        });

        it("should set auto focus on drug name", function () {
            scope.treatments = [];
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {drug: {name: true}});
            scope.add();
            expect(scope.startNewDrugEntry).toBeTruthy();
        });

        it("should not allow to add new order if there is already existing order", function () {
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                drug: {name: "abc"},
                effectiveStartDate: "2011-11-26",
                durationInDays: 2
            });
            scope.consultation.activeAndScheduledDrugOrders = [Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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
            scope.consultation.activeAndScheduledDrugOrders = [Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                drug: {
                    name: "abc",
                    uuid: "123"
                },
                effectiveStartDate: DateUtil.parse("2014-12-02"),
                effectiveStopDate: DateUtil.parse("2014-12-04"),
                durationInDays: 2,
                uuid: "abcdef"
            })];
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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
            scope.consultation.activeAndScheduledDrugOrders = [Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                drug: {
                    name: "abc",
                    uuid: "123"
                },
                effectiveStartDate: DateUtil.parse("2014-12-02"),
                effectiveStopDate: DateUtil.parse("2014-12-04"),
                durationInDays: 2,
                uuid: "abcdef"
            })];
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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
            scope.treatments = [Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                drug: {
                    name: "abc",
                    uuid: "123"
                },
                effectiveStartDate: DateUtil.parse("2014-12-02"),
                effectiveStopDate: DateUtil.parse("2014-12-04"),
                durationInDays: 2
            })];
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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
            scope.treatments = [
                Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    }
                }),
                Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "def",
                        uuid: "1234"
                    }
                }),
                Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "ghi",
                        uuid: "12345"
                    }
                })
            ];
            scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

        describe("add free text drug order()", function () {
            it("should save as a free text drug order on click of accept button", function () {
                var treatment = {drugNameDisplay: "Some New Drug", drug: {name: "CodedDrug"}};
                scope.treatment = treatment;
                scope.onAccept();
                expect(scope.treatment.selectedItem).toBeFalsy();
                expect(scope.treatment.drug).toBeUndefined();
                expect(scope.treatment.isNonCodedDrug).toBe(true);
                expect(scope.treatment.drugNonCoded).toBe(treatment.drugNameDisplay);
            });

            it("should save as a coded-drug after the entered free text drug is edited to coded", function () {
                var treatment = {drugNameDisplay: "Some New Drug", drug: {name: "CodedDrug"}};
                scope.treatment = treatment;
                treatment.changeDrug = jasmine.createSpy(treatment, 'changeDrug');

                scope.onSelect({
                    drug: {
                        name: "CodedDrug",
                        uuid: "CodedDrugUuid",
                        dosageForm: {
                            display: "Once"
                        }
                    }
                });

                scope.onChange();
                expect(treatment.changeDrug).toHaveBeenCalledWith({
                    name: "CodedDrug",
                    form: "Once",
                    uuid: "CodedDrugUuid"
                });

                expect(scope.treatment.selectedItem).toBeUndefined();
                expect(scope.treatment.isNonCodedDrug).toBeFalsy();
            });

            it("should remove the added coded-drug on changing the drug name", function () {
                scope.treatment = {drugNameDisplay: "Some New Drug", drug: {name: "CodedDrug"}};

                scope.onChange();

                expect(scope.treatment).toEqual({
                    drugNameDisplay: "Some New Drug"
                });
            });

            it("should enable accept button on editing an accepted drug", function () {
                var treatment = {drugNameDisplay: "Some Coded Drug", drug: {name: "CodedDrug"}};
                scope.treatment = treatment;
                treatment.changeDrug = jasmine.createSpy(treatment, 'changeDrug');

                scope.treatment.drugNameDisplay = "Some NonCoded Drug";
                scope.onChange();

                scope.onAccept();
                expect(scope.treatment.isNonCodedDrug).toBeTruthy();

                scope.treatment.drugNameDisplay = "Some another NonCoded Drug";
                scope.onChange();

                scope.onAccept();
                expect(scope.treatment.isNonCodedDrug).toBeFalsy();
            });
        });

        describe("isEffectiveStartDateSameAsToday", function () {
            var originalDateUtilNow = DateUtil.now;
            var today = new Date("December 17, 2007 03:24:00");
            beforeEach(function () {
                DateUtil.now = function () {
                    return new Date(today);
                };
            });
            afterEach(function () {
                DateUtil.now = originalDateUtilNow;
            });
            it("should change the effectiveStartDate to null when it is today", function () {
                scope.treatments = [];
                scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    encounterDate: today,
                    effectiveStartDate: today
                });

                scope.add();
                expect(scope.treatments.length).toBe(1);
                expect(scope.treatments[0].scheduledDate).toBeNull();
            });

            it("should not change the effectiveStartDate when it is not today", function () {
                scope.treatments = [];
                var fiveDaysBack = new Date("December 12, 2007 02:24:00");
                scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    encounterDate: fiveDaysBack,
                    effectiveStartDate: fiveDaysBack
                });

                scope.add();
                expect(scope.treatments.length).toBe(1);
                expect(scope.treatments[0].scheduledDate).toEqual(fiveDaysBack);
            });

            it("should not change the effectiveStartDate when it is not today on retro", function () {
                scope.treatments = [];
                var fiveDaysBack = new Date("December 12, 2007 02:24:00");
                var fourDaysBack = new Date("December 13, 2007 02:24:00");
                scope.treatment = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    encounterDate: fiveDaysBack,
                    effectiveStartDate: fourDaysBack
                });

                scope.add();
                expect(scope.treatments.length).toBe(1);
                expect(scope.treatments[0].scheduledDate).toEqual(fourDaysBack);
            });
        });
    });
    describe("Detect Overlapping orders amongst new orders on Save", function () {

        describe("should allow potentially overlapping order whose dates can be set and be resolved", function () {

            var encounterDate = DateUtil.parse("2014-12-02");

            beforeEach(function () {
                scope.treatments = [];
            })

            it("new drug orders for dates 2-4 and 5-6 and 4-5 in this order", function () {
                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({},
                    {
                        drug: {name: "abc", uuid: "123"},
                        effectiveStartDate: DateUtil.parse("2014-12-02"),
                        effectiveStopDate: DateUtil.parse("2014-12-04"),
                        durationInDays: 2
                    },
                    encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({},
                    {
                        drug: {name: "abc", uuid: "123"},
                        effectiveStartDate: DateUtil.parse("2014-12-05"),
                        effectiveStopDate: DateUtil.parse("2014-12-06"),
                        durationInDays: 1
                    },
                    encounterDate);
                var dec4_dec5order = Bahmni.Tests.drugOrderViewModelMother.buildWith({},
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
                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({},
                    {
                        drug: {name: "abc", uuid: "123"},
                        effectiveStartDate: DateUtil.parse("2014-12-02"),
                        effectiveStopDate: DateUtil.parse("2014-12-04"),
                        durationInDays: 2
                    },
                    encounterDate);
                var dec4_dec5order = Bahmni.Tests.drugOrderViewModelMother.buildWith({},
                    {
                        drug: {name: "abc", uuid: "123"},
                        effectiveStartDate: DateUtil.parse("2014-12-04"),
                        effectiveStopDate: DateUtil.parse("2014-12-05"),
                        durationInDays: 1
                    },
                    encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({},
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
                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({},
                    {
                        drug: {name: "abc", uuid: "123"},
                        effectiveStartDate: DateUtil.parse("2014-12-02"),
                        effectiveStopDate: DateUtil.parse("2014-12-04"),
                        durationInDays: 2
                    },
                    newEncounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({},
                    {
                        drug: {name: "abc", uuid: "123"},
                        effectiveStartDate: DateUtil.parse("2014-12-05"),
                        effectiveStopDate: DateUtil.parse("2014-12-06"),
                        durationInDays: 1
                    },
                    newEncounterDate);
                var dec4_dec5order = Bahmni.Tests.drugOrderViewModelMother.buildWith({},
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

            beforeEach(function () {
                scope.treatments = [];
            })

            it("existing drug orders for dates 2-3 and 3-4 and revised drug order for 2-3", function () {
                var dec2_dec3order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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
                var dec3_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

            it("existing drug orders 4-5 and new drug order 2-4(starting today)", function () {
                var dec4_dec5order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

            beforeEach(function () {
                scope.treatments = []
            })

            it("new orders for dates 2-4 and 3-6", function () {

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

                var dec3_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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
                expect(ngDialog.open).toHaveBeenCalledWith({
                    template: 'consultation/views/treatmentSections/conflictingDrugOrderModal.html',
                    scope: scope
                });
            });

            it("new orders for dates 2-4 and 5-6 and 4-6", function () {
                var encounterDate = DateUtil.parse("2014-12-02");

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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
                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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


                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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
                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatments = [dec2_dec4order, dec5_dec6order];

                var nonOverlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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
                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatments = [dec2_dec4order, dec5_dec6order];

                var nonOverlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);
                scope.treatments = [dec2_dec4order];

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatments = [dec2_dec4order, dec5_dec6order];

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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
                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatments = [dec2_dec4order, dec5_dec6order];

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatments = [dec2_dec4order, dec5_dec6order];

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

                var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-02"),
                    effectiveStopDate: DateUtil.parse("2014-12-04"),
                    durationInDays: 2
                }, encounterDate);
                var dec5_dec6order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                    drug: {
                        name: "abc",
                        uuid: "123"
                    },
                    effectiveStartDate: DateUtil.parse("2014-12-05"),
                    effectiveStopDate: DateUtil.parse("2014-12-06"),
                    durationInDays: 1
                }, encounterDate);
                scope.treatments = [dec2_dec4order, dec5_dec6order];

                var overlappingOrder = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

    describe("After selection from ng-dialog", function () {

        beforeEach(function () {
            scope.treatments = [];
        })
        it("should edit the drug order if conflicting order is unsaved when revise is selected", function () {
            var encounterDate = DateUtil.parse("2014-12-02");

            var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

            var new_dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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
        it("should edit the drug order if conflicting order is a saved order when revise is selected", function () {
            var encounterDate = DateUtil.parse("2014-12-02");

            var dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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


            var new_dec2_dec4order = Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
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

        beforeEach(function () {
            scope.treatments = []
        });

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
            rootScope.$broadcast("event:editDrugOrder", editTreatment, 0);
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
            rootScope.$broadcast("event:editDrugOrder", drugOrder, 0);
            expect(scope.editDrugEntryUniformFrequency).toBeTruthy();
        });

        it("should set editDrugEntryVariableFrequency to true on edit of variable dosing type drug", function () {
            var drugOrder = Bahmni.Tests.drugOrderViewModelMother.build({}, []);
            drugOrder.frequencyType = Bahmni.Clinical.Constants.dosingTypes.variable;
            scope.treatments = [drugOrder];
            rootScope.$broadcast("event:editDrugOrder", drugOrder, 0);
            expect(scope.editDrugEntryVariableFrequency).toBeTruthy();
        });
    });

    describe("Revise DrugOrder()", function () {
        it("should set editDrugEntryUniformFrequency to true on revise of uniform dosing type drug", function () {
            var drugOrder = Bahmni.Tests.drugOrderViewModelMother.build({}, []);
            drugOrder.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
            scope.treatments = [];
            rootScope.$broadcast("event:reviseDrugOrder", drugOrder, []);
            expect(scope.editDrugEntryUniformFrequency).toBeTruthy();
        });

        it("should set editDrugEntryVariableFrequency to true on revise of variable dosing type drug", function () {
            var drugOrder = Bahmni.Tests.drugOrderViewModelMother.build({}, []);
            scope.treatments = [];
            drugOrder.frequencyType = Bahmni.Clinical.Constants.dosingTypes.variable;
            rootScope.$broadcast("event:reviseDrugOrder", drugOrder, []);
            expect(scope.editDrugEntryVariableFrequency).toBeTruthy();
        });
    });

    describe("Void DrugOrder", function () {
        it("should remove the drugOrder from activeAndScheduledDrugOrders", function () {
            var length = scope.consultation.activeAndScheduledDrugOrders.length;
            var drugOrder = Bahmni.Tests.drugOrderViewModelMother.build({}, []);
            scope.consultation.activeAndScheduledDrugOrders.push(drugOrder);
            rootScope.$broadcast("event:sectionUpdated", drugOrder);
            expect(scope.consultation.activeAndScheduledDrugOrders.length).toBe(length);
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

        it('should save multiple tab drug orders for both order-set and new prescription sections', function () {
            var drugOrder1 = Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder);
            var drugOrder2 = Bahmni.Tests.drugOrderViewModelMother.build({}, []);

            var drugOrder1FromOrderSet = Bahmni.Clinical.DrugOrderViewModel.createFromContract(orderSets[0].orderSetMembers[0].orderTemplate);
            var drugOrder2FromOrderSet = Bahmni.Clinical.DrugOrderViewModel.createFromContract(orderSets[0].orderSetMembers[1].orderTemplate);

            scope.consultation.newlyAddedTabTreatments = {
                "tabOne": {
                    treatments: [drugOrder1],
                    orderSetTreatments: [drugOrder1FromOrderSet]
                },
                "tabTwo": {
                    treatments: [drugOrder2],
                    orderSetTreatments: [drugOrder2FromOrderSet]

                }
            };

            scope.consultation.newlyAddedTreatments = [];

            scope.consultation.preSaveHandler.fire();

            expect(scope.consultation.newlyAddedTreatments.length).toBe(4);
        });
    });

    describe("when discontinued", function () {
        it("should mark the drug order for discontinue", function () {

            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder);

            rootScope.$broadcast("event:discontinueDrugOrder", drugOrder);

            expect(drugOrder.isMarkedForDiscontinue).toBe(true);
            expect(drugOrder.dateStopped).not.toBeNull();
        });

        it("should add the drugOrder to discontinueDrugs", function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder);

            rootScope.$broadcast("event:discontinueDrugOrder", drugOrder);

            expect(scope.consultation.discontinuedDrugs[0]).toBe(drugOrder);
        });

        it("verify that the discontinued order is correctly created while saving", function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder);

            rootScope.$broadcast("event:discontinueDrugOrder", drugOrder);
            scope.consultation.preSaveHandler.fire();

            expect(scope.consultation.removableDrugs.length).toEqual(1);
            var discontinuedDrugOrder = scope.consultation.removableDrugs[0];
            expect(discontinuedDrugOrder.action).toEqual(Bahmni.Clinical.Constants.orderActions.discontinue);
            expect(discontinuedDrugOrder.previousOrderUuid).toEqual(drugOrder.uuid);
            expect(discontinuedDrugOrder.uuid).toEqual(undefined);
            expect(discontinuedDrugOrder.scheduledDate).toEqual(drugOrder.dateStopped);
            expect(discontinuedDrugOrder.dateActivated).toEqual(null);
        });
    });

    describe("when undo removing", function () {
        it("should change the action to new", function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder);
            drugOrder.orderReasonConcept = {
                name: 'Adverse event'
            };
            drugOrder.orderReasonText = 'AE ID';

            rootScope.$broadcast("event:discontinueDrugOrder", drugOrder);
            rootScope.$broadcast("event:undoDiscontinueDrugOrder", drugOrder);

            expect(drugOrder.isMarkedForDiscontinue).toBe(false);
            expect(drugOrder.orderReasonConcept).toBe(null);
            expect(drugOrder.orderReasonText).toBe(null);
            expect(drugOrder.dateStopped).toBe(null);
        });

        it("should remove the drugOrder from discontinuedDrugs and removeableDrugs", function () {
            var drugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder);

            rootScope.$broadcast("event:discontinueDrugOrder", drugOrder);
            expect(scope.consultation.discontinuedDrugs.length).toBe(1);
            rootScope.$broadcast("event:undoDiscontinueDrugOrder", drugOrder);

            expect(scope.consultation.discontinuedDrugs.length).toBe(0);
        });

        it("should remove the proper drugOrder from discontinuedDrugs", function () {
            var drugOrder1 = Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder);
            var drugOrder2 = Bahmni.Clinical.DrugOrderViewModel.createFromContract(scheduledOrder);

            rootScope.$broadcast("event:discontinueDrugOrder", drugOrder1);
            rootScope.$broadcast("event:discontinueDrugOrder", drugOrder2);

            expect(scope.consultation.discontinuedDrugs.length).toBe(2);

            rootScope.$broadcast("event:undoDiscontinueDrugOrder", drugOrder2);

            expect(scope.consultation.discontinuedDrugs.length).toBe(1);
            expect(scope.consultation.discontinuedDrugs[0]).toBe(drugOrder1);
        })
    });

    describe("add orderset", function () {
        it("should add order set drugs to orderSetTreatments list in scope", function () {

            var orderSetDate = moment("2015-03-02").toDate();
            var stopDate = moment("2015-03-04").toDate();
            scope.newOrderSet.date = orderSetDate;
            scope.addOrderSet(orderSets[0]);

            scope.$apply();
            expect(scope.orderSetTreatments.length).toBe(2);
            var firstOrderSetTreatment = scope.orderSetTreatments[0];
            expect(firstOrderSetTreatment.isNewOrderSet).toBeTruthy();
            expect(firstOrderSetTreatment.orderSetUuid).toBe(orderSets[0].uuid);
            expect(firstOrderSetTreatment.effectiveStartDate).toEqual(orderSetDate);
            expect(firstOrderSetTreatment.effectiveStopDate).toEqual(stopDate);
            expect(firstOrderSetTreatment.dosingInstructionType).toEqual(Bahmni.Clinical.Constants.flexibleDosingInstructionsClass);
            expect(firstOrderSetTreatment.frequencyType).toEqual("uniform");
            expect(firstOrderSetTreatment.uniformDosingType.dose).toEqual(20);
            expect(firstOrderSetTreatment.durationUnit).toEqual("Day(s)");
            expect(firstOrderSetTreatment.additionalInstructions).toEqual("Additional Instructions");
            expect(firstOrderSetTreatment.quantity).toEqual(80);
            expect(ngDialog.open).not.toHaveBeenCalled();
            expect(scope.isSearchDisabled).toBeTruthy();


        });

        it('should reset include flag for all orderSetTreatments if any of them is conflicting with active or scheduled drug', function () {
            scope.newOrderSet.date = moment("2015-03-02").toDate();
            scope.consultation.activeAndScheduledDrugOrders = [Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                drug: {name: "Paracetamol 500mg"},
                effectiveStartDate: "2015-03-01",
                durationInDays: 2,
                effectiveStopDate: "2015-03-05",
                uuid: "abcdef"
            })];

            scope.addOrderSet(orderSets[0]);

            scope.$apply();
            expect(scope.orderSetTreatments[0].include).toBeFalsy();
            expect(scope.orderSetTreatments[1].include).toBeFalsy();
            expect(ngDialog.open).toHaveBeenCalled();

        })
    });

    describe("remove orderset", function () {
        it('should empty orderSetTreatments when orderset is removed', function () {
            scope.addOrderSet(orderSets[0]);

            scope.$apply();
            expect(scope.orderSetTreatments.length).toBe(2);
            expect(scope.newOrderSet.uuid).toBe(orderSets[0].uuid);

            scope.removeOrderSet();

            expect(scope.orderSetTreatments.length).toBe(0);
            expect(scope.newOrderSet).toEqual({});
            expect(scope.isSearchDisabled).toBeFalsy();
        })
    });

    describe('include orderSetMember checkbox', function () {
        it("should include orderSetMember to save list only if it is not conflicting with active/scheduled drugs", function () {
            scope.consultation.activeAndScheduledDrugOrders = [Bahmni.Tests.drugOrderViewModelMother.buildWith({}, {
                drug: {name: "Paracetamol 500mg"},
                effectiveStartDate: "2015-03-01",
                durationInDays: 2,
                effectiveStopDate: "2015-03-05",
                uuid: "abcdef"
            })];

            var drugOrderResponse = orderSets[0].orderSetMembers[0].orderTemplate;
            var orderSetDrugOrder = Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrderResponse);
            orderSetDrugOrder.effectiveStartDate = moment("2015-03-01");
            orderSetDrugOrder.include = true;

            rootScope.$broadcast("event:includeOrderSetDrugOrder", orderSetDrugOrder);

            expect(orderSetDrugOrder.include).toBeFalsy();
            expect(ngDialog.open).toHaveBeenCalled();
        })
    })
});
