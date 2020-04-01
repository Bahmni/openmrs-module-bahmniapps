'use strict';

describe('ConceptSetPageController', function () {
    var scope, controller, rootScope, conceptSetService, configurations, clinicalAppConfigService, state, encounterConfig, spinner, messagingService, translate, stateParams, formService;
    stateParams = {conceptSetGroupName: "concept set group name"};
    var extension = {"extension": {
        extensionParams: {}
    }};

    beforeEach(module('bahmni.common.uiHelper'));
    beforeEach(module('bahmni.clinical'));

    var initController = function () {
        inject(function ($controller, $rootScope) {
            controller = $controller;
            scope = $rootScope.$new();
            rootScope = $rootScope;
        });

        rootScope.currentUser = {
            isFavouriteObsTemplate: function () {
                return true;
            }
        };

        var register = function () {
        };

        scope.consultation = {
            preSaveHandler: {
                register: register
            }
        };

        state = {
            params: {}
        };

        encounterConfig = jasmine.createSpyObj("encounterConfig", ["getVisitTypeByUuid"]);
        clinicalAppConfigService = jasmine.createSpyObj("clinicalAppConfigService", ["getAllConceptSetExtensions", "getAllConceptsConfig"]);
        var configs = {
            "Baseline": {
                "allowAddMore": true
            },
            "Followup Assessment": {
                "allowAddMore": true
            }
        };
        clinicalAppConfigService.getAllConceptsConfig.and.returnValue(configs);
        configurations = jasmine.createSpyObj("configurations", ["encounterConfig"]);
        configurations.encounterConfig.and.returnValue(encounterConfig);
        conceptSetService = jasmine.createSpyObj("conceptSetService", ["getConcept", "getObsTemplatesForProgram"]);
        formService = jasmine.createSpyObj("formService", ["getFormList"]);
        spinner = jasmine.createSpyObj("spinner", ["forPromise"]);
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
        translate = jasmine.createSpyObj('$translate',['instant']);
    };

    beforeEach(initController);

    var createController = function () {
        clinicalAppConfigService.getAllConceptSetExtensions.and.returnValue(extension);
        return controller("ConceptSetPageController", {
            $scope: scope,
            $rootScope: rootScope,
            $stateParams: stateParams,
            conceptSetService: conceptSetService,
            formService: formService,
            clinicalAppConfigService: clinicalAppConfigService,
            messagingService: messagingService,
            configurations: configurations,
            $state: state,
            spinner: spinner,
            $translate : translate
        });
    };

    var mockConceptSetService = function (conceptResponseData, entityMappingResponseData) {
        conceptSetService.getConcept.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({"data" :conceptResponseData});
                }
            }
        });

        conceptSetService.getObsTemplatesForProgram.and.callFake(function () {
            return {
                success: function (callback) {
                    return callback(entityMappingResponseData);
                }
            }
        });
    };

    var mockformService = function (data) {
        formService.getFormList.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({"data" :data});
                }
            }
        });
    };

    describe('init', function () {
        it("should load all obs templates", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            mockformService({});
            rootScope.currentUser = {
                isFavouriteObsTemplate: function () {
                    return false;
                }
            };
            createController();

            expect(scope.allTemplates).toBeTruthy();
            expect(scope.allTemplates.length).toEqual(1);
            expect(scope.allTemplates[0].conceptName).toEqual("abcd");

            expect(scope.consultation.selectedObsTemplate.length).toBe(0);
        });

        it("should load the form2 forms", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            let nameTranslationForSimpleForm = [{locale:'en', display:'Simple_en'},
                {locale:'es', display:'Simple_es'}];
            var form2Data= [{
                    name: "Sample",
                    uuid:"96d89bfe-8b42-493c-bcc0-284ce0f5d12b",
                    version: "1",
                    published: true,
                    id: null,
                    resources: null,
                    nameTranslation: null
                },
                {
                    name: "Simple",
                    uuid: "71a11931-56bf-4792-9d12-81836aca0b1c",
                    version: "9",
                    published: true,
                    id: null,
                    resources: null,
                    nameTranslation: JSON.stringify(nameTranslationForSimpleForm)
                }];
            mockformService(form2Data);
            rootScope.currentUser = {
                isFavouriteObsTemplate: function () {
                    return false;
                }
            };
            localStorage.setItem("NG_TRANSLATE_LANG_KEY", "en");
            createController();
            expect(scope.consultation.observationForms[0].formName).toEqual( form2Data[0].name);
            expect(scope.consultation.observationForms[0].label).toEqual( form2Data[0].name);
            expect(scope.consultation.observationForms[0].conceptName).toEqual( form2Data[0].name);
            expect(scope.consultation.observationForms[0].formUuid).toEqual( form2Data[0].uuid);
            expect(scope.consultation.observationForms[0].formVersion).toEqual( form2Data[0].version);

            expect(scope.consultation.observationForms[1].formName).toEqual( form2Data[1].name);
            expect(scope.consultation.observationForms[1].label).toEqual( nameTranslationForSimpleForm[0].display);
            expect(scope.consultation.observationForms[1].conceptName).toEqual( form2Data[1].name);
            expect(scope.consultation.observationForms[1].formUuid).toEqual( form2Data[1].uuid);
            expect(scope.consultation.observationForms[1].formVersion).toEqual( form2Data[1].version);
        });

        it("should load all obs templates along with forms from implementers interface", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            var data = [
                {
                    name: "my form",
                    version: 1,
                    uuid: "my-form-uuid"
                }
            ];
            mockformService(data);
            rootScope.currentUser = {
                isFavouriteObsTemplate: function () {
                    return false;
                }
            };
            createController();

            expect(scope.allTemplates).toBeTruthy();
            expect(scope.allTemplates.length).toEqual(2);
            expect(scope.allTemplates[0].conceptName).toEqual("abcd");
            expect(scope.allTemplates[1].formName).toEqual("my form");

            expect(scope.consultation.selectedObsTemplate.length).toBe(0);
        });

        it("should push template to selected obs template when template is pinned as favorite", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            var data = [
                {
                    name: "my form",
                    version: 1,
                    uuid: "my-form-uuid"
                }
            ];
            mockConceptSetService(conceptResponseData);
            mockformService(data);
            createController();

            expect(scope.allTemplates).toBeTruthy();
            expect(scope.allTemplates.length).toEqual(2);
            expect(scope.allTemplates[0].conceptName).toEqual("abcd");
            expect(scope.allTemplates[1].conceptName).toEqual("my form");
            expect(scope.consultation.selectedObsTemplate.length).toBe(2);
            expect(scope.consultation.selectedObsTemplate[0].label).toBe("abcd");
            expect(scope.consultation.selectedObsTemplate[1].label).toBe("my form");
        });

        it("should push template to selected obs template when template is added as default in extensions", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            mockformService({});
            rootScope.currentUser = {
                isFavouriteObsTemplate: function () {
                    return false;
                }
            };
            extension = {"extension": {
                extensionParams: {conceptName: "abcd", default: true}
            }};

            createController();

            expect(scope.allTemplates).toBeTruthy();
            expect(scope.allTemplates.length).toEqual(1);
            expect(scope.allTemplates[0].conceptName).toEqual("abcd");
            expect(scope.consultation.selectedObsTemplate.length).toBe(1);
            expect(scope.consultation.selectedObsTemplate[0].label).toBe("abcd");
            expect(scope.consultation.selectedObsTemplate[0].isOpen).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate[0].isLoaded).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate[0].klass).toBe("active");

        });

        it("should load all obs templates according to the number of observations", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            var data = [
                {
                    name: "my form",
                    version: '1',
                    uuid: "my-form-uuid"
                }
            ];
            mockConceptSetService(conceptResponseData);
            mockformService(data);

            scope.patient = {}
            scope.consultation.observations = [{
                concept: {
                    name: "abcd",
                    uuid: 123
                },
                uuid: "cafedead"
            }, {
                concept: {
                    name: "abcd",
                    uuid: 123
                },
                uuid: "deadcafe"
            }, {
                concept: {
                    name: "random",
                    uuid: 124
                },
                formFieldPath: "my form.1/101",
                uuid: "random-uuid"
            }];
            createController();

            expect(scope.allTemplates).toBeTruthy();
            expect(scope.allTemplates.length).toEqual(3);

            expect(scope.consultation.selectedObsTemplate).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate.length).toEqual(3);

            expect(scope.consultation.selectedObsTemplate[0].conceptName).toEqual("abcd");
            expect(scope.consultation.selectedObsTemplate[0].observations[0].uuid).toEqual("cafedead");
            expect(scope.consultation.selectedObsTemplate[0].uuid).toEqual(123);

            expect(scope.consultation.selectedObsTemplate[1].conceptName).toEqual("abcd");
            expect(scope.consultation.selectedObsTemplate[1].observations[0].uuid).toEqual("deadcafe");
            expect(scope.consultation.selectedObsTemplate[1].uuid).toEqual(123);

            expect(scope.consultation.selectedObsTemplate[2].formName).toEqual("my form");
            expect(scope.consultation.selectedObsTemplate[2].observations[0].uuid).toEqual("random-uuid");
            expect(scope.consultation.selectedObsTemplate[2].formUuid).toEqual("my-form-uuid");
        });

        it("should load all templates specific to program when program uuid is present", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}, {name: {name: "efgh"}, uuid: 456}]
                    }
                ]
            };
            var entityMappingResponseData = {
                results: [{mappings: [{uuid: 456}]}]
            };
            mockConceptSetService(conceptResponseData, entityMappingResponseData);
            mockformService({});
            state = {
                params: {
                    programUuid: "programUuid"
                }
            };
            createController();

            expect(scope.allTemplates).toBeTruthy();
            expect(scope.allTemplates.length).toEqual(2);

            expect(scope.allTemplates[0].conceptName).toEqual("abcd");
            expect(scope.allTemplates[0].isAdded).toBeFalsy();
            expect(scope.allTemplates[0].alwaysShow).toBeFalsy();

            expect(scope.allTemplates[1].conceptName).toEqual("efgh");
            expect(scope.allTemplates[1].isAdded).toBeFalsy();
            expect(scope.allTemplates[1].alwaysShow).toBeTruthy();
        });

        it("should add template to the list when clicked", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123},
                            {name: {name: "Followup Assessment"}, uuid: 124},
                            {name: {name: "Baseline"}, uuid: 125},
                            {name: {name: "Baseline1"}, uuid: 126}
                        ]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            mockformService({});
            scope.patient = {}
            scope.consultation.observations = [{
                concept: {
                    name: "abcd",
                    uuid: 123
                },
                uuid: "cafedead"
            }, {
                concept: {
                    name: "Followup Assessment",
                    uuid: 124
                },
                uuid: "deadcafe"
            }];
            rootScope.currentUser = {
                isFavouriteObsTemplate: function () {
                    return false;
                }
            };

            createController();

            expect(scope.allTemplates.length).toEqual(4);
            expect(scope.consultation.selectedObsTemplate.length).toEqual(2);

            expect(scope.consultation.selectedObsTemplate[0].isOpen).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate[0].isLoaded).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate[0].klass).toBe("active");

            scope.consultation.selectedObsTemplate[1].isAdded = true;
            scope.addTemplate({label : "Followup Assessment", clone : function () {return {label : "Followup Assessment"}}});
            expect(scope.consultation.selectedObsTemplate.length).toEqual(3);
            expect(scope.consultation.selectedObsTemplate[2].klass).toBe("active");

            scope.addTemplate({label : "Baseline", toggle : function () {}});
            expect(scope.consultation.selectedObsTemplate.length).toEqual(4);
            var baselineTemplate = scope.consultation.selectedObsTemplate[2];
            expect(baselineTemplate.klass).toBe("active");

            scope.addTemplate({label : "Baseline1", toggle : function () {}});
            expect(scope.consultation.selectedObsTemplate.length).toEqual(5);
            var baseline1Template = scope.consultation.selectedObsTemplate[3];
            expect(baseline1Template.klass).toBe("active");
            expect(messagingService.showMessage).toHaveBeenCalled();
        });

        it("should sort templates based on the order it is saved and open the last visited template", function() {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "Baseline"}, uuid: 123}, {name: {name: "Followup Assessment"}, uuid: 124}]
                    }
                ]
            };

            mockConceptSetService(conceptResponseData);
            mockformService({});
            var observations = [{
                concept: {
                    name: "Baseline",
                    uuid: 123
                },
                uuid: "cafedead"
            }, {
                concept: {
                    name: "Followup Assessment",
                    uuid: 124
                },
                uuid: "deadcafe"
            }];

            scope.patient = {uuid: "patientUuid"}

            scope.consultation.observations = observations;

            var templatePreference = {
                "patientUuid": "patientUuid",
                "providerUuid": 'providerUuid',
                "templates": ["Followup Assessment", "Baseline"]
            };

            localStorage.setItem("templatePreference", JSON.stringify(templatePreference));
            rootScope.currentUser = {
                isFavouriteObsTemplate: function () {
                    return false;
                }
            };
            rootScope.currentProvider = { uuid: "providerUuid" };
            scope.consultation.lastvisited = 'concept-set-123';

            createController();

            expect(scope.consultation.observations.length).toBe(2);
            expect(scope.consultation.selectedObsTemplate[0].label).toBe("Followup Assessment");
            expect(scope.consultation.selectedObsTemplate[1].label).toBe("Baseline");
            expect(scope.consultation.selectedObsTemplate[1].isOpen).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate[1].isLoaded).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate[1].klass).toBe("active");
        })
    })
});