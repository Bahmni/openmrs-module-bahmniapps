'use strict';

describe('CreatePatientController', function() {
    var $aController, q, scopeMock, rootScopeMock, stateMock, patientServiceMock, preferencesMock, spinnerMock,
        appServiceMock, ngDialogMock, ngDialogLocalScopeMock, httpBackend, http, sections, identifiersMock, messagingService;

    beforeEach(module('bahmni.registration'));
    beforeEach(module('bahmni.common.models'));

    beforeEach(module(function($provide){
        identifiersMock = jasmine.createSpyObj('identifiers', ['create']);
        identifiersMock.create.and.returnValue({
            primaryIdentifier: {
                identifierType: {
                    primary: true,
                    uuid: "identifier-type-uuid",
                    identifierSources: [{
                        prefix: "GAN"
                    }, {
                        prefix: "SEM"
                    }]
                }
            }
        });

        $provide.value('identifiers', identifiersMock);

    }));
    beforeEach(
        inject(function($controller, $rootScope, $q, $httpBackend, $http) {
            $aController = $controller;
            rootScopeMock = $rootScope;
            q = $q;
            scopeMock = rootScopeMock.$new();
            httpBackend = $httpBackend;
            http = $http;
        })
    );

    beforeEach(function() {
        stateMock = jasmine.createSpyObj('stateMock', ['go']);
        patientServiceMock = jasmine.createSpyObj('patientServiceMock', ['create']);
        preferencesMock = jasmine.createSpyObj('preferencesMock', ['']);
        spinnerMock = jasmine.createSpyObj('spinnerMock', ['forPromise']);
        appServiceMock = jasmine.createSpyObj('appServiceMock', ['getAppDescriptor']);
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);

        ngDialogMock = jasmine.createSpyObj('ngDialogMock', ['open', 'close']);
        ngDialogLocalScopeMock = scopeMock;
        spinnerMock.forPromise.and.returnValue(specUtil.createFakePromise({}));

        rootScopeMock.patientConfiguration = {
            identifierTypes: [{
                uuid: "identifier-type-uuid",
                name: "Bahmni Id",
                primary: true,
                identifierSources: [{
                    prefix: "SEM"
                }, {
                    prefix: "GAN"
                }]
            }]
        };

        scopeMock.$new = function() {
            return ngDialogLocalScopeMock;
        };

        appServiceMock.getAppDescriptor = function() {
            return {
                getConfigValue: function(config) {
                    if (config == 'patientInformation') {
                        return {
                            "defaults": {
                                "education": "Uneducated",
                                "date": "today"
                            }
                        };
                    }
                    return ["Division", "Zilla", "Upazilla"];
                }

            };
        };

        rootScopeMock.loggedInLocation = {
            "uuid": "43922e67-506c-11e5-968f-0050568266ff",
            "display": "Registration",
            "name": "Registration",
            "stateProvince": "Dhaka"
        };

        rootScopeMock.patientConfiguration.attributeTypes = [{
            uuid: "education-uuid",
            name: "education",
            description: "Education Details",
            format: "org.openmrs.Concept",
            answers: [{
                conceptId: "c2107f30-3f10-11e4-adec-0800271c1b75",
                fullySpecifiedName: "Uneducated"
            }, {
                conceptId: "c211442b-3f10-11e4-adec-0800271c1b75",
                description: "5th Pass and Below"
            }]

            },
            {
                uuid: "date-uuid",
                name: "date",
                description: "Date Field",
                format: "org.openmrs.util.AttributableDate"
            }];

        sections =  {
            "additionalPatientInformation": {
                attributes: [{
                    name: "education"
                }, {
                    foo: "bar"
                }, {
                    name: "date"
                }]
            }
        };

        rootScopeMock.patientConfiguration.getPatientAttributesSections = function() {
            return sections;
        };

        $aController('CreatePatientController', {
            $q: q,
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $state: stateMock,
            patientService: patientServiceMock,
            preferences: preferencesMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock,
            messagingService: messagingService
    });

        scopeMock.actions = {
            followUpAction: function() {
                scopeMock.afterSave();
            }
        };

        scopeMock.patientConfiguration = {
            identifierSources: []
        };
        scopeMock.patient = {
            identifierPrefix: {},
            relationships: []
        };
    });

    it("should populate default field education in registration form", function() {

        $aController('CreatePatientController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $state: stateMock,
            patientService: patientServiceMock,
            preferences: preferencesMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock
        });

        expect(scopeMock.patient["education"].conceptUuid).toBe("c2107f30-3f10-11e4-adec-0800271c1b75");
        expect(scopeMock.patient["education"].value).toBe("Uneducated");

    });

    it("should populate default date as today in registration form", function () {

        $aController('CreatePatientController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $state: stateMock,
            patientService: patientServiceMock,
            preferences: preferencesMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock
        });

        expect(scopeMock.patient["date"].toLocaleDateString()).toBe(new Date().toLocaleDateString());

    });

    it("should expand the section if configured true via config", function() {
        sections =  {
            "additionalPatientInformation": {
                attributes: [{
                    name: "caste"
                }, {
                    foo: "bar"
                }],
                expanded: true
            }
        };

        rootScopeMock.patientConfiguration.getPatientAttributesSections = function() {
            return sections;
        };

        $aController('CreatePatientController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $state: stateMock,
            patientService: patientServiceMock,
            preferences: preferencesMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock
        });

        expect(sections["additionalPatientInformation"].expand).toBeTruthy();
    });

    it("should expand the section when there are any default values specified for an attribute in that section", function() {

        $aController('CreatePatientController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $state: stateMock,
            patientService: patientServiceMock,
            preferences: preferencesMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock
        });

        expect(sections["additionalPatientInformation"].expand).toBeTruthy();
    });

    it("should do nothing if defaults are not specified", function() {

        appServiceMock.getAppDescriptor = function() {
            return {
                getConfigValue: function(config) {
                    if (config == 'patientInformation') {
                        return {};
                    }
                    return ["Division", "Zilla", "Upazilla"];
                }

            };
        };
        $aController('CreatePatientController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $state: stateMock,
            patientService: patientServiceMock,
            preferences: preferencesMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock
        });

        expect(scopeMock.patient["education"]).toBeUndefined();

    });

    it("should populate patient address levels", function() {
        scopeMock.addressLevels = [{
            addressField: "stateProvince",
            name: "Division"
        }, {
            addressField: "countyDistrict",
            name: "Zilla"
        }, {
            addressField: "address5",
            name: "Upazilla"
        }];
        rootScopeMock.loggedInLocation =

            $aController('CreatePatientController', {
                $scope: scopeMock,
                $rootScope: rootScopeMock,
                $state: stateMock,
                patientService: patientServiceMock,
                preferences: preferencesMock,
                spinner: spinnerMock,
                appService: appServiceMock,
                ngDialog: ngDialogMock
            });

        expect(scopeMock.patient.address[scopeMock.addressLevels[0].addressField]).toBe("Dhaka");
    });

    it("should create a patient and go to edit page", function() {
        scopeMock.patient.identifierPrefix.prefix = "GAN";

        patientServiceMock.create.and.returnValue(specUtil.respondWithPromise(q, {
            data: {
                patient: {
                    uuid: "patientUuid",
                    person: {
                        names: [{
                            display: "somename"
                        }]
                    },
                    identifiers: [{
                        identifierPrefix: "GAN"
                    }]
                }
            }
        }));

        scopeMock.create();
        scopeMock.$apply();
        expect(scopeMock.saveInProgress).toBeFalsy();

        expect(stateMock.go).toHaveBeenCalledWith("patient.edit", {
            patientUuid: 'patientUuid'
        });

    });

    it("should create a patient with custom id and go to edit page", function() {
        scopeMock.patient.identifierPrefix.prefix = "GAN";

        scopeMock.patient.hasOldIdentifier = true;
        patientServiceMock.create.and.returnValue(specUtil.createFakePromise({
            patient: {
                uuid: "patientUuid",
                person: {
                    names: [{
                        display: "somename"
                    }]
                },
                identifiers: [{
                    identifierPrefix: "GAN"
                }]
            }
        }));

        scopeMock.create();
        expect(scopeMock.saveInProgress).toBeFalsy();

        expect(stateMock.go).toHaveBeenCalledWith("patient.edit", {
            patientUuid: 'patientUuid'
        });
    });

    it("should open the pop up when the custom identifier is greater then the next identifier in the sequence", function() {
        scopeMock.patient.identifierPrefix.prefix = "GAN";
        scopeMock.patient.registrationNumber = "1050";
        scopeMock.patient.hasOldIdentifier = true;

        httpBackend.expectPOST("/openmrs/ws/rest/v1/bahmnicore/patientprofile").respond(412,"[{\"sizeOfJump\":50, \"identifierType\": \"identifier-type-uuid\"}]");
        patientServiceMock.create.and.callFake(function() {
            return http.post("/openmrs/ws/rest/v1/bahmnicore/patientprofile");
        });

        scopeMock.create();
        httpBackend.flush();

        expect(scopeMock.saveInProgress).toBeFalsy();

        expect(ngDialogMock.open).toHaveBeenCalledWith({
            template: 'views/customIdentifierConfirmation.html',
            data: [{"sizeOfTheJump":50, "identifierName": "Bahmni Id"}],
            scope: ngDialogLocalScopeMock
        });
    });

    it("should not open the pop up when the custom identifier is less then the next identifier in the sequence", function() {
        scopeMock.patient.identifierPrefix.prefix = "GAN";
        scopeMock.patient.registrationNumber = "1050";

        scopeMock.patient.hasOldIdentifier = true;

        patientServiceMock.create.and.returnValue(specUtil.createFakePromise({
            patient: {
                uuid: "patientUuid",
                person: {
                    names: [{
                        display: "somename"
                    }]
                },
                identifiers: [{
                    identifierPrefix: "GAN"
                }]
            }
        }));

        scopeMock.create();
        expect(scopeMock.saveInProgress).toBeFalsy();

        expect(ngDialogMock.open).not.toHaveBeenCalled();
        expect(patientServiceMock.create).toHaveBeenCalledWith(scopeMock.patient, undefined);
        expect(scopeMock.patient.uuid).toBe("patientUuid");
    });


    it("should create patient when the user says yes to the pop up", function() {
        scopeMock.patient.identifierPrefix.prefix = "GAN";
        scopeMock.patient.registrationNumber = "1050";

        scopeMock.patient.hasOldIdentifier = true;

        httpBackend.expectPOST("/openmrs/ws/rest/v1/bahmnicore/patientprofile").respond(412,"[{\"sizeOfJump\":50, \"identifierType\": \"identifier-type-uuid\"}]");
        patientServiceMock.create.and.callFake(function() {
            return http.post("/openmrs/ws/rest/v1/bahmnicore/patientprofile");
        });

        scopeMock.create();
        scopeMock.$apply();
        httpBackend.flush();

        expect(ngDialogMock.open).toHaveBeenCalledWith({
            template: 'views/customIdentifierConfirmation.html',
            data: [{"sizeOfTheJump":50, "identifierName": "Bahmni Id"}],
            scope: ngDialogLocalScopeMock
        });

        patientServiceMock.create.and.returnValue(specUtil.createFakePromise({
            patient: {
                uuid: "patientUuid",
                person: {
                    names: [{
                        display: "somename"
                    }]
                },
                identifiers: [{
                    identifierPrefix: "GAN"
                }]
            }
        }));

        ngDialogLocalScopeMock.yes();
        scopeMock.$apply();

        expect(patientServiceMock.create).toHaveBeenCalledWith(scopeMock.patient, true);
    });

    it("should not create patient when the user says no to the pop up", function() {
        scopeMock.patient.identifierPrefix.prefix = "GAN";
        scopeMock.patient.registrationNumber = "1050";

        scopeMock.patient.hasOldIdentifier = true;

        httpBackend.expectPOST("/openmrs/ws/rest/v1/bahmnicore/patientprofile").respond(412,"[{\"sizeOfJump\":50, \"identifierType\": \"identifier-type-uuid\"}]");
        patientServiceMock.create.and.callFake(function() {
            return http.post("/openmrs/ws/rest/v1/bahmnicore/patientprofile");
        });

        scopeMock.create();
        scopeMock.$apply();
        httpBackend.flush();

        expect(ngDialogMock.open).toHaveBeenCalledWith({
            template: 'views/customIdentifierConfirmation.html',
            data: [{"sizeOfTheJump":50, "identifierName": "Bahmni Id"}],
            scope: ngDialogLocalScopeMock
        });

        ngDialogLocalScopeMock.no();

        expect(patientServiceMock.create.calls.count()).toEqual(1);
    });

    it("should validate duplicate identifier entry in connect app and display error message", function(done) {
        scopeMock.patient.identifierPrefix.prefix = "GAN";
        scopeMock.patient.registrationNumber = "1050";

        scopeMock.patient.hasOldIdentifier = true;
        var defer = q.defer();
        patientServiceMock.create.and.callFake(function() {
            var deferred1 = q.defer();
            deferred1.reject({isIdentifierDuplicate : true, message: "duplicate identifier"});
            defer.resolve({data:"ds"});
            return deferred1.promise;
        });

        spinnerMock.forPromise.and.returnValue(defer.promise);
        scopeMock.create();
        scopeMock.$apply();
            expect(patientServiceMock.create.calls.count()).toEqual(1);
            expect(messagingService.showMessage).toHaveBeenCalled();
            done();



    });

    it("should return true if there is disablePhotoCapture config defined to be true", function () {
        appServiceMock.getAppDescriptor = function() {
            return {
                getConfigValue: function(config) {
                    if(config == "disablePhotoCapture"){
                        return true;
                    }
                }

            };
        };

        $aController('CreatePatientController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $state: stateMock,
            patientService: patientServiceMock,
            preferences: preferencesMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock
        });
        expect(scopeMock.disablePhotoCapture).toBeTruthy();
    });

});
