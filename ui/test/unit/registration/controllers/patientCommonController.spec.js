'use strict';

describe('PatientCommonController', function () {

    var $aController, $httpBackend, scope, appService, appDescriptor, patientService, rootScope, patientAttributeService;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    var $compile;
    var searchPromise;

    beforeEach(module('bahmni.registration', 'ngDialog'));

    beforeEach(module(function ($provide) {
        $provide.value('patientAttributeService', {});
    }));

    beforeEach(
        inject(function ($controller, _$httpBackend_, $rootScope, _$compile_) {
            $aController = $controller;
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            rootScope = $rootScope;
            $compile = _$compile_;
        })
    );

    beforeEach(function () {
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        patientService = jasmine.createSpyObj('patientService', ['searchSimilar']);
        searchPromise = specUtil.createServicePromise('similarSearch');
        patientService.searchSimilar.and.returnValue(searchPromise);

        rootScope.genderMap = {};

        scope.patient = {};

        appService.getAppDescriptor = function () {
            return {
                getConfigValue: function (config) {
                    return true;
                },
                getExtensions: function (path) {
                    return [];
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

    it('checks that the confirmation popup is prompted when the home button is clicked and the config is enabled', function () {
        scope.showSaveConfirmDialogConfig = true;
        scope.onHomeNavigate = jasmine.createSpy("onHomeNavigate");
        scope.confirmationPrompt = jasmine.createSpy("confirmationPrompt");
        var element = angular.element("<a ng-click='onHomeNavigate()'>");
        var compiled = $compile(element)(scope);
        compiled.triggerHandler('click');
        expect(scope.onHomeNavigate).toHaveBeenCalled();
        expect(scope.showSaveConfirmDialogConfig).toBe(true);
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
                getExtensions: function (path) {
                    return [];
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

    describe("search for similar patients", function() {

        var responseContent = {totalCount:null, pageOfResults:[ {uuid:"c5fe8240-8af9-41ce-a319-980ab921be6d",
                                                           birthDate:"1990-05-12", givenName:"John", middleName:"Peter", familyName:"Foo", gender:"O",
                                                            dateCreated:1527070797000, hasBeenAdmitted:false, age:"28", identifier: "GAN203006"},
                                                            {uuid:"c5fe8240-8af9-41ce-a319-980ab921be6d",
                                                             birthDate:"1990-05-12", givenName:"Sue", middleName:"Maria", familyName:"Smith", gender:"F",
                                                             dateCreated:1527070797000, hasBeenAdmitted:false, age:"46"}]};

        it("should call search for similar patients with any given name parts and gender from the input fields", function() {
            scope.patient = {
                "givenName": "john",
                "middleName": "peter",
                "familyName": "bar",
                "gender": "Male",
                "birthdate": "1963-05-18"
             };

            scope.searchSimilarPatients();

            expect(patientService.searchSimilar).toHaveBeenCalledWith("john peter bar", "Male", "1963-05-18");
        });

        it("should show and hide the similar search section depending on returned results", function () {
            scope.searchSimilarPatients();
            searchPromise.callThenCallBack(responseContent);

            expect(scope.hasSimilarSearchResults).toBeTruthy();

            scope.searchSimilarPatients();
            searchPromise.callThenCallBack({totalCount:null, pageOfResults:[]});

            expect(scope.hasSimilarSearchResults).toBeFalsy();
        });

        it("should map information from the search result", function () {
            scope.searchSimilarPatients();
            searchPromise.callThenCallBack(responseContent);

            expect(scope.results[0].uuid).toBe("c5fe8240-8af9-41ce-a319-980ab921be6d");
            expect(scope.results[0].identifier).toBe("GAN203006");
            expect(scope.results[0].givenName).toBe("John");
            expect(scope.results[0].middleName).toBe("Peter");
            expect(scope.results[0].familyName).toBe("Foo");
            expect(scope.results[0].gender).toBe("O");
            expect(scope.results[0].age).toBe("28");
            expect(scope.results[0].birthdate).toBe("12 May 90");
            expect(scope.results[0].image).toBe(Bahmni.Common.Constants.patientImageUrlByPatientUuid + "c5fe8240-8af9-41ce-a319-980ab921be6d");
            expect(scope.results[1].givenName).toBe("Sue");
        });
    });

});
