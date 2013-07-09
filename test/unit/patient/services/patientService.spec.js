'use strict';

describe('Patient resource', function () {
    var patientService;
    var patient;
    var openmrsUrl = "http://blah";
    var patientConfiguration;

    var mockHttp = {
        defaults: {headers: {common: {'X-Requested-With': 'present'}}},
        get: jasmine.createSpy('Http get').andReturn({'name': 'john'}),
        post: jasmine.createSpy('Http post').andReturn('success')
    };

    var mappedPatient = {
        names: [{givenName:"someGivenName", familyName:"someFamilyName"}],
        age: 21,
        gender: "M"};

    beforeEach(function() {
        module('registration.patient.services');

        module(function ($provide) {
            constants.openmrsUrl = openmrsUrl;
            $provide.value('$http', mockHttp);
        });

        patientConfiguration = new PatientConfig([
            {"uuid":"d3d93ab0-e796-11e2-852f-0800271c1b75","sortWeight":2.0,"name":"caste","description":"Caste","format":"java.lang.String","answers":[]},
            {"uuid":"d3e6dc74-e796-11e2-852f-0800271c1b75","sortWeight":2.0,"name":"class","description":"Class","format":"org.openmrs.Concept",
                "answers":[{"description":"OBC","conceptId":"10"}]}]);

        inject(['patientService', '$rootScope', 'patient', function(patientServiceInjectted, $rootScope, patientFactory) {
            patient = patientFactory.create();
            patientService = patientServiceInjectted;
            $rootScope.patientConfiguration = patientConfiguration;
        }]);

    });

    it('Should call url for search', function () {
        var query = 'john';
        var results = patientService.search(query);

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.mostRecentCall.args[0]).toBe(openmrsUrl + '/ws/rest/v1/patient');
        expect(mockHttp.get.mostRecentCall.args[1].params.q).toBe(query);
        expect(results.name).toBe('john');
    });

    it('Should create a patient', function () {
        angular.extend(patient, {
            "gender": "M",
            "givenName": "someGivenName",
            "familyName": "someFamilyName",
            "age": "21"
        });
        var results = patientService.create(patient);

        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.mostRecentCall.args[0]).toBe(openmrsUrl + '/ws/rest/v1/bahmnicore/patient');
        expect(mockHttp.post.mostRecentCall.args[1].gender).toEqual("M");
        expect(mockHttp.post.mostRecentCall.args[1].names[0]["givenName"]).toEqual("someGivenName");
        expect(mockHttp.post.mostRecentCall.args[1].names[0]["familyName"]).toEqual("someFamilyName");
        expect(mockHttp.post.mostRecentCall.args[1].age).toEqual("21");
        expect(mockHttp.post.mostRecentCall.args[2].headers['Content-Type']).toBe('application/json');
        expect(mockHttp.post.mostRecentCall.args[2].headers['Accept']).toBe('application/json');
        expect(results).toBe('success');
    });
});
