'use strict';

describe("CDSS alerts", function () {
    var scope, rootScope, controller, appService, drugService, stateParams, q, deferred;

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

    var drugOrderGroups = [
        {
            "drugOrders": [
                {
                    "uuid": "drugOrderUuid",
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
                }
            ]
        }
    ];

    beforeEach(module('bahmni.clinical'));

    beforeEach(module(function ($provide) {
        $provide.value('appService', appService);
    }));

    beforeEach(inject(function ($controller, $rootScope, $q) {
        controller = $controller;
        rootScope = $rootScope;
        spyOn($rootScope, '$broadcast');
        $rootScope.visit = {startDate: 1410322624000};
        scope = $rootScope.$new();
        q = $q;
        deferred = $q.defer();
        drugService = jasmine.createSpyObj('drugService', ['cdssAudit']);
        drugService.cdssAudit.and.returnValue(deferred.promise);
        scope.consultation = {
            activeAndScheduledDrugOrders: [Bahmni.Clinical.DrugOrderViewModel.createFromContract(activeDrugOrder)],
            drugOrderGroups: drugOrderGroups
        };
    }
    ));

    var initController = function () {
        controller('cdssAlertRowController', {
            $scope: scope,
            $stateParams: {patientUuid: "patientUuid"},
            drugService: drugService,
            activeDrugOrders: [activeDrugOrder]
        });
        rootScope.$apply();
    };

    beforeEach(initController);

    it("should add alerts property to drugs whose code matches CDSS alerts", function () {
        rootScope.cdssAlerts = [
            {
                "indicator": "critical",
                "summary": "Critical Alert",
                "detail": "This is a critical alert",
                "referenceMedications": [
                    {
                        "coding": [
                            {
                                "code": "8d7e3dc0-f4ad-400c-9468-5a9e2b1f4230",
                                "display": "Methylprednisolone 2ml"

                            }
                        ]
                    }
                ]
            }
        ];
        initController();
        expect(scope.consultation.drugOrderGroups[0].drugOrders[0].alerts.length).toBe(1);
    });

    it("should not add alerts property to drugs whose code does not match CDSS alerts", function () {
        rootScope.cdssAlerts = [
            {
                "indicator": "critical",
                "summary": "Critical Alert",
                "detail": "This is a critical alert",
                "referenceMedications": [
                    {
                        "coding": [
                            {
                                "code": "12345",
                                "display": "Methylprednisolone 4ml"

                            }
                        ]
                    }
                ]
            }
        ];
        initController();
        expect(scope.consultation.drugOrderGroups[0].drugOrders[0].alerts.length).toBe(0);
    });
});
