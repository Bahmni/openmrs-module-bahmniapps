'use strict';

describe("Forms Table display control", function () {
    var element, scope, $compile, mockBackend, conceptSetService, visitFormService, q, spinner, formService;
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);

    appService.getAppDescriptor.and.returnValue({
        getConfigValue: function () {
            return true;
        }
    });

    beforeEach(module('ngHtml2JsPreprocessor'));
    beforeEach(module('bahmni.common.patient'));
    beforeEach(module('bahmni.common.uiHelper'));
    beforeEach(module('bahmni.common.i18n'));
    beforeEach(module('bahmni.common.displaycontrol.forms', function ($provide) {
        conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConcept']);
        visitFormService = jasmine.createSpyObj('visitFormService', ['formData']);
        formService = jasmine.createSpyObj('formService', ['getAllPatientForms', 'getFormList']);
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);

        spinner.forPromise.and.callFake(function (param) {
            return {
                then: function () {
                    return {};
                }
            }
        });

        $provide.value('$state', {});
        $provide.value('conceptSetService', conceptSetService);
        $provide.value('visitFormService', visitFormService);
        $provide.value('formService', formService);
        $provide.value('spinner', spinner);

        $provide.value('$bahmniTranslate', {
            use: function () {
                return "en"
            }
        });
        $provide.value('appService', appService);
        $provide.value('$state', {params: {enrollment: "patientProgramUuid"}})
    }));

    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend, $q) {
        scope = $rootScope;
        $compile = _$compile_;
        q = $q;
        scope.patient = {uuid: '123'};
        scope.section = {dashboardConfig: {maximumNoOfVisits: 10}};
        mockBackend = $httpBackend;
        mockBackend.expectGET('../common/displaycontrols/forms/views/formsTable.html').respond("<div>dummy</div>");
    }));

    var mockConceptSetService = function (data) {
        conceptSetService.getConcept.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback(data)
                }
            }
        });
    };

    var mockVisitFormService = function (data) {
        visitFormService.formData.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback(data)
                }
            }
        });
    };

    var mockFormService = function (data) {
        formService.getAllPatientForms.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback(data)
                }
            }
        });
    };

    describe("Initialization", function () {

        it("should get all obs templates to display for particular patient, on dashboard.", function () {
            var allObsTemplateData = {"data": {"results": [{"display": "Baseline Template"}, {"display": "Medication log Template"}, {"display": "Followup Template"}, {"display": "Outcome End of Treatment Template"}]}};
            var formDataObj = {
                "data": {
                    results: [
                        {
                            "uuid": "2625f662-a807-4682-844a-ccff002e669d",
                            "concept": {
                                "uuid": "288b0183-2c6a-4496-b038-5ea311dd3934",
                                "display": "Medication log Template"
                            },
                            "display": "Medication log Template: 2015-11-01, Not defined",
                            "obsDatetime": "2015-12-18T16:26:31.000+0000"
                        },
                        {
                            "uuid": "ace25383-0baf-4c52-96bd-224d8caca00e",
                            "concept": {
                                "uuid": "bb80d45d-e4c5-4ce0-bb7c-0a34d2635ea5",
                                "display": "Outcome End of Treatment Template"
                            },
                            "display": "Outcome End of Treatment Template: 2015-11-17",
                            "obsDatetime": "2015-11-18T16:26:30.000+0000"
                        }
                    ]
                }
            };

            mockConceptSetService(allObsTemplateData);
            mockVisitFormService(formDataObj);

            var simpleHtml = '<forms-table section="section" patient="patient" is-on-dashboard="true"></forms-table>';
            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.formData).toEqual(formDataObj.data.results);
        });

        it("should get only latest obs templates to display for particular patient.", function () {
            var allObsTemplateData = {"data": {"results": [{"display": "Baseline Template"}, {"display": "Medication log Template"}, {"display": "Followup Template"}, {"display": "Outcome End of Treatment Template"}]}};
            var formDataObj = {
                "data": {
                    results: [
                        {
                            "uuid": "2625f662-a807-4682-844a-ccff002e669d",
                            "concept": {
                                "uuid": "288b0183-2c6a-4496-b038-5ea311dd3934",
                                "displayString": "Medication log Template"
                            },
                            "display": "Medication log Template: 2015-11-01, Not defined",
                            "obsDatetime": "2015-10-18T16:26:31.000+0000"
                        },
                        {
                            "uuid": "2625f662-a807-4682-844a-ccff002e6111",
                            "concept": {
                                "uuid": "288b0183-2c6a-4496-b038-5ea311dd3934",
                                "displayString": "Medication log Template"
                            },
                            "display": "Medication log Template: 2015-11-01, Not defined",
                            "obsDatetime": "2015-11-18T16:26:31.000+0000"
                        },
                        {
                            "uuid": "ace25383-0baf-4c52-96bd-224d8caca00e",
                            "concept": {
                                "uuid": "bb80d45d-e4c5-4ce0-bb7c-0a34d2635ea5",
                                "displayString": "Outcome End of Treatment Template"
                            },
                            "display": "Outcome End of Treatment Template: 2015-11-17",
                            "obsDatetime": "2015-11-18T16:26:30.000+0000"
                        }
                    ]
                }
            };

            var observation = {
                "uuid": "2625f662-a807-4682-844a-ccff002e669d",
                "encounterUuid": "encounterUuid",
                "concept": {
                    "uuid": "288b0183-2c6a-4496-b038-5ea311dd3934",
                    "displayString": "Medication log Template"
                },
                "display": "Medication log Template: 2015-11-01, Not defined",
                "obsDatetime": "2015-10-18T16:26:31.000+0000"
            };
            var simpleHtml = '<forms-table section="section" patient="patient" is-on-dashboard="true"></forms-table>';

            mockConceptSetService(allObsTemplateData);
            mockVisitFormService(formDataObj);

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();


            expect(compiledElementScope).not.toBeUndefined();
            var expected = [];
            expected.push(formDataObj.data.results[1]);
            expected.push(formDataObj.data.results[2]);
            expect(compiledElementScope.formData).toEqual(expected);
            expect(compiledElementScope.getEditObsData(observation).observation).toEqual(observation);
            expect(compiledElementScope.getEditObsData(observation).conceptSetName).toEqual("Medication log Template");
        });

        it("should get all obs templates to display for particular patient, on allForms page.", function () {
            var allObsTemplateData = {"data": {"results": [{"display": "Baseline Template"}, {"display": "Medication log Template"}, {"display": "Followup Template"}, {"display": "Outcome End of Treatment Template"}]}};
            var formDataObj = {
                "data": {
                    results: [
                        {
                            "uuid": "2625f662-a807-4682-844a-ccff002e669d",
                            "concept": {
                                "uuid": "288b0183-2c6a-4496-b038-5ea311dd3934",
                                "displayString": "Medication log Template"
                            },
                            "display": "Medication log Template: 2015-11-01, Not defined",
                            "obsDatetime": "2015-10-18T16:26:31.000+0000"
                        },
                        {
                            "uuid": "2625f662-a807-4682-844a-ccff002e6111",
                            "concept": {
                                "uuid": "288b0183-2c6a-4496-b038-5ea311dd3934",
                                "displayString": "Medication log Template"
                            },
                            "display": "Medication log Template: 2015-11-01, Not defined",
                            "obsDatetime": "2015-11-18T16:26:31.000+0000"
                        },
                        {
                            "uuid": "ace25383-0baf-4c52-96bd-224d8caca00e",
                            "concept": {
                                "uuid": "bb80d45d-e4c5-4ce0-bb7c-0a34d2635ea5",
                                "displayString": "Outcome End of Treatment Template"
                            },
                            "display": "Outcome End of Treatment Template: 2015-11-17",
                            "obsDatetime": "2015-11-18T16:26:30.000+0000"
                        }
                    ]
                }
            };
            var simpleHtml = '<forms-table section="section" patient="patient" is-on-dashboard="false"></forms-table>';

            mockConceptSetService(allObsTemplateData);
            mockVisitFormService(formDataObj);

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();


            expect(compiledElementScope).not.toBeUndefined();
            var expected = [];
            expected.push(formDataObj.data.results[1]);
            expected.push(formDataObj.data.results[2]);
            expected.push(formDataObj.data.results[0]);
            expect(compiledElementScope.formData).toEqual(expected);
        });
        it("should set shouldPromptBrowserReload and set showFormDate", function () {
            var allObsTemplateData = {"data": {"results": [{"display": "Followup Template"}]}};
            var formDataObj = {
                "data": {
                    results: [
                        {
                            "uuid": "ace25383-0baf-4c52-96bd-224d8caca00e",
                            "concept": {
                                "uuid": "bb80d45d-e4c5-4ce0-bb7c-0a34d2635ea5",
                                "displayString": "Outcome End of Treatment Template"
                            },
                            "display": "Outcome End of Treatment Template: 2015-11-17",
                            "obsDatetime": "2015-11-18T16:26:30.000+0000"
                        }
                    ]
                }
            };
            var simpleHtml = '<forms-table section="section" patient="patient" is-on-dashboard="false"></forms-table>';

            mockConceptSetService(allObsTemplateData);
            mockVisitFormService(formDataObj);

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope.shouldPromptBrowserReload).toBeTruthy();
            expect(compiledElementScope.shouldPromptBeforeClose).toBeTruthy();
            expect(compiledElementScope.showFormsDate).toBeTruthy();
        });
    });

    describe("getEditObsData", function () {
        it("should get observation information to edit", function () {
            var allObsTemplateData = {"data": {"results": [{}]}};
            var formDataObj = {"data": {results: []}};
            var observation = {
                "uuid": "2625f662-a807-4682-844a-ccff002e669d",
                "encounterUuid": "encounterUuid",
                "concept": {
                    "uuid": "288b0183-2c6a-4496-b038-5ea311dd3934",
                    "displayString": "Medication log Template"
                },
                "display": "Medication log Template: 2015-11-01, Not defined",
                "obsDatetime": "2015-10-18T16:26:31.000+0000"
            };


            var simpleHtml = '<forms-table section="section" patient="patient" is-on-dashboard="false"></forms-table>';

            mockConceptSetService(allObsTemplateData);
            mockVisitFormService(formDataObj);

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.getEditObsData(observation).observation).toEqual(observation);
            expect(compiledElementScope.getEditObsData(observation).conceptSetName).toEqual(observation.concept.displayString);
            expect(compiledElementScope.getEditObsData(observation).conceptDisplayName).toEqual(observation.concept.displayString);
        })
    });

    describe("getConfigToFetchDataAndShow", function () {
        it("should get observation observation information to show", function () {
            var allObsTemplateData = {"data": {"results": [{}]}};
            var formDataObj = {"data": {results: []}};
            var observation = {
                "uuid": "2625f662-a807-4682-844a-ccff002e669d",
                "encounterUuid": "encounterUuid",
                "concept": {
                    "uuid": "288b0183-2c6a-4496-b038-5ea311dd3934",
                    "displayString": "Medication log Template"
                },
                "display": "Medication log Template: 2015-11-01, Not defined",
                "obsDatetime": "2015-10-18T16:26:31.000+0000"
            };


            var simpleHtml = '<forms-table section="section" patient="patient" is-on-dashboard="false"></forms-table>';

            mockConceptSetService(allObsTemplateData);
            mockVisitFormService(formDataObj);

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.getConfigToFetchDataAndShow(observation).patient).toEqual(scope.patient);
            expect(compiledElementScope.getConfigToFetchDataAndShow(observation).config.conceptNames).toEqual([observation.concept.displayString]);
            expect(compiledElementScope.getConfigToFetchDataAndShow(observation).config.encounterUuid).toEqual(observation.encounterUuid);
            expect(compiledElementScope.getConfigToFetchDataAndShow(observation).config.showGroupDateTime).toEqual(false);
            expect(compiledElementScope.getConfigToFetchDataAndShow(observation).config.observationUuid).toEqual(observation.uuid);
        })
    });

    describe("getDisplayName", function () {
        it("should return displayString if there are no multiple names", function () {
            var allObsTemplateData = {"data": {"results": [{}]}};
            var formDataObj = {"data": {results: []}};
            var observation = {
                "uuid": "2625f662-a807-4682-844a-ccff002e669d",
                "encounterUuid": "encounterUuid",
                "concept": {
                    "uuid": "288b0183-2c6a-4496-b038-5ea311dd3934",
                    "displayString": "Medication log Template"
                },
                "display": "Medication log Template: 2015-11-01, Not defined",
                "obsDatetime": "2015-10-18T16:26:31.000+0000"
            };


            var simpleHtml = '<forms-table section="section" patient="patient" is-on-dashboard="false"></forms-table>';

            mockConceptSetService(allObsTemplateData);
            mockVisitFormService(formDataObj);

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.getDisplayName(observation)).toEqual(observation.concept.displayString);
        });

        it("should return first name istance if there is only one name for concept.", function () {
            var allObsTemplateData = {"data": {"results": [{}]}};
            var formDataObj = {"data": {results: []}};
            var observation = {
                "uuid": "2625f662-a807-4682-844a-ccff002e669d",
                "encounterUuid": "encounterUuid",
                "concept": {
                    "uuid": "288b0183-2c6a-4496-b038-5ea311dd3934",
                    "displayString": "Medication log Template",
                    "names": [
                        {name: "Full Name of Medication log template", conceptNameType: "FULLY_SPECIFIED"}
                    ]
                },
                "display": "Medication log Template: 2015-11-01, Not defined",
                "obsDatetime": "2015-10-18T16:26:31.000+0000"
            };


            var simpleHtml = '<forms-table section="section" patient="patient" is-on-dashboard="false"></forms-table>';

            mockConceptSetService(allObsTemplateData);
            mockVisitFormService(formDataObj);

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.getDisplayName(observation)).toEqual(observation.concept.names[0].name);
        });

        it("should return short name if there are more than one name for concept.", function () {
            var allObsTemplateData = {"data": {"results": [{}]}};
            var formDataObj = {"data": {results: []}};
            var observation = {
                "uuid": "2625f662-a807-4682-844a-ccff002e669d",
                "encounterUuid": "encounterUuid",
                "concept": {
                    "uuid": "288b0183-2c6a-4496-b038-5ea311dd3934",
                    "displayString": "Medication log Template",
                    "names": [
                        {name: "Full Name of Medication log template", conceptNameType: "FULLY_SPECIFIED"},
                        {name: "short Name of Medication log template", conceptNameType: "SHORT"}
                    ]
                },
                "display": "Medication log Template: 2015-11-01, Not defined",
                "obsDatetime": "2015-10-18T16:26:31.000+0000"
            };


            var simpleHtml = '<forms-table section="section" patient="patient" is-on-dashboard="false"></forms-table>';

            mockConceptSetService(allObsTemplateData);
            mockVisitFormService(formDataObj);

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.getDisplayName(observation)).toEqual(observation.concept.names[1].name);
        });

        it("should return displayString if there are more than one name for concept and no short name.", function () {
            var allObsTemplateData = {"data": {"results": [{}]}};
            var formDataObj = {"data": {results: []}};
            var observation = {
                "uuid": "2625f662-a807-4682-844a-ccff002e669d",
                "encounterUuid": "encounterUuid",
                "concept": {
                    "uuid": "288b0183-2c6a-4496-b038-5ea311dd3934",
                    "displayString": "Medication log Template",
                    "names": [
                        {name: "Full Name of Medication log template", conceptNameType: "FULLY_SPECIFIED"},
                        {name: "short Name of Medication log template", conceptNameType: "SOME TYPE"}
                    ]
                },
                "display": "Medication log Template: 2015-11-01, Not defined",
                "obsDatetime": "2015-10-18T16:26:31.000+0000"
            };


            var simpleHtml = '<forms-table section="section" patient="patient" is-on-dashboard="false"></forms-table>';

            mockConceptSetService(allObsTemplateData);
            mockVisitFormService(formDataObj);

            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.getDisplayName(observation)).toEqual(observation.concept.displayString);
        });
    });
    describe('versioned form controller', function () {
        it('should return versionedFormController when section type is formsV2', function () {
            var simpleHtml = '<forms-table section="section" patient="patient" is-on-dashboard="false"></forms-table>';
            const formData = {formName: 'form'};
            var formDataObj = {"data": [formData]};
            mockFormService(formDataObj);
            scope.section = {dashboardConfig: {maximumNoOfVisits: 10}, type: 'formsV2'};
            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope).not.toBe(undefined);
            expect(compiledElementScope.getDisplayName(formData)).toEqual('form');
            expect(formService.getAllPatientForms.calls.count()).toEqual(1);
        });

        it('should not return versionedFormController when section type is not formsV2', function () {
            var simpleHtml = '<forms-table section="section" patient="patient" is-on-dashboard="false"></forms-table>';
            var allObsTemplateData = {"data": {"results": [{}]}};
            var formDataObj = {"data": {results: []}};
            mockConceptSetService(allObsTemplateData);
            mockVisitFormService(formDataObj);
            scope.section = {dashboardConfig: {maximumNoOfVisits: 10}, type: 'forms'};
            var element = $compile(simpleHtml)(scope);
            scope.$digest();

            expect(formService.getAllPatientForms.calls.count()).toEqual(0);
        });
    })
});
