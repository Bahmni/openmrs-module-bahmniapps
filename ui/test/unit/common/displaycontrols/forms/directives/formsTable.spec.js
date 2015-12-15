'use strict';

describe("Forms Table display control", function () {
    var element, scope, $compile, mockBackend, conceptSetService, visitFormService, q, spinner;
    
    beforeEach(module('ngHtml2JsPreprocessor'));
    beforeEach(module('bahmni.common.patient'));
    beforeEach(module('bahmni.common.uiHelper'));
    beforeEach(module('bahmni.common.i18n'));
    beforeEach(module('bahmni.common.displaycontrol.forms', function ($provide) {
        conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConceptSetMembers']);
        visitFormService = jasmine.createSpyObj('visitFormService', ['formData']);
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
        $provide.value('spinner', spinner);

        $provide.value('$bahmniTranslate', {
            use: function () {
                return "en"
            }
        });
    }));

    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend, $q) {
        scope = $rootScope;
        $compile = _$compile_;
        q = $q;
        scope.patient = {uuid :'123'};
        scope.section = {dashboardParams: {maximumNoOfVisits: 10}};
        mockBackend = $httpBackend;
        mockBackend.expectGET('../common/displaycontrols/forms/views/formsTable.html').respond("<div>dummy</div>");
    }));

    var mockConceptSetService = function (data) {
        conceptSetService.getConceptSetMembers.and.callFake(function () {
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

    describe("Initialization", function () {

        it("should get all obs templates to display for particular patient, on dashboard.", function () {
            var allObsTemplateData = {"data": {"results": [{"display":"Baseline Template"},{"display":"Medication log Template"},{"display":"Followup Template"},{"display":"Outcome End of Treatment Template"}]}};
            var formDataObj = {"data": {results: [
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
            ]}};

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
            var allObsTemplateData = {"data": {"results": [{"display":"Baseline Template"},{"display":"Medication log Template"},{"display":"Followup Template"},{"display":"Outcome End of Treatment Template"}]}};
            var formDataObj = {"data": {results: [
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
            ]}};

            var observation = {
                "uuid": "2625f662-a807-4682-844a-ccff002e669d",
                "encounterUuid":"encounterUuid",
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
            expect(compiledElementScope.getEditObsData(observation).observation.encounterUuid).toEqual("encounterUuid");
            expect(compiledElementScope.getEditObsData(observation).conceptSetName).toEqual("Medication log Template");
        });

        it("should get all obs templates to display for particular patient, on allForms page.", function () {
            var allObsTemplateData = {"data": {"results": [{"display":"Baseline Template"},{"display":"Medication log Template"},{"display":"Followup Template"},{"display":"Outcome End of Treatment Template"}]}};
            var formDataObj = {"data": {results: [
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
            ]}};
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
    });
});
