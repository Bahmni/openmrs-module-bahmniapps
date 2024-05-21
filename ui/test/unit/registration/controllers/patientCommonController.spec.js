'use strict';

describe('PatientCommonController', function () {

    var $aController, $httpBackend, scope, appService, patientService, rootScope, patientAttributeService, $state;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    var $compile;

    beforeEach(module('bahmni.registration', 'ngDialog'));

    beforeEach(module(function ($provide) {
        $provide.value('patientAttributeService', {});
    }));

    beforeEach(
        inject(function ($controller, _$httpBackend_, $rootScope, _$compile_, _$state_) {
            $aController = $controller;
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            $state = _$state_;
            rootScope = $rootScope;
            $compile = _$compile_;
        })
    );


    beforeEach(function () {
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        rootScope.genderMap = {};

        scope.patient = {};

        appService.getAppDescriptor = function () {
            return {
                getConfigValue: function (config) {
                    return true;
                },
                getExtensions: function (name, type) {
                    return [{
                        "id": "",
                        "extensionPointId": "org.bahmni.registration.identifier",
                        "type": "link",
                        "src": "<div> Hello </div>",
                        "extensionParams": {
                            "identifierType": [
                                "ABHA",
                                "ABHA Address"
                            ],
                            "nonEditable": ["givenName", "middleName", "familyName", "gender", "birthDate", "age"],
                            "linkDisplay": "Verify ABHA",
                            "isMiddleNameFieldPresent": true,
                            "addressMap": {
                                "city": "cityVillage",
                                "state": "stateProvince",
                                "postalCode": "postalCode",
                                "line": ["address1"]
                            },
                            "buttons": "<button>Exit Button</button>"
                        }
                    }];
                }
            };
        };

        $aController('PatientCommonController', {
            $scope: scope,
            $rootScope: rootScope,
            appService: appService,
            patientService: patientService
        });

        $httpBackend.whenGET(Bahmni.Common.Constants.globalPropertyUrl + '?property=concept.reasonForDeath').respond({});
        $httpBackend.when('GET', Bahmni.Common.Constants.conceptUrl).respond({});
        $httpBackend.flush();

    });

    it('checks that the confirmation popup is prompted when the home button is clicked and the config is enabled and current Page is not the Registration Second Page', function () {
        scope.showSaveConfirmDialogConfig = true;
        $state.current.name = "patient.new";
        scope.onHomeNavigate = jasmine.createSpy("onHomeNavigate");
        scope.confirmationPrompt = jasmine.createSpy("confirmationPrompt");
        var element = angular.element("<a ng-click='onHomeNavigate()'>");
        var compiled = $compile(element)(scope);
        compiled.triggerHandler('click');
        expect(scope.onHomeNavigate).toHaveBeenCalled();
        expect(scope.showSaveConfirmDialogConfig).toBe(true);
        expect($state.current.name).not.toBe("patient.visit");
        scope.confirmationPrompt();
        expect(scope.confirmationPrompt).toHaveBeenCalled();
    });

    it('checks that the confirmation popup is not prompted when the home button is clicked and the config is disabled', function () {
        scope.showSaveConfirmDialogConfig = false;
        scope.onHomeNavigate = jasmine.createSpy("onHomeNavigate");
        scope.confirmationPrompt = jasmine.createSpy("confirmationPrompt");
        var element = angular.element("<a ng-click='onHomeNavigate()'>");
        var compiled = $compile(element)(scope);
        compiled.triggerHandler('click');
        expect(scope.onHomeNavigate).toHaveBeenCalled();
        expect(scope.showSaveConfirmDialogConfig).not.toBe(true);
        expect(scope.confirmationPrompt).not.toHaveBeenCalled();
    });

it('checks that the confirmation popup is not prompted on the Registration second page when the home button is clicked and the config is enabled', function () {
        scope.showSaveConfirmDialogConfig = true;
        $state.current.name = "patient.visit";
        scope.onHomeNavigate = jasmine.createSpy("onHomeNavigate");
        scope.confirmationPrompt = jasmine.createSpy("confirmationPrompt");
        var element = angular.element("<a ng-click='onHomeNavigate()'>");
        var compiled = $compile(element)(scope);
        compiled.triggerHandler('click');
        expect(scope.onHomeNavigate).toHaveBeenCalled();
        expect(scope.showSaveConfirmDialogConfig).toBe(true);
        expect($state.current.name).toBe("patient.visit");
        expect(scope.confirmationPrompt).not.toHaveBeenCalled();
    });

    it("should make calls for reason for death global property and concept sets", function () {
        $httpBackend.expectGET(Bahmni.Common.Constants.globalPropertyUrl);
        $httpBackend.expectGET(Bahmni.Common.Constants.conceptUrl);
    });

    it("should show caste same as last name if the configuration is set to true", function () {

        rootScope.patientConfiguration = {attributeTypes: [{name: 'Caste'}, {name: 'Class'}]};

        expect(scope.showCasteSameAsLastName()).toBeTruthy();
    });

    it("should show caste same as last name if the configuration is set to true irrespective of patient attribute case sensitivity", function () {
        rootScope.patientConfiguration = {attributeTypes: [{name: 'caSTe'}, {name: 'Class'}]};

        expect(scope.showCasteSameAsLastName()).toBeTruthy();
    });

    it("should not show caste same as last name if the configuration is set to true, but person attribute caste is not there", function () {
        rootScope.patientConfiguration = {attributeTypes: [{name: 'Class'}]};

        expect(scope.showCasteSameAsLastName()).toBeFalsy();
    });

    it("showBirthTime should be true by default", function () {
        expect(scope.showBirthTime).toBe(true);
    });

    it("showBirthTime should be false if set false", function () {

        appService.getAppDescriptor = function () {
            return {
                getConfigValue: function (config) {
                    if (config == "showBirthTime") {
                        return false;
                    }
                },
                getExtensions: function (name, type) {
                    return [{
                        "id": "",
                        "extensionPointId": "",
                        "type": "",
                        "template" : "",
                        "controller": "",
                        "extensionParams": {
                            "hipUrl" : ""
                        }
                    }];
                }
            };
        };

        $aController('PatientCommonController', {
            $scope: scope,
            $rootScope: rootScope,
            http: $httpBackend,
            patientAttributeService: patientAttributeService,
            spinner: spinner,
            appService: appService,
            patientService: patientService
        });
        expect(scope.showBirthTime).toBe(false);
    });

    describe("show or hide sections", function () {
        var sections;
        var createController = function () {
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            patientService = jasmine.createSpyObj('patientService', ['getIdStatus']);

            rootScope.genderMap = {};

            scope.patientLoaded = true;
            var showOrHideSection = function (patient) {
                var returnValues = {
                    show: [],
                    hide: []
                };
                if (patient["age"].years < 18) {
                    returnValues.show.push("additionalPatientInformation")
                } else {
                    returnValues.hide.push("additionalPatientInformation")
                }
                return returnValues
            };

            var showOrHideSectionOfCareTaker = function (patient) {
                var returnValues = {
                    show: [],
                    hide: []
                };
                if (patient["legalRepAlsoCaretaker"] && patient["legalRepAlsoCaretaker"].value.fullySpecifiedName === "Yes") {
                    returnValues.show.push("caretaker");
                } else {
                    returnValues.hide.push("caretaker");
                }
                return returnValues
            }
            Bahmni.Registration.AttributesConditions.rules = {
                'age': function (patient) {
                    return showOrHideSection(patient);
                },

                'birthdate': function (patient) {
                    return showOrHideSection(patient);
                },
                'legalRepAlsoCaretaker': function (patient) {
                    return showOrHideSectionOfCareTaker(patient);
                }
            };

            sections = {
                "additionalPatientInformation": {
                    attributes: [{
                        name: "education"
                    }, {
                        foo: "bar"
                    }]
                },
                "caretaker": {
                    attributes: [{
                        name: "something"
                    }, {
                        foo: "bar"
                    }]
                }
            };

            rootScope.patientConfiguration = {
                getPatientAttributesSections: function () {
                    return sections;
                }
            };

            appService.getAppDescriptor = function () {
                return {
                    getConfigValue: function (config) {
                        return true;
                    },
                    getExtensions: function (name, type) {
                        return [{
                            "id": "",
                            "extensionPointId": "",
                            "type": "",
                            "template" : "",
                            "controller": "",
                            "extensionParams": {
                                "hipUrl" : ""
                            }
                        }];
                    }

                };
            };

            $aController('PatientCommonController', {
                $scope: scope,
                $rootScope: rootScope,
                appService: appService,
                patientService: patientService
            });

            $httpBackend.whenGET(Bahmni.Common.Constants.globalPropertyUrl + '?property=concept.reasonForDeath').respond({});
            $httpBackend.when('GET', Bahmni.Common.Constants.conceptUrl).respond({});
            $httpBackend.flush();

        };
        it("should show additional attributes section if age is less than 18 on page load", function () {
            scope.patient = {
                'age': {
                    years: 10
                }
            };

            createController();
            expect(sections.additionalPatientInformation.canShow).toBeTruthy();
        });

        it("should hide additional attributes section if age is greater than 18 on page load", function () {

            scope.patient = {
                'age': {
                    years: 20
                }
            };

            createController();
            expect(sections.additionalPatientInformation.canShow).toBeFalsy();
        });

        it("should hide caretaker attributes section if legalRepAlsoCaretaker is selected as 'No'", function () {
            scope.patient = {
                'age': {
                    years: 20
                },
                'legalRepAlsoCaretaker': {
                    'value': {
                        fullySpecifiedName: "No"
                    }
                }
            };

            createController();
            expect(sections.caretaker.canShow).toBeFalsy();
        });

        it("should hide caretaker attributes section on page load", function () {
            scope.patient = {
                'age': {
                    years: 20
                }
            }

            createController();
            expect(sections.caretaker.canShow).toBeFalsy();
        });

        it("should show or hide caretaker attributes section if legalRepAlsoCaretaker value changes ", function () {

            scope.patient = {
                'age': {
                    years: 20
                }
            };

            createController();
            expect(sections.caretaker.canShow).toBeFalsy();

            scope.patient = {
                'age': {
                    years: 20
                },
                'legalRepAlsoCaretaker': {
                    'value': {
                        fullySpecifiedName: "Yes"
                    }
                }
            };
            scope.handleUpdate('legalRepAlsoCaretaker');
            expect(sections.caretaker.canShow).toBeTruthy();

            scope.patient = {
                'age': {
                    years: 20
                },
                'legalRepAlsoCaretaker': {
                    'value': {
                        fullySpecifiedName: "No"
                    }
                }
            };
            scope.handleUpdate('legalRepAlsoCaretaker');
            expect(sections.caretaker.canShow).toBeFalsy();

        });
        it("should hide additional attributes section if age is greater than 18 on value change", function () {

            scope.patient = {
                'age': {
                    years: 10
                }
            };

            createController();
            expect(sections.additionalPatientInformation.canShow).toBeTruthy();

            scope.patient = {
                'age': {
                    years: 20
                }
            };
            scope.handleUpdate('age');
            expect(sections.additionalPatientInformation.canShow).toBeFalsy();

            scope.patient = {
                'age': {
                    years: 8
                }
            };
            scope.handleUpdate('age');
            expect(sections.additionalPatientInformation.canShow).toBeTruthy();
        })
    })

    describe("extension point", function (){

        var extensionPatient = {
            address: [{
                city: "",
                country: "IN",
                district: "Bhopal",
                line: ['A-12, Dholakpur'],
                postalCode: "212021",
                state: "Madhya Pradesh",
            }],
            contactPoint: [
                {system: 'phone', value: '+919800083232'}
            ],
            gender: "F",
            id: undefined,
            identifiers: [
                {type: {
                        text: "ABHA Address"},
                    value: "hina.p@sbx"
                },
                {type: {
                        text: "ABHA"},
                    value: "57-0517-6745-1839"
                }
            ],
            names: [{familyName: 'Patel', givenName: ['Hina'], use: ''}],
            birthDate: "2000",
            isBirthDateEstimated: true
        }


        it("should update registration page with demographics details from extension",function () {

            scope.patient.age = { years : 22, months : 2, days : 24 };
            scope.patient.address = {};
            scope.patient.extraIdentifiers = [{identifierType: {name : "ABHA"},generate : function (){}},
                {identifierType: {name : "ABHA Address"},generate : function (){}}]

            scope.patient.calculateAge = function () {}


            var expectedPatient = {
                age : { years : 22, months : 2, days : 24 },
                birthdate: new Date("2000-01-01"),
                address : { stateProvince : 'Madhya Pradesh', postalCode : '212021', address1 : 'A-12, Dholakpur' },
                extraIdentifiers : [ { identifierType : { name : 'ABHA' }, generate : function (){}, registrationNumber : '57-0517-6745-1839' },
                    { identifierType : { name : 'ABHA Address' }, generate : function (){}, registrationNumber : 'hina.p@sbx' } ],
                calculateAge : Function,
                primaryContact : '+919800083232',
                gender : 'F',
                givenName : 'Hina',
                middleName : '',
                familyName : 'Patel',
                birthdateEstimated : true
        }

            scope.updateInfoFromExtSource(extensionPatient);

            const patientKeys = Object.keys(scope.patient);

            const expectedPatientKeys = Object.keys(expectedPatient);

            expect(patientKeys.length).toEqual(expectedPatientKeys.length);

            for (var i = 0; i < patientKeys.length; i++) {
                if(patientKeys[i] !== 'extraIdentifiers' && patientKeys[i] !== 'calculateAge')
                    expect(scope.patient[patientKeys[i]]).toEqual(expectedPatient[patientKeys[i]]);
            }
            expect(scope.patient.extraIdentifiers[0].registrationNumber).toBe(expectedPatient.extraIdentifiers[0].registrationNumber)
            expect(scope.patient.extraIdentifiers[1].registrationNumber).toBe(expectedPatient.extraIdentifiers[1].registrationNumber)

        })

    })

    describe("getExtButtons", function () {
        it("should return null when identifierType is not passed", function () {
            expect(scope.getExtButtons()).toBe(null);
        })

        it("should return Exit Button when identifierType is passed", function () {
            expect(scope.getExtButtons("ABHA Address")).toBe("<button>Exit Button</button>");
        })
    })
})

