'use strict';

describe('PatientCommonController', function () {

    var $aController, $httpBackend, scope, appService, rootScope, patientAttributeService;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);

    beforeEach(module('bahmni.registration'));

    beforeEach(module(function ($provide) {
        $provide.value('patientAttributeService', {});
    }));

    beforeEach(
        inject(function ($controller, _$httpBackend_, $rootScope) {
            $aController = $controller;
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            rootScope = $rootScope;
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
                }

            };
        };

        $aController('PatientCommonController', {
            $scope: scope,
            $rootScope: rootScope,
            appService: appService
        });

        $httpBackend.whenGET(Bahmni.Common.Constants.globalPropertyUrl + '?property=concept.reasonForDeath').respond({});
        $httpBackend.when('GET', Bahmni.Common.Constants.conceptUrl).respond({});
        $httpBackend.flush();

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
                }
            };
        };

        $aController('PatientCommonController', {
            $scope: scope,
            $rootScope: rootScope,
            http: $httpBackend,
            patientAttributeService: patientAttributeService,
            spinner: spinner,
            appService: appService
        });
        expect(scope.showBirthTime).toBe(false);
    });

    describe("show or hide sections", function () {
        var sections;
        var createController = function () {
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);

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
                    }

                };
            };

            $aController('PatientCommonController', {
                $scope: scope,
                $rootScope: rootScope,
                appService: appService
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

})

