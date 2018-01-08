'use strict';

describe('Patient resource', function () {
    var patientService;
    var patient;
    var sessionService;


    var openmrsUrl = "http://blah";
    var patientConfiguration, identifiersMock, identifierDetails;

    var mockHttp = {
        defaults: {headers: {common: {'X-Requested-With': 'present'}}},
        get: jasmine.createSpy('Http get').and.returnValue({
            'success': function (onSuccess) {
                onSuccess({name: "john"});
                return {
                    'error': function (onError) {
                        onError();
                    }
                }
            }

        }),
        post: jasmine.createSpy('Http post').and.returnValue({
            'success': function (onSuccess) {
                return {
                    'then': function (thenMethod) {
                        thenMethod()
                    },
                    'error': function (onError) {
                        onError()
                    }
                }
            }
        })
    };


    beforeEach(function () {
        module('bahmni.common.models');
        module('bahmni.registration');

        module(function ($provide) {
            identifiersMock = jasmine.createSpyObj('identifiers', ['create']);
            identifierDetails = {
                primaryIdentifier: {
                    identifierType: {
                        primary: true,
                        uuid: "identifier-type-uuid",
                        identifierSources: [{
                            prefix: "GAN",
                            uuid: 'dead-cafe'
                        }, {
                            prefix: "SEM",
                            uuid: 'new-cafe'
                        }]
                    }
                },
                extraIdentifiers: [{
                    identifierType: {
                        uuid: 'extra-identifier-type-uuid',
                        primary: false
                    }
                }]
            };
            identifiersMock.create.and.returnValue(identifierDetails);

            $provide.value('identifiers', identifiersMock);

        });

        module(function ($provide) {
            Bahmni.Registration.Constants.openmrsUrl = openmrsUrl;
            sessionService = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
            $provide.value('$http', mockHttp);
            $provide.value('sessionService', sessionService);
        });

        patientConfiguration = new Bahmni.Registration.PatientConfig([
            {
                "uuid": "d3d93ab0-e796-11e2-852f-0800271c1b75",
                "sortWeight": 2.0,
                "name": "caste",
                "description": "Caste",
                "format": "java.lang.String",
                "answers": []
            },
            {
                "uuid": "d3e6dc74-e796-11e2-852f-0800271c1b75",
                "sortWeight": 2.0,
                "name": "class",
                "description": "Class",
                "format": "org.openmrs.Concept",
                "answers": [
                    {"description": "OBC", "conceptId": "10"}
                ]
            }
        ]);

        inject(['patientService', '$rootScope', 'patient', '$q', function (patientServiceInjectted, $rootScope, patientFactory) {
            patient = patientFactory.create();
            patientService = patientServiceInjectted;
            $rootScope.patientConfiguration = patientConfiguration;
        }]);

    });


    it('Should call url for search', function () {
        var query = 'john';
        var identifier = '20000';
        var addressFieldName = 'address2';
        var addressFieldValue = 'kaliganj';
        var customAttributeValue = 'Student';
        var customAttributeFields = ['occupation', 'education'];
        var programAttributeFieldName = 'REGISTRATION NO';
        var programAttributeFieldValue = '1234';
        var results = patientService.search(query, identifier, addressFieldName, addressFieldValue, customAttributeValue, 0,
            customAttributeFields, programAttributeFieldName, programAttributeFieldValue);

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniSearchUrl + "/patient/lucene");
        expect(mockHttp.get.calls.mostRecent().args[1].params.q).toBe(query);
        expect(mockHttp.get.calls.mostRecent().args[1].params.identifier).toBe(identifier);
        expect(mockHttp.get.calls.mostRecent().args[1].params.addressFieldName).toBe(addressFieldName);
        expect(mockHttp.get.calls.mostRecent().args[1].params.addressFieldValue).toBe(addressFieldValue);
        expect(mockHttp.get.calls.mostRecent().args[1].params.customAttribute).toBe(customAttributeValue);
        expect(mockHttp.get.calls.mostRecent().args[1].params.startIndex).toBe(0);
        expect(mockHttp.get.calls.mostRecent().args[1].params.patientAttributes).toBe(customAttributeFields);
        expect(mockHttp.get.calls.mostRecent().args[1].params.programAttributeFieldName).toBe(programAttributeFieldName);
        expect(mockHttp.get.calls.mostRecent().args[1].params.programAttributeFieldValue).toBe(programAttributeFieldValue);
        expect(results.$$state.value.name).toBe('john');

    });

    it('should make network call to serach by patient name or identifier for given query string and limit', function () {
        var query = "demo";
        patientService.searchByNameOrIdentifier(query, 100);
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniSearchUrl + "/patient");
        expect(mockHttp.get.calls.mostRecent().args[1].params.q).toBe(query);
        expect(mockHttp.get.calls.mostRecent().args[1].params.limit).toBe(100);
        expect(mockHttp.get.calls.mostRecent().args[1].params.s).toBe("byIdOrName");
    });

    it('Should create a patient', function () {
        angular.extend(patient, {
            "gender": "M",
            "givenName": "someGivenName",
            "familyName": "someFamilyName",
            "age": {
                days: 23,
                months: 2,
                years: 1
            },
            "centerID": {
                name: "GAN"
            }
        });
        var results = patientService.create(patient, function () {
        }, function () {
        });

        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.calls.mostRecent().args[0]).toBe('/openmrs/ws/rest/v1/bahmnicore/patientprofile');
        expect(mockHttp.post.calls.mostRecent().args[1].patient.person.gender).toEqual("M");
        expect(mockHttp.post.calls.mostRecent().args[1].patient.person.names[0].givenName).toEqual("someGivenName");
        expect(mockHttp.post.calls.mostRecent().args[1].patient.person.names[0].familyName).toEqual("someFamilyName");
        expect(moment(mockHttp.post.calls.mostRecent().args[1].patient.person.birthdate).format('YYYY-MM-DD')).toEqual(moment().subtract('days', 23).subtract('months', 2).subtract('years', 1).format('YYYY-MM-DD'));
        expect(mockHttp.post.calls.mostRecent().args[2].headers['Content-Type']).toBe('application/json');
        expect(mockHttp.post.calls.mostRecent().args[2].headers['Accept']).toBe('application/json');
    });

    it("should get patients by uuid", function () {
        patientService.get("someUuid");

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe("http://blah/ws/rest/v1/patientprofile/someUuid");
    })
});
