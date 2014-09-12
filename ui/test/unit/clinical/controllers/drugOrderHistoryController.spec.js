'use strict';

describe("DrugOrderHistoryController", function(){

    beforeEach(module('bahmni.clinical'));

    var scope, prescribedDrugOrders;

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();

        prescribedDrugOrders = [
            {
                "uuid": null,
                "action": "NEW",
                "careSetting": "Outpatient",
                "orderType": "Drug Order",
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
            },
            {
                "uuid": null,
                "action": "NEW",
                "careSetting": "Outpatient",
                "orderType": "Drug Order",
                "autoExpireDate": 1397892379000,
                "scheduledDate": null,
                "dateStopped": null,
                "instructions": null,
                "visit": {
                    "startDateTime": 1410349317222,
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
                "effectiveStartDate": 1397028379000,
                "effectiveStopDate": 1397892379000,
                "orderReasonConcept": null,
                "dosingInstructionType": "org.openmrs.FreeTextDosingInstructions",
                "previousOrderUuid": null,
                "orderReasonText": null,
                "duration": 10,
                "provider": {name: "superman"}
            }
        ];

        $controller('DrugOrderHistoryController', {
            $scope: scope,
            prescribedDrugOrders: prescribedDrugOrders
        });
    }));

    describe("when initialized", function(){
        it("should setup scope variables", function() {
            expect(Object.keys(scope.drugOrderGroups).length).toBe(2);
            expect(scope.drugOrderGroups['10 Sep 14'].length).toBe(1);
            var secondDrugOrder = scope.drugOrderGroups['10 Sep 14'][0];
            expect(secondDrugOrder.drugName).toBe(prescribedDrugOrders[1].drug.name);
        });
    });
});