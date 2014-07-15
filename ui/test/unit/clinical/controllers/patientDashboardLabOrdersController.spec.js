'use strict';

describe("PatientDashboardLabOrdersController", function(){

    beforeEach(module('bahmni.clinical'));

    var scope;
    var labOrderResultService;
    var stateParams;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);

    var labOrderResults = {
        "accessions": [[
            {"accessionUuid": "uuid1", "accessionDateTime":1401437955000, "testName": "ZN Stain(Sputum)"},
            {"accessionUuid": "uuid1", "accessionDateTime":1401437955000, "testName": "ZN Stain(Sputum)"},
            {"accessionUuid": "uuid1", "accessionDateTime":1401437955000, "testName": "Haemoglobin", "panelName": "Routine Blood"},
            {"accessionUuid": "uuid1", "accessionDateTime":1401437955000, "testName": "ESR", "panelName": "Routine Blood"},
        ], [
            {"accessionUuid": "uuid2", "accessionDateTime":1401437956000, "testName": "ZN Stain(Sputum)"}
        ]],
        "tabularResult": {}
    }

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();

        spinner.forPromise.and.callFake(function(param) {return {}});

        labOrderResultService = jasmine.createSpyObj('LabOrderResultService', ['getAllForPatient']);
        labOrderResultService.getAllForPatient.and.callFake(function(param) {
            return specUtil.respondWith(labOrderResults);
        });

        stateParams = {
            patientUuid: "some uuid"
        }

        $controller('PatientDashboardLabOrdersController', {
            $scope: scope,
            $rootScope: {'allTestsAndPanelsConcept': []},
            $stateParams: stateParams,
            LabOrderResultService: labOrderResultService,
            spinner: spinner
        });
    }));

    describe("The controller is loaded", function(){
        it("should setup the scope", function() {
            expect(scope.patientUuid).toBe('some uuid');
            expect(labOrderResultService.getAllForPatient).toHaveBeenCalledWith("some uuid", 1);
        });
    });
});