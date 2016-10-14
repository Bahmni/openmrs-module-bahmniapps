'use strict';

describe('ConceptSetPageController', function () {
    var scope, controller, rootScope, conceptSetService, configurations, clinicalAppConfigService, state, encounterConfig, spinner;

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
        clinicalAppConfigService.getAllConceptsConfig.and.returnValue({});
        configurations = jasmine.createSpyObj("configurations", ["encounterConfig"]);
        configurations.encounterConfig.and.returnValue(encounterConfig);
        conceptSetService = jasmine.createSpyObj("conceptSetService", ["getConcept", "getObsTemplatesForProgram"]);
        spinner = jasmine.createSpyObj("spinner", ["forPromise"]);
    };

    beforeEach(initController);

    var createController = function () {
        return controller("ConceptSetPageController", {
            $scope: scope,
            $rootScope: rootScope,
            $stateParams: {conceptSetGroupName: "concept set group name"},
            conceptSetService: conceptSetService,
            clinicalAppConfigService: clinicalAppConfigService,
            messagingService: null,
            configurations: configurations,
            $state: state,
            spinner: spinner
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

    describe('init', function () {
        it("should load all selected obs templates", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            createController();

            expect(scope.consultation.selectedObsTemplate).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate.length).toEqual(1);
            expect(scope.consultation.selectedObsTemplate[0].conceptName).toEqual("abcd");
        });

        it("should load all obs templates according to the number of observations", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            scope.consultation.observations = [{
                concept: {
                    uuid: 123
                },
                uuid: "cafedead"
            }, {
                concept: {
                    uuid: 123
                },
                uuid: "deadcafe"
            }];
            createController();

            expect(scope.consultation.selectedObsTemplate).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate.length).toEqual(2);

            expect(scope.consultation.selectedObsTemplate[0].conceptName).toEqual("abcd");
            expect(scope.consultation.selectedObsTemplate[0].observations[0].uuid).toEqual("cafedead");
            expect(scope.consultation.selectedObsTemplate[0].uuid).toEqual(123);

            expect(scope.consultation.selectedObsTemplate[1].conceptName).toEqual("abcd");
            expect(scope.consultation.selectedObsTemplate[1].observations[0].uuid).toEqual("deadcafe");
            expect(scope.consultation.selectedObsTemplate[1].uuid).toEqual(123);
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
            state = {
                params: {
                    programUuid: "programUuid"
                }
            };
            createController();

            expect(scope.consultation.selectedObsTemplate).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate.length).toEqual(2);

            expect(scope.consultation.selectedObsTemplate[0].conceptName).toEqual("abcd");
            expect(scope.consultation.selectedObsTemplate[0].isAdded).toBeFalsy();
            expect(scope.consultation.selectedObsTemplate[0].alwaysShow).toBeFalsy();

            expect(scope.consultation.selectedObsTemplate[1].conceptName).toEqual("efgh");
            expect(scope.consultation.selectedObsTemplate[1].isAdded).toBeFalsy();
            expect(scope.consultation.selectedObsTemplate[1].alwaysShow).toBeTruthy();
        });
    })
});