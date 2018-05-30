'use strict';

describe("conceptSet", function () {
    var appService, spinner, conceptSetUiConfigService, contextChangeHandler, observationsService,
        messagingService, compile, scope, conceptSetService, httpBackend,element, compiledElementScope;

    beforeEach(function () {
        module('bahmni.common.conceptSet');
        module(function ($provide) {
            conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConcept']);
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            contextChangeHandler = jasmine.createSpyObj('contextChangeHandler', ['add']);
            observationsService = jasmine.createSpyObj('observationsService', ['fetch']);
            messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
            conceptSetUiConfigService = jasmine.createSpyObj('conceptSetUiConfigService', ['getConfig']);
            spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            $provide.value('appService', appService);
            $provide.value('conceptSetService', conceptSetService);
            $provide.value('contextChangeHandler', contextChangeHandler);
            $provide.value('observationsService', observationsService);
            $provide.value('messagingService', messagingService);
            $provide.value('conceptSetUiConfigService', conceptSetUiConfigService);
            $provide.value('spinner', spinner);
        });
        inject(function ($compile, $rootScope, $httpBackend) {
            compile = $compile;
            scope = $rootScope.$new();
            httpBackend = $httpBackend;
        });
    });
    beforeEach(function () {
        scope.additionalAttributesConceptName = "dummy";
        scope.observations = {};
        scope.patient = {uuid: "patientUuid", age: 10};
        scope.observations = [{
                concept: {
                    "uuid": "c393fd1d-3f10-11e4-adec-0800271c1b75",
                    "name": {
                        "display": "History and Examination",
                        "uuid": "c394068c-3f10-11e4-adec-0800271c1b75",
                        "name": "History and Examination",
                        "locale": "en",
                        "localePreferred": true,
                        "conceptNameType": "FULLY_SPECIFIED"
                    },
                    "set": true,
                    "datatype": {
                        "uuid": "8d4a4c94-c2cc-11de-8d13-0010c6dffd0f",
                        "display": "N/A",
                        "name": "N/A",
                        "description": "Not associated with a datatype (e.g., term answers, sets)",
                        "hl7Abbreviation": "ZZ",
                        "retired": false
                    },
                    "conceptClass": {
                        "uuid": "8d492774-c2cc-11de-8d13-0010c6dffd0f",
                        "display": "Misc",
                        "name": "Misc",
                        "description": "Terms which don't fit other categories",
                        "retired": false
                    },
                    "descriptions": [],
                    "answers": []
            }
        }];
        scope.conceptSetName ="History and Examination";

        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function (value) {
                return {defaults:{"Chief Complaint Notes":"default notes","History and Examination": "not default notes", "Example Notes": "example notes", "Second Example Notes": "example notes"}}
            }
        });

        conceptSetUiConfigService.getConfig.and.returnValue({
            additionalAttributesConceptName: {},
            "History and Examination" :{"hideAbnormalButton" :true,"numberOfVisits":4}
        });
    });

    describe("initialize the config",function(){
        beforeEach(function () {

            conceptSetService.getConcept.and.returnValue(specUtil.respondWith({}));

            httpBackend.expectGET("../common/concept-set/views/conceptSet.html").respond('<div>dummy</div>');

            var html = '<concept-set concept-set-name = "conceptSetName"  observations = "observations" required="true" show-title="" validation-handler="something" patient = "patient" concept-set-focused="no" collapse-inner-sections="no"></concept-set>';
            element = compile(html)(scope);
            scope.$digest();
            httpBackend.flush();
            compiledElementScope = element.isolateScope();
        });


        it("should apply form conditions for observation on AddMore", function () {
            // spyOn(scope.$root,'$broadcast').and.callThrough();
            // spyOn(scope.$root,'$on').and.callThrough();
            //
            // scope.$root.$broadcast('event:addMore', scope.observations);
            // scope.$digest();
            //
            // expect(scope.$root.$on).toHaveBeenCalledWith('event:addMore');
        });

        it("should set hideAbnormalButton value from config", function(){
            scope.$digest();
            expect(compiledElementScope.hideAbnormalButton).toBeTruthy();

        });

        it("should set number of visits from the config", function(){
            scope.$digest();

            expect(compiledElementScope.numberOfVisits).toBe(4);
        });
    });

    describe("init",function () {
        beforeEach(function(){
            Bahmni.ConceptSet.FormConditions.rules = {
                'Chief Complaint Notes' : function (formName, formFieldValues, patient) {
                    var chiefComplaint = formFieldValues['Chief Complaint Notes'];
                    if (chiefComplaint && patient.age === 10) {
                        return {
                            disable: ["Chief Complaint Data"],
                            hide: ["Example Notes"],
                            show: ["Second Example Notes"]
                        }
                    } else {
                        return {
                            enable: ["Chief Complaint Data"]
                        }
                    }
                }

            };

            conceptSetService.getConcept.and.returnValue(specUtil.createFakePromise(conceptResponse));

            httpBackend.expectGET("../common/concept-set/views/conceptSet.html").respond('<div>dummy</div>');

            var html = '<concept-set concept-set-name = "conceptSetName"  observations = "observations" required="true" show-title="" validation-handler="something" patient = "patient" concept-set-focused="no" collapse-inner-sections="no"></concept-set>';
            element = compile(html)(scope);
            scope.$digest();
            httpBackend.flush();
            compiledElementScope = element.isolateScope();
        });

        it("should initialize concept set", function(){

            expect(compiledElementScope.conceptSet.name.display).toBe("History and Examination");
            expect(compiledElementScope.conceptSet.name.uuid).toBe("c394068c-3f10-11e4-adec-0800271c1b75");
        });

        it("should initialize the rootObservation with proper value", function(){

            expect(compiledElementScope.rootObservation).toBeDefined();
            expect(compiledElementScope.showEmptyConceptSetMessage).toBeFalsy();

        });

        it("should update the observations on root scope",function () {

            expect(compiledElementScope.observations[0].groupMembers).toBeDefined();
            expect(compiledElementScope.observations[0].isObservation).toBeTruthy();
        });

        it("should set the default value for observation",function(){

            expect(compiledElementScope.rootObservation.groupMembers[0].value).toBe("default notes")
        });

        it("should not set the default value for root observation even we configure",function(){

            expect(compiledElementScope.rootObservation.value).toBeUndefined();

        });
        
        it("should update form conditions", function(){

            expect(compiledElementScope.rootObservation.groupMembers[1].disabled).toBeTruthy();
        });

        it("should hide 'Example Notes' while updating the form conditions", function(){
            expect(compiledElementScope.rootObservation.groupMembers[2].hide).toBeTruthy();
        });

        it("should show 'Second Example Notes' while updating the form conditions", function(){
            expect(compiledElementScope.rootObservation.groupMembers[3].hide).toBeFalsy();
        });

    });

    var conceptResponse = {
        "results": [
            {
                "uuid": "c393fd1d-3f10-11e4-adec-0800271c1b75",
                "name": {
                    "display": "History and Examination",
                    "uuid": "c394068c-3f10-11e4-adec-0800271c1b75",
                    "name": "History and Examination",
                    "locale": "en",
                    "localePreferred": true,
                    "conceptNameType": "FULLY_SPECIFIED"
                },
                "set": true,
                "datatype": {
                    "uuid": "8d4a4c94-c2cc-11de-8d13-0010c6dffd0f",
                    "display": "N/A",
                    "name": "N/A",
                    "description": "Not associated with a datatype (e.g., term answers, sets)",
                    "hl7Abbreviation": "ZZ",
                    "retired": false
                },
                "conceptClass": {
                    "uuid": "8d492774-c2cc-11de-8d13-0010c6dffd0f",
                    "display": "Misc",
                    "name": "Misc",
                    "description": "Terms which don't fit other categories",
                    "retired": false
                },
                "descriptions": [],
                "answers": [],
                "setMembers": [
                    {
                        "uuid": "c398a4be-3f10-11e4-adec-0800271c1b75",
                        "name": {
                            "display": "Chief Complaint Notes",
                            "uuid": "c398acc0-3f10-11e4-adec-0800271c1b75",
                            "name": "Chief Complaint Notes",
                            "locale": "en",
                            "localePreferred": true,
                            "conceptNameType": "FULLY_SPECIFIED"
                        },
                        "set": false,
                        "datatype": {
                            "uuid": "8d4a4ab4-c2cc-11de-8d13-0010c6dffd0f",
                            "display": "Text",
                            "name": "Text",
                            "description": "Free text",
                            "hl7Abbreviation": "ST",
                            "retired": false
                        },
                        "conceptClass": {
                            "uuid": "8d492774-c2cc-11de-8d13-0010c6dffd0f",
                            "display": "Misc",
                            "name": "Misc",
                            "description": "Terms which don't fit other categories",
                            "retired": false
                        },
                        "descriptions": [],
                        "answers": []
                    },
                    {
                        "uuid": "c3949eb6-3f10-11e4-adec-0800271c1b75",
                        "name": {
                            "display": "Chief Complaint Data",
                            "uuid": "c394a585-3f10-11e4-adec-0800271c1b75",
                            "name": "Chief Complaint Data",
                            "locale": "en",
                            "localePreferred": true,
                            "conceptNameType": "FULLY_SPECIFIED"
                        },
                        "datatype": {
                            "uuid": "8d4a4c94-c2cc-11de-8d13-0010c6dffd0f",
                            "display": "N/A",
                            "name": "N/A",
                            "description": "Not associated with a datatype (e.g., term answers, sets)",
                            "hl7Abbreviation": "ZZ",
                            "retired": false
                        },
                        "conceptClass": {
                            "uuid": "82516ba3-3f10-11e4-adec-0800271c1b75",
                            "display": "N/A",
                            "name": "N/A",
                            "description": "Concept Details class",
                            "retired": false
                        },
                        "descriptions": [],
                        "answers": []
                    },
                    {
                        "uuid": "c3949eb6-3f10-11e4-adec-0800271c1b76",
                        "name": {
                            "display": "Example Notes",
                            "uuid": "c394a585-3f10-11e4-adec-0800271c1b76",
                            "name": "Example Notes",
                            "locale": "en",
                            "localePreferred": true,
                            "conceptNameType": "FULLY_SPECIFIED"
                        },
                        "datatype": {
                            "uuid": "8d4a4c94-c2cc-11de-8d13-0010c6dffd01",
                            "display": "N/A",
                            "name": "N/A",
                            "description": "Not associated with a datatype (e.g., term answers, sets)",
                            "hl7Abbreviation": "ZZ",
                            "retired": false
                        },
                        "conceptClass": {
                            "uuid": "82516ba3-3f10-11e4-adec-0800271c1b75",
                            "display": "N/A",
                            "name": "N/A",
                            "description": "Concept Details class",
                            "retired": false
                        },
                        "descriptions": [],
                        "answers": []
                    },
                    {
                        "uuid": "c3949eb6-3f10-11e4-adec-0800271c1b77",
                        "name": {
                            "display": "Second Example Notes",
                            "uuid": "c394a585-3f10-11e4-adec-0800271c1b77",
                            "name": "Second Example Notes",
                            "locale": "en",
                            "localePreferred": true,
                            "conceptNameType": "FULLY_SPECIFIED"
                        },
                        "datatype": {
                            "uuid": "8d4a4c94-c2cc-11de-8d13-0010c6dffd02",
                            "display": "N/A",
                            "name": "N/A",
                            "description": "Not associated with a datatype (e.g., term answers, sets)",
                            "hl7Abbreviation": "ZZ",
                            "retired": false
                        },
                        "conceptClass": {
                            "uuid": "82516ba3-3f10-11e4-adec-0800271c1b77",
                            "display": "N/A",
                            "name": "N/A",
                            "description": "Concept Details class",
                            "retired": false
                        },
                        "descriptions": [],
                        "answers": []
                    }
                ]
            }
        ]
    };
});
