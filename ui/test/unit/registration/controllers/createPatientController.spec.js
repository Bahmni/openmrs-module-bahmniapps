'use strict';

var $aController, q, scopeMock, rootScopeMock, stateMock, patientServiceMock, preferencesMock, patientModelMock, spinnerMock, locationServiceMock,
    appServiceMock, ngDialogMock, ngDialogLocalScopeMock, httpBackend, http;

describe('CreatePatientController', function() {

    beforeEach(module('bahmni.registration'));
    beforeEach(module('bahmni.common.models'));

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
        patientModelMock = jasmine.createSpyObj('patientModelMock', ['']);
        spinnerMock = jasmine.createSpyObj('spinnerMock', ['forPromise']);
        appServiceMock = jasmine.createSpyObj('appServiceMock', ['getAppDescriptor']);

        ngDialogMock = jasmine.createSpyObj('ngDialogMock', ['open', 'close']);
        ngDialogLocalScopeMock = scopeMock;
        spinnerMock.forPromise.and.returnValue(specUtil.createFakePromise({}));

        rootScopeMock.patientConfiguration = {
            identifierSources: [{
                prefix: "SEM"
            }, {
                prefix: "GAN"
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
                                "education": "Uneducated"
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

        }];
        rootScopeMock.patientConfiguration.getPatientAttributesSections = function() {
            return {
                "additionalPatientInformation": {
                    attributes: [{
                        name: "education"
                    }, {
                        foo: "bar"
                    }]
                }
            };
        };

        $aController('CreatePatientController', {
            $q: q,
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $state: stateMock,
            patientService: patientServiceMock,
            preferences: preferencesMock,
            patientModel: patientModelMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock,
            offlineService: {}
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

    it("should populate default fields in registration form", function() {

        $aController('CreatePatientController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $state: stateMock,
            patientService: patientServiceMock,
            preferences: preferencesMock,
            patientModel: patientModelMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock,
            offlineService: {}
        });

        expect(scopeMock.patient["education"]).toBe("c2107f30-3f10-11e4-adec-0800271c1b75");

    });

    it("should expand the section when there are any default values specified for an attribute in that section", function() {

        $aController('CreatePatientController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $state: stateMock,
            patientService: patientServiceMock,
            preferences: preferencesMock,
            patientModel: patientModelMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock,
            offlineService: {}
        });

        expect(scopeMock.sectionVisibilityMap["additionalPatientInformation"]).toBeTruthy();

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
            patientModel: patientModelMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock,
            offlineService: {}
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
                patientModel: patientModelMock,
                spinner: spinnerMock,
                appService: appServiceMock,
                ngDialog: ngDialogMock,
                offlineService: {}
            });

        expect(scopeMock.patient.address[scopeMock.addressLevels[0].addressField]).toBe("Dhaka");
    });

    it("should set patient identifierPrefix details with the matching one", function() {
        rootScopeMock.patientConfiguration.identifierSources = [{
            prefix: "GAN"
        }, {
            prefix: "SEM"
        }];
        preferencesMock.identifierPrefix = "GAN";
        $aController('CreatePatientController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $state: stateMock,
            patientService: patientServiceMock,
            preferences: preferencesMock,
            patientModel: patientModelMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock,
            offlineService: {}
        });

        expect(scopeMock.patient.identifierPrefix.prefix).toBe("GAN");
    });

    it("should set patient identifierPrefix details with the first source details when it doesn't match", function() {
        rootScopeMock.patientConfiguration.identifierSources = [{
            prefix: "SEM"
        }, {
            prefix: "BAN"
        }];
        preferencesMock.identifierPrefix = "GAN";
        $aController('CreatePatientController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $state: stateMock,
            patientService: patientServiceMock,
            preferences: preferencesMock,
            patientModel: patientModelMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock,
            offlineService: {}
        });

        expect(scopeMock.patient.identifierPrefix.prefix).toBe("SEM");
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

        httpBackend.expectPOST("/openmrs/ws/rest/v1/bahmnicore/patientprofile").respond(412,"{\"sizeOfJump\":50}");
        patientServiceMock.create.and.callFake(function() {
            return http.post("/openmrs/ws/rest/v1/bahmnicore/patientprofile");
        });

        scopeMock.create();
        httpBackend.flush();

        expect(scopeMock.saveInProgress).toBeFalsy();

        expect(ngDialogMock.open).toHaveBeenCalledWith({
            template: 'views/customIdentifierConfirmation.html',
            data: {
                sizeOfTheJump: 50
            },
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

        httpBackend.expectPOST("/openmrs/ws/rest/v1/bahmnicore/patientprofile").respond(412,"{\"sizeOfJump\":50}");
        patientServiceMock.create.and.callFake(function() {
            return http.post("/openmrs/ws/rest/v1/bahmnicore/patientprofile");
        });

        scopeMock.create();
        scopeMock.$apply();
        httpBackend.flush();

        expect(ngDialogMock.open).toHaveBeenCalledWith({
            template: 'views/customIdentifierConfirmation.html',
            data: {
                sizeOfTheJump: 50
            },
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

        httpBackend.expectPOST("/openmrs/ws/rest/v1/bahmnicore/patientprofile").respond(412,"{\"sizeOfJump\":50}");
        patientServiceMock.create.and.callFake(function() {
            return http.post("/openmrs/ws/rest/v1/bahmnicore/patientprofile");
        });

        scopeMock.create();
        scopeMock.$apply();
        httpBackend.flush();

        expect(ngDialogMock.open).toHaveBeenCalledWith({
            template: 'views/customIdentifierConfirmation.html',
            data: {
                sizeOfTheJump: 50
            },
            scope: ngDialogLocalScopeMock
        });

        ngDialogLocalScopeMock.no();

        expect(patientServiceMock.create.calls.count()).toEqual(1);
    });

    it("hasIdentifierSources, should return false if identifier sources are not present", function() {
        scopeMock.identifierSources = [];
        expect(scopeMock.hasIdentifierSources()).toBeFalsy();
    });

});
