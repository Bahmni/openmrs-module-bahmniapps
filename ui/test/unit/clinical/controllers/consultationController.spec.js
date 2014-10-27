'use strict';

describe("ConsultationController", function () {

    var scope, conceptSetUiConfigService, rootScope;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        scope.consultation = {
            observations: []
        };
        $rootScope.consultation = {
            investigations: [],
            newlyAddedDiagnoses: [],
            disposition: {},
            treatmentDrugs: [],
            newlyAddedTreatments: [],
            discontinuedDrugs: [],
            pastDiagnoses: []
        };
        conceptSetUiConfigService = jasmine.createSpyObj('conceptSetUiConfigService', ['getConfig']);

        $controller('ConsultationController', {
            $scope: scope,
            $rootScope: rootScope,
            conceptSetUiConfigService: conceptSetUiConfigService
        });
    }));

    describe("when initialized", function(){
        it("should setup scope variables", function() {
            expect(scope.isConsultationTabEmpty()).toBe(true);
        });
    });
});


