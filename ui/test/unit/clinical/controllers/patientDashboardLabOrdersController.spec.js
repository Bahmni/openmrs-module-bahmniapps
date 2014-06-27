'use strict';

describe("PatientDashboardLabOrdersController", function(){

    beforeEach(module('bahmni.clinical'));

    var scope;
    var result;
    var stateParams;

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();

        result = {
            "concept":{
                "uuid":"478eddf6-92b2-435f-b86e-a31915dcb5cb",
                "units":null,
                "name":"Sugar (Routine Urine)",
                "set":false,
                "conceptClass":"Test",
                "dataType":"Text"
            },
            "orderDate":"2014-06-25T11:35:40.000+0530",
            "results":[{
                "concept":{
                    "uuid":"478eddf6-92b2-435f-b86e-a31915dcb5cb",
                    "units":null,
                    "name":"Some Test",
                    "set":false,
                    "conceptClass":"Test",
                    "dataType":"Text"
                },
                "isAbnormal":false,
                "units":null,
                "notes":"Testing 123",
                "minNormal":4500,
                "maxNormal":11000,
                "referredOut":false,
                "voided":false,
                "value":"Nil",
                "observationDateTime":"2014-06-25T11:35:40.000+0530",
                "providerName":"admin",
                "isSummary":false,
                "orderDate":"2014-04-02T11:51:20.000+0530"
            }]
        };

        stateParams = {
            patientUuid: "some uuid"
        }

        $controller('PatientDashboardLabOrdersController', {
            $scope: scope,
            result: result,
            $stateParams: stateParams
        });
    }));

    describe("The controller is loaded", function(){
        it("should setup the scope", function() {
            expect(scope.patientUuid).toBe('some uuid');
        });
    });

});