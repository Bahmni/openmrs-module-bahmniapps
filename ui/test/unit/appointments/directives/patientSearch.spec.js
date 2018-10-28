'use strict';

describe("Patient Search", function () {
    var patientService, compile, appointmentsService, spinner, scope, httpBackend, state;

    beforeEach(module('bahmni.appointments', function ($provide) {
        patientService = jasmine.createSpyObj('patientService', ['search']);
        patientService.search.and.returnValue(specUtil.simplePromise({data: {}}));
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        spinner.forPromise.and.callFake(function (param) {
            return {
                then: function (callback) {
                    return callback(param);
                }
            };
        });
        state = {params: {}};
        appointmentsService = jasmine.createSpyObj('appointmentsService', ['search']);
        appointmentsService.search.and.returnValue(specUtil.simplePromise({}));
        $provide.value('patientService', patientService);
        $provide.value('spinner', spinner);
        $provide.value('$state', state);
        $provide.value('appointmentsService', appointmentsService);
    }));

    beforeEach(inject(function ($compile, $httpBackend, $rootScope) {
        compile = $compile;
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        httpBackend.expectGET('../i18n/appointments/locale_en.json').respond({});
        httpBackend.expectGET('/bahmni_config/openmrs/i18n/appointments/locale_en.json').respond({});
        httpBackend.expectGET('../appointments/views/manage/patientSearch.html').respond('<div></div>');
    }));

    var createElement = function () {
        var html = '<patient-search on-search="displaySearchedPatient"></patient-search>';
        scope.displaySearchedPatient = jasmine.createSpy('displaySearchedPatient');
        scope.displaySearchedPatient.and.returnValue({});

        var element = compile(angular.element(html))(scope);
        scope.$digest();
        httpBackend.flush();
        return element;
    };

    it('should search for patient', function () {
        var element = createElement();
        var compiledScope = element.isolateScope();
        compiledScope.patient = 'test patient';
        compiledScope.search();
        expect(patientService.search).toHaveBeenCalledWith(compiledScope.patient);
    });

    it('should build response map with patient name and identifier for list of patients', function () {
        var element = createElement();
        var compiledScope = element.isolateScope();
        var patients = [{givenName: 'test', familyName: 'patient', identifier: 'GAN2016'}, {givenName: 'test', familyName: 'appointment', identifier: 'GAN2017'}];
        var response = compiledScope.responseMap(patients);
        expect(response[0].label).toEqual(patients[0].givenName + " " + patients[0].familyName + " " + "(" + patients[0].identifier + ")");
        expect(response[1].label).toEqual(patients[1].givenName + " " + patients[1].familyName + " " + "(" + patients[1].identifier + ")");
    });

    it('should get appointments for a patient on select of patient', function () {
        appointmentsService.search.and.returnValue(specUtil.simplePromise({data: []}));
        var element = createElement();
        var compiledScope = element.isolateScope();
        var patient = {uuid: 'patientUuid'};
        compiledScope.onSelectPatient(patient);
        expect(state.params.patient).toEqual(patient);
        expect(appointmentsService.search).toHaveBeenCalledWith({patientUuid: patient.uuid});
        expect(scope.displaySearchedPatient).toHaveBeenCalled();
    });

    it('should clear patient if searchEnabled is false', function () {
        var element = createElement();
        var compiledScope = element.isolateScope();
        compiledScope.patient = {uuid: 'patientUuid'};
        state.params.isSearchEnabled = false;
        scope.$apply();
        expect(compiledScope.patient).toBeNull();
    });

    it('should search for patient appointments if state params has patient on init', function () {
        appointmentsService.search.and.returnValue(specUtil.simplePromise({data: []}));
        var patient = {givenName: 'test', familyName: 'patient', identifier: 'GAN2016', uuid: 'patientUuid'};
        state.params.isSearchEnabled = true;
        state.params.patient = patient;
        var element = createElement();
        var compiledScope = element.isolateScope();
        expect(compiledScope.patient).toBe(patient.givenName + " " + patient.familyName + " " + "(" + patient.identifier + ")");
        expect(appointmentsService.search).toHaveBeenCalledWith({patientUuid: patient.uuid});
        expect(scope.displaySearchedPatient).toHaveBeenCalled();
    });

     it('should build response map with only given name when family name is null for given patients', function () {
            var element = createElement();
            var compiledScope = element.isolateScope();
            var patients = [{givenName: 'testOne', familyName: null, identifier: 'GAN2018'}, {givenName: 'testTwo', familyName: null, identifier: 'GAN2017'}];
            var response = compiledScope.responseMap(patients);
            expect(response[0].label).toEqual("testOne (GAN2018)");
            expect(response[1].label).toEqual("testTwo (GAN2017)");
     });
});
