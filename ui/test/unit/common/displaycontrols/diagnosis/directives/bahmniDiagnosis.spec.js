'use strict';

describe('Diagnosis DisplayControl', function () {
    var rootScope, scope, compiledElementScope, q, _diagnosisService,
        diagnoses,
        compile, diagnosis,
        mockBackend,
        element,
        directiveHtml = '<bahmni-diagnosis patient-uuid="patient.uuid" config="section" show-diagnosis-with-state="section.showDiagnosisWithState"></bahmni-diagnosis>';

    beforeEach(module('bahmni.common.domain'));
    beforeEach(module('bahmni.common.uiHelper'));
    beforeEach(module('bahmni.common.displaycontrol.diagnosis'));

    beforeEach(module( function ($provide) {
        var _spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then']);
        _spinner.forPromise.and.callFake(function () {
            var deferred = q.defer();
            deferred.resolve({data: {}});
            return deferred.promise;
        });

        _spinner.then.and.callThrough({data: {}});
        $provide.value('spinner', _spinner);

        _diagnosisService = jasmine.createSpyObj('diagnosisService', ['getDiagnoses','filteredDiagnosis']);
        var getDiagnosesPromise = specUtil.createServicePromise('getDiagnoses');
        getDiagnosesPromise.then = function (successFn) {
            successFn({"data": diagnoses});
            return getDiagnosesPromise;

        };
        _diagnosisService.getDiagnoses.and.returnValue(getDiagnosesPromise);
        $provide.value('diagnosisService', _diagnosisService);

        diagnoses = [{
            "order": "SECONDARY",
            "certainty": "PRESUMED",
            "diagnosisDateTime": "2015-10-08T11:33:24.000+0530",
            "diagnosisStatusConcept": {
                "uuid": "823051c4-3f10-11e4-adec-0800271c1b75",
                "name": "Ruled Out Diagnosis",
                "dataType": null,
                "shortName": null,
                "conceptClass": null,
                "set": false,
                "mappings": []
            },
            "latestDiagnosis": null,
            "encounterUuid": "b6818776-f3d1-4a01-8f26-87ab9b3b211f"
        }];
    }));


    beforeEach(inject(function ($compile, $httpBackend, $rootScope, $q) {
        compile = $compile;
        mockBackend = $httpBackend;
        rootScope = $rootScope;
        q = $q;
    }));

    function init() {
        scope = rootScope.$new();
        mockBackend.expectGET('../common/displaycontrols/diagnosis/views/diagnosisDisplayControl.html').respond("<div>dummy</div>");
        scope.section = {
            title: "Diagnosis",
            "showDiagnosisWithState":["ruledOut"]
        };

        element = compile(directiveHtml)(scope);
        scope.$digest();
        mockBackend.flush();

        compiledElementScope = element.isolateScope();
        scope.$digest();

        diagnosis = {
            showLatestDetails: false,
            showDetails: false,
            providers: [{name: "Super Woman"}]
        };
    }

    it('should check diagnosis date toggle', function () {
        init();
        compiledElementScope.toggle(diagnosis, true);

        expect(diagnosis.showLatestDetails).toBeTruthy();
        expect(diagnosis.showDetails).toBeFalsy();

        compiledElementScope.toggle(diagnosis, false)

        expect(diagnosis.showLatestDetails).toBeFalsy();
        expect(diagnosis.showDetails).toBeTruthy();
    });

    it('should filter only ruled out diagnoses when showRuledOutDiagnoses flag is set to ruledOut', function () {
        _diagnosisService.getDiagnoses.and.returnValue(specUtil.respondWithPromise(q,diagnoses));
        _diagnosisService.filteredDiagnosis.and.returnValue([]);

        init();
        rootScope.$apply();
        expect(compiledElementScope.allDiagnoses.length).toBe(0);
        expect(_diagnosisService.filteredDiagnosis).toHaveBeenCalledWith(diagnoses,scope.section.showDiagnosisWithState);
    });

    it('should not filter diagnoses when showDiagnosisWithState flag is true', function () {
        directiveHtml = '<bahmni-diagnosis patient-uuid="patient.uuid" config="section" show-diagnosis-with-state="undefined"></bahmni-diagnosis>';
        _diagnosisService.getDiagnoses.and.returnValue(specUtil.respondWithPromise(q,diagnoses));

        init();
        rootScope.$apply();
        expect(compiledElementScope.allDiagnoses.length).toBe(1);
        expect(_diagnosisService.filteredDiagnosis).not.toHaveBeenCalled();
    });


});