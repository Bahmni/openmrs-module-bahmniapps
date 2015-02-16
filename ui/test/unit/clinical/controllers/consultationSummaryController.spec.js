'use strict';

describe("ConsultationSummaryController", function () {

    var scope, conceptSetUiConfigService, rootScope;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        scope.consultation = {
            observations: [],
            investigations: [],
            newlyAddedDiagnoses: [],
            disposition: {},
            treatmentDrugs: [],
            newlyAddedTreatments: [],
            discontinuedDrugs: [],
            pastDiagnoses: []
        };
        
        conceptSetUiConfigService = jasmine.createSpyObj('conceptSetUiConfigService', ['getConfig']);

        $controller('ConsultationSummaryController', {
            $scope: scope,
            $rootScope: rootScope,
            conceptSetUiConfigService: conceptSetUiConfigService
        });
    }));

    describe("IsConsultationTabEmpty", function(){
        it("should return false when there is no data on consultation", function() {
            expect(scope.isConsultationTabEmpty()).toBe(true);
        });

        it("should return false when there are observations", function() {
            scope.groupedObservations = [{conceptSetName: "Vitals", groupMembers: [{label: "Pulse Data"}]}];
            expect(scope.isConsultationTabEmpty()).toBe(false);
        });
    });
});


