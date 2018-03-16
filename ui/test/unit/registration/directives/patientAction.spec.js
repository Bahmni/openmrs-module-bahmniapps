'use strict';

describe('PatientAction', function () {
    var appDescriptor, spinner, provide, state, scope, $bahmniCookieStore, $location, $window, appService,
        visitService, encounterService, sessionService, messagingService, auditLogService, messageParams;

    beforeEach(module('bahmni.registration'));

    describe("when there is no patientUuid on the stateParams", function () {
        var initProvider = function (input) {
            module(function ($provide) {
                provide = $provide;
                provide.value('$stateParams', input.stateParams);
                state = jasmine.createSpyObj('$state', ['go']);
                $window = jasmine.createSpyObj('$window', ['location']);
                spinner = jasmine.createSpyObj('spinner', ['forPromise']);
                spinner.forPromise.and.callFake(function () {
                    return;
                });
                appDescriptor = jasmine.createSpyObj('appDescriptor', ['getExtensions', 'getConfigValue', 'formatUrl']);
                appDescriptor.getExtensions.and.returnValue(input.appDescriptor.getExtensions);
                appDescriptor.getConfigValue.and.callFake(function (value) {
                    if (value == 'defaultVisitType') {
                        return input.appDescriptor.getConfigValue.defaultVisitType;
                    } else if (value == 'showStartVisitButton') {
                        return input.appDescriptor.getConfigValue.showStartVisitButton;
                    } else if (value == 'forwardUrlsForVisitTypes') {
                        return input.appDescriptor.getConfigValue.forwardUrls;
                    }
                });
                appDescriptor.formatUrl.and.callFake(function (value) {
                    if (value) {
                        return input.appDescriptor.formattedUrl;
                    }
                });
                appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
                appService.getAppDescriptor.and.returnValue(appDescriptor);
                $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get', 'remove', 'put']);
                $bahmniCookieStore.get.and.callFake(function () {
                    return {uuid: "uuid"};
                });
                $location = jasmine.createSpyObj('$location', ['path']);
                visitService = jasmine.createSpyObj('visitService', ['search', 'createVisit']);
                visitService.search.and.returnValue(specUtil.simplePromise(input.visitSearchResults));
                var visitResponse = {uuid: "visitUuid", visitType: {display: 'OPD'}};
                visitService.createVisit.and.returnValue(specUtil.simplePromise({data: visitResponse}));
                encounterService = jasmine.createSpyObj('encounterService', ['']);
                sessionService = jasmine.createSpyObj('sessionService', ['']);
                messagingService = jasmine.createSpyObj('messagingService', ['showMessage', 'clearAll']);
                auditLogService = jasmine.createSpyObj('auditLogService', ['log']);
                auditLogService.log.and.returnValue(specUtil.simplePromise({}));
                messageParams = {visitUuid: visitResponse.uuid, visitType: visitResponse.visitType.display};
                provide.value('$state', state);
                provide.value('$window', $window);
                provide.value('spinner', spinner);
                provide.value('appService', appService);
                provide.value('$bahmniCookieStore', $bahmniCookieStore);
                provide.value('$location', $location);
                provide.value('visitService', visitService);
                provide.value('encounterService', encounterService);
                provide.value('sessionService', sessionService);
                provide.value('messagingService', messagingService);
                provide.value('auditLogService', auditLogService);
            });
        };

        var injectDependencies = function () {
            inject(function (_$compile_, $rootScope, $httpBackend) {
                $rootScope.regEncounterConfiguration = {
                    getDefaultVisitType: function () {
                        return "defaultVisitType";
                    },
                    getVisitTypesAsArray: function () {
                        return [{type: 'IPD'}, {type: "OPD"}];
                    }
                };
                $rootScope.visitLocation = "visitLocationUuid";
                scope = $rootScope;
                scope.actions = {};
                var compile = _$compile_;
                var element = angular.element('<patient-action><patient-action/>');
                $httpBackend.expectGET('views/patientAction.html').respond('<div>dummy</div>');

                compile(element)(scope);
                scope.$digest();
                $httpBackend.flush();
            });
        };

        it("should set the forwardActionKey to configAction, If config is defined for Extensions", function () {
            var input = {appDescriptor: {getExtensions: [{}], getConfigValue: {}}, stateParams: {}};
            initProvider(input);
            injectDependencies();
            expect(scope.forwardActionKey).toBe("configAction");
        });

        it("should set the forwardActionKey to undefined, If config is not defined for Extensions", function () {
            var input = {appDescriptor: {getExtensions: [], getConfigValue: {}}, stateParams: {}};
            initProvider(input);
            injectDependencies();
            expect(scope.forwardActionKey).toBe("startVisit");
        });

        it("should set the forwardActionKey to enterVisitDetails, If forwardUrls and Extensions are not configured", function () {
            var patientUuid = 'patientUuid';
            var visitSearchParams = { patient: patientUuid, includeInactive: false, v: 'custom:(uuid,visitType,location:(uuid))' };
            var visitSearchResults = {data: {results: [{location: {uuid: "visitLocationUuid"}}]}};
            var input = {appDescriptor: {getExtensions: [], getConfigValue: {}}, stateParams: {patientUuid: patientUuid}, visitSearchResults: visitSearchResults};
            initProvider(input);
            injectDependencies();
            expect(scope.forwardActionKey).toBe("enterVisitDetails");
            expect(visitService.search).toHaveBeenCalledWith(visitSearchParams);
        });

        it("should set the forwardActionKey to enterVisitDetails, If forwardUrls is configured and a match not found with active visit type", function () {
            var patientUuid = 'patientUuid';
            var visitSearchParams = { patient: patientUuid, includeInactive: false, v: 'custom:(uuid,visitType,location:(uuid))' };
            var activeVisitTypeName = 'REG';
            var visitSearchResults = {data: {results: [{location: {uuid: "visitLocationUuid"}, visitType: {name: activeVisitTypeName}}]}};
            var forwardUrlList = [{
                "visitType": "IPD",
                "forwardUrl": "../clinical/#/programs/patient/{{patientUuid}}/consultationContext",
                "translationKey": "Enter Visit details",
                "shortcutKey": "c"
            }, {
                "visitType": "OPD",
                "forwardUrl": "../document-upload/?encounterType=RADIOLOGY&topLevelConcept=Radiology#/patient/{{patientUuid}}/document",
                "translationKey": "Enter <u>D</u>ocuments upload",
                "shortcutKey": "d"
            }];
            var configValues = {defaultVisitType: "IPD", showStartVisitButton: true, forwardUrls: forwardUrlList};
            var input = {appDescriptor: {getExtensions: [], getConfigValue: configValues}, stateParams: {patientUuid: patientUuid}, visitSearchResults: visitSearchResults};
            initProvider(input);
            injectDependencies();
            expect(scope.forwardActionKey).toBe("enterVisitDetails");
            expect(visitService.search).toHaveBeenCalledWith(visitSearchParams);
        });

        it("should set the forwardActionKey to forwardAction, If forwardUrls is configured and a match found with active visit type", function () {
            var patientUuid = 'patientUuid';
            var visitSearchParams = { patient: patientUuid, includeInactive: false, v: 'custom:(uuid,visitType,location:(uuid))' };
            var activeVisitTypeName = 'IPD';
            var visitSearchResults = {data: {results: [{location: {uuid: "visitLocationUuid"}, visitType: {name: activeVisitTypeName}}]}};
            var forwardUrlList = [{
                "visitType": "IPD",
                "forwardUrl": "../clinical/#/programs/patient/{{patientUuid}}/consultationContext",
                "translationKey": "Enter Visit details",
                "shortcutKey": "c"
            }, {
                "visitType": "OPD",
                "forwardUrl": "../document-upload/?encounterType=RADIOLOGY&topLevelConcept=Radiology#/patient/{{patientUuid}}/document",
                "translationKey": "Enter <u>D</u>ocuments upload",
                "shortcutKey": "d"
            }];
            var configValues = {defaultVisitType: "IPD", showStartVisitButton: true, forwardUrls: forwardUrlList};
            var input = {appDescriptor: {getExtensions: [], getConfigValue: configValues}, stateParams: {patientUuid: patientUuid}, visitSearchResults: visitSearchResults};
            initProvider(input);
            injectDependencies();
            expect(scope.forwardActionKey).toBe("forwardAction");
            expect(scope.activeVisitConfig).toBe(forwardUrlList[0]);
            expect(scope.activeVisitConfig.translationKey).toBe(forwardUrlList[0].translationKey);
            expect(visitService.search).toHaveBeenCalledWith(visitSearchParams);
        });

        it("should set the forwardActionKey to forwardAction, If forwardUrls is configured and a match found with active visit type and no translationKey on matched entry", function () {
            var patientUuid = 'patientUuid';
            var visitSearchParams = { patient: patientUuid, includeInactive: false, v: 'custom:(uuid,visitType,location:(uuid))' };
            var activeVisitTypeName = 'IPD';
            var visitSearchResults = {data: {results: [{location: {uuid: "visitLocationUuid"}, visitType: {name: activeVisitTypeName}}]}};
            var forwardUrlList = [{
                "visitType": "IPD",
                "forwardUrl": "../clinical/#/programs/patient/{{patientUuid}}/consultationContext",
                "shortcutKey": "c"
            }, {
                "visitType": "OPD",
                "forwardUrl": "../document-upload/?encounterType=RADIOLOGY&topLevelConcept=Radiology#/patient/{{patientUuid}}/document",
                "shortcutKey": "d"
            }];
            var configValues = {defaultVisitType: "IPD", showStartVisitButton: true, forwardUrls: forwardUrlList};
            var input = {appDescriptor: {getExtensions: [], getConfigValue: configValues}, stateParams: {patientUuid: patientUuid}, visitSearchResults: visitSearchResults};
            initProvider(input);
            injectDependencies();
            expect(scope.forwardActionKey).toBe("forwardAction");
            expect(scope.activeVisitConfig).toBe(forwardUrlList[0]);
            expect(scope.activeVisitConfig.translationKey).toBe('REGISTRATION_LABEL_ENTER_VISIT');
            expect(visitService.search).toHaveBeenCalledWith(visitSearchParams);
        });

        it("should set the submitSource to startVisit on selecting the visitType", function () {
            var patientUuid = 'patientUuid';
            var visitSearchResults = {data: {results: []}};
            var configValues = {defaultVisitType: "IPD", showStartVisitButton: true, forwardUrls: []};
            var input = {appDescriptor: {getExtensions: [], getConfigValue: configValues}, stateParams: {patientUuid: patientUuid}, visitSearchResults: visitSearchResults};
            initProvider(input);
            injectDependencies();
            var selectedVisitType = {name: "IPD"};
            scope.visitControl.startVisit(selectedVisitType);
            expect(scope.actions.submitSource).toBe("startVisit");
        });

        it("should create a new Visit on selecting the visitType and submitSource set to startVisit, if forwardUrl is present", function () {
            var patientUuid = 'patientUuid';
            var visitSearchResults = {data: {results: []}};
            var forwardUrlList = [{
                "visitType": "IPD",
                "forwardUrl": "../clinical/#/programs/patient/{{patientUuid}}/consultationContext",
                "shortcutKey": "c"
            }, {
                "visitType": "OPD",
                "forwardUrl": "../document-upload/?encounterType=RADIOLOGY&topLevelConcept=Radiology#/patient/{{patientUuid}}/document",
                "shortcutKey": "d"
            }];
            var configValues = {defaultVisitType: "IPD", showStartVisitButton: true, forwardUrls: forwardUrlList};
            var input = {appDescriptor: {getExtensions: [], getConfigValue: configValues, formattedUrl: "../clinical/#/programs/patient/patientUuid/consultationContext"}, stateParams: {patientUuid: patientUuid}, visitSearchResults: visitSearchResults};
            initProvider(input);
            injectDependencies();

            var selectedVisitType = {name: "IPD"};
            scope.visitControl.startVisit(selectedVisitType);
            var patientProfileData = {patient: {uuid: patientUuid}};
            scope.actions.followUpAction(patientProfileData);
            expect(messagingService.clearAll).toHaveBeenCalled();
            expect(scope.actions.submitSource).toBe("startVisit");
            expect($window.location.href).toBe("../clinical/#/programs/patient/patientUuid/consultationContext");
            expect(auditLogService.log).toHaveBeenCalledWith(patientUuid, 'OPEN_VISIT', messageParams, 'MODULE_LABEL_REGISTRATION_KEY');
        });

        it("should create a new Visit on selecting the visitType and submitSource set to startVisit, if forwardUrl is not present", function () {
            var patientUuid = 'patientUuid';
            var visitSearchResults = {data: {results: []}};
            var forwardUrlList = [{
                "visitType": "IPD",
                "forwardUrl": "../clinical/#/programs/patient/{{patientUuid}}/consultationContext",
                "shortcutKey": "c"
            }, {
                "visitType": "OPD",
                "forwardUrl": "../document-upload/?encounterType=RADIOLOGY&topLevelConcept=Radiology#/patient/{{patientUuid}}/document",
                "shortcutKey": "d"
            }];
            var configValues = {defaultVisitType: "IPD", showStartVisitButton: true, forwardUrls: []};
            var input = {appDescriptor: {getExtensions: [], getConfigValue: configValues, formattedUrl: "../clinical/#/programs/patient/patientUuid/consultationContext"}, stateParams: {patientUuid: patientUuid}, visitSearchResults: visitSearchResults};
            initProvider(input);
            injectDependencies();

            scope.patient = {};
            var selectedVisitType = {name: "IPD"};
            scope.visitControl.startVisit(selectedVisitType);
            var patientProfileData = {patient: {uuid: patientUuid, person: {names: [{display: "Test Patient"}]}}};
            scope.actions.followUpAction(patientProfileData);
            expect(messagingService.clearAll).toHaveBeenCalled();
            expect(scope.actions.submitSource).toBe("startVisit");
            expect(scope.patient.uuid).toBe(patientUuid);
            expect(scope.patient.name).toBe("Test Patient");
            expect($location.path).toHaveBeenCalledWith("/patient/patientUuid/visit");
            expect(auditLogService.log).toHaveBeenCalledWith(patientUuid, 'OPEN_VISIT', messageParams, 'MODULE_LABEL_REGISTRATION_KEY');
        });

        it("should go to configured forwardUrl, if the submitSource is forwardAction", function () {
            var patientUuid = 'patientUuid';
            var activeVisitTypeName = "IPD";
            var visitSearchResults = {data: {results: [{location: {uuid: "visitLocationUuid"}, visitType: {name: activeVisitTypeName}}]}};
            var forwardUrlList = [{
                "visitType": "IPD",
                "forwardUrl": "../clinical/#/programs/patient/{{patientUuid}}/consultationContext",
                "shortcutKey": "c"
            }, {
                "visitType": "OPD",
                "forwardUrl": "../document-upload/?encounterType=RADIOLOGY&topLevelConcept=Radiology#/patient/{{patientUuid}}/document",
                "shortcutKey": "d"
            }];
            var configValues = {defaultVisitType: "IPD", showStartVisitButton: true, forwardUrls: forwardUrlList};
            var input = {appDescriptor: {getExtensions: [], getConfigValue: configValues, formattedUrl: "../clinical/#/programs/patient/patientUuid/consultationContext"}, stateParams: {patientUuid: patientUuid}, visitSearchResults: visitSearchResults};
            initProvider(input);
            injectDependencies();
            scope.setSubmitSource("forwardAction");
            var patientProfileData = {patient: {uuid: patientUuid, person: {names: [{display: "Test Patient"}]}}};
            scope.actions.followUpAction(patientProfileData);
            expect(messagingService.clearAll).toHaveBeenCalled();
            expect(scope.actions.submitSource).toBe("forwardAction");
            expect($window.location.href).toBe("../clinical/#/programs/patient/patientUuid/consultationContext");
        });

        it("should go to enterVisitDetails page, if the submitSource is enterVisitDetails", function () {
            var patientUuid = 'patientUuid';
            var activeVisitTypeName = "IPD";
            var visitSearchResults = {data: {results: [{location: {uuid: "visitLocationUuid"}, visitType: {name: activeVisitTypeName}}]}};
            var forwardUrlList = [{
                "visitType": "IPD",
                "forwardUrl": "../clinical/#/programs/patient/{{patientUuid}}/consultationContext",
                "shortcutKey": "c"
            }, {
                "visitType": "OPD",
                "forwardUrl": "../document-upload/?encounterType=RADIOLOGY&topLevelConcept=Radiology#/patient/{{patientUuid}}/document",
                "shortcutKey": "d"
            }];
            var configValues = {defaultVisitType: "IPD", showStartVisitButton: true, forwardUrls: forwardUrlList};
            var input = {appDescriptor: {getExtensions: [], getConfigValue: configValues, formattedUrl: "../clinical/#/programs/patient/patientUuid/consultationContext"}, stateParams: {patientUuid: patientUuid}, visitSearchResults: visitSearchResults};
            initProvider(input);
            injectDependencies();
            scope.patient = {};
            scope.setSubmitSource("enterVisitDetails");
            var patientProfileData = {patient: {uuid: patientUuid, person: {names: [{display: "Test Patient"}]}}};
            scope.actions.followUpAction(patientProfileData);
            expect(messagingService.clearAll).toHaveBeenCalled();
            expect(scope.actions.submitSource).toBe("enterVisitDetails");
            expect(scope.patient.uuid).toBe(patientUuid);
            expect(scope.patient.name).toBe("Test Patient");
            expect($location.path).toHaveBeenCalledWith("/patient/patientUuid/visit");
        });

        it("should go to cofingAction forwardUrl, if the submitSource is configAction and there is an active visit", function () {
            var patientUuid = 'patientUuid';
            var activeVisitTypeName = "IPD";
            var visitSearchResults = {data: {results: [{location: {uuid: "visitLocationUuid"}, visitType: {name: activeVisitTypeName}}]}};
            var configValues = {defaultVisitType: "IPD", showStartVisitButton: true, forwardUrls: []};
            var extension = [{
                "id": "bahmni.patient.registration.next",
                "extensionPointId": "org.bahmni.registration.patient.next",
                "type": "config",
                "extensionParams": {
                    "display": "Enter Clinical Details",
                    "shortcutKey": "r",
                    "forwardUrl": "../clinical/#/default/patient/{{patientUuid}}/consultationContext"
                },
                "order": 1,
                "requiredPrivilege": "Edit Patients"
            }];
            var input = {appDescriptor: {getExtensions: extension, getConfigValue: configValues, formattedUrl: "../clinical/#/programs/patient/patientUuid/consultationContext"}, stateParams: {patientUuid: patientUuid}, visitSearchResults: visitSearchResults};
            initProvider(input);
            injectDependencies();
            scope.setSubmitSource("configAction");
            var patientProfileData = {patient: {uuid: patientUuid, person: {names: [{display: "Test Patient"}]}}};
            scope.actions.followUpAction(patientProfileData);
            expect(messagingService.clearAll).toHaveBeenCalled();
            expect(scope.actions.submitSource).toBe("configAction");
            expect($window.location.href).toBe("../clinical/#/programs/patient/patientUuid/consultationContext");
        });

        it("should create a visit and go to configAction forwardUrl, if the configAction forwardUrl present and the submitSource is configAction and there is no active visit", function () {
            var patientUuid = 'patientUuid';
            var activeVisitTypeName = "IPD";
            var visitSearchResults = {data: {results: []}};
            var configValues = {defaultVisitType: "IPD", showStartVisitButton: true, forwardUrls: []};
            var extension = [{
                "id": "bahmni.patient.registration.next",
                "extensionPointId": "org.bahmni.registration.patient.next",
                "type": "config",
                "extensionParams": {
                    "display": "Enter Clinical Details",
                    "shortcutKey": "r",
                    "forwardUrl": "../clinical/#/default/patient/{{patientUuid}}/consultationContext"
                },
                "order": 1,
                "requiredPrivilege": "Edit Patients"
            }];
            var input = {appDescriptor: {getExtensions: extension, getConfigValue: configValues, formattedUrl: "../clinical/#/programs/patient/patientUuid/consultationContext"}, stateParams: {patientUuid: patientUuid}, visitSearchResults: visitSearchResults};
            initProvider(input);
            injectDependencies();

            var selectedVisitType = {name: "IPD"};
            scope.visitControl.startVisit(selectedVisitType);
            scope.setSubmitSource("configAction");
            var patientProfileData = {patient: {uuid: patientUuid, person: {names: [{display: "Test Patient"}]}}};
            scope.actions.followUpAction(patientProfileData);
            expect(messagingService.clearAll).toHaveBeenCalled();
            expect(scope.actions.submitSource).toBe("configAction");
            expect($window.location.href).toBe("../clinical/#/programs/patient/patientUuid/consultationContext");
            expect(auditLogService.log).toHaveBeenCalledWith(patientUuid, 'OPEN_VISIT', messageParams, 'MODULE_LABEL_REGISTRATION_KEY');
        });

        it("should create a visit and go to visitDetails page, if the configAction forwardUrl not present and the submitSource is configAction and there is no active visit", function () {
            var patientUuid = 'patientUuid';
            var visitSearchResults = {data: {results: []}};
            var configValues = {defaultVisitType: "IPD", showStartVisitButton: true, forwardUrls: []};
            var extension = [{
                "id": "bahmni.patient.registration.next",
                "extensionPointId": "org.bahmni.registration.patient.next",
                "type": "config",
                "extensionParams": {
                    "display": "Enter Clinical Details",
                    "shortcutKey": "r"
                },
                "order": 1,
                "requiredPrivilege": "Edit Patients"
            }];
            var input = {appDescriptor: {getExtensions: extension, getConfigValue: configValues, formattedUrl: "../clinical/#/programs/patient/patientUuid/consultationContext"}, stateParams: {patientUuid: patientUuid}, visitSearchResults: visitSearchResults};
            initProvider(input);
            injectDependencies();

            scope.patient = {};
            var selectedVisitType = {name: "IPD"};
            scope.visitControl.startVisit(selectedVisitType);
            scope.setSubmitSource("configAction");
            var patientProfileData = {patient: {uuid: patientUuid, person: {names: [{display: "Test Patient"}]}}};
            scope.actions.followUpAction(patientProfileData);
            expect(messagingService.clearAll).toHaveBeenCalled();
            expect(scope.actions.submitSource).toBe("configAction");
            expect(scope.patient.uuid).toBe(patientUuid);
            expect(scope.patient.name).toBe("Test Patient");
            expect($location.path).toHaveBeenCalledWith("/patient/patientUuid/visit");
            expect(auditLogService.log).toHaveBeenCalledWith(patientUuid, 'OPEN_VISIT', messageParams, 'MODULE_LABEL_REGISTRATION_KEY');
        });

        it("should create a visit and go to visitDetails page, if the configAction forwardUrl not present and the submitSource is configAction and there is no active visit", function () {
            var patientUuid = 'patientUuid';
            var visitSearchResults = {data: {results: []}};
            var configValues = {defaultVisitType: "IPD", showStartVisitButton: true, forwardUrls: []};
            var extension = [{
                "id": "bahmni.patient.registration.next",
                "extensionPointId": "org.bahmni.registration.patient.next",
                "type": "config",
                "extensionParams": {
                    "display": "Enter Clinical Details",
                    "shortcutKey": "r"
                },
                "order": 1,
                "requiredPrivilege": "Edit Patients"
            }];
            var input = {appDescriptor: {getExtensions: extension, getConfigValue: configValues, formattedUrl: "../clinical/#/programs/patient/patientUuid/consultationContext"}, stateParams: {patientUuid: patientUuid}, visitSearchResults: visitSearchResults};
            initProvider(input);
            injectDependencies();

            scope.patient = {};
            var selectedVisitType = {name: "IPD"};
            scope.visitControl.startVisit(selectedVisitType);
            scope.setSubmitSource("configAction");
            var patientProfileData = {patient: {uuid: patientUuid, person: {names: [{display: "Test Patient"}]}}};
            scope.actions.followUpAction(patientProfileData);
            expect(messagingService.clearAll).toHaveBeenCalled();
            expect(scope.actions.submitSource).toBe("configAction");
            expect(scope.patient.uuid).toBe(patientUuid);
            expect(scope.patient.name).toBe("Test Patient");
            expect($location.path).toHaveBeenCalledWith("/patient/patientUuid/visit");
            expect(auditLogService.log).toHaveBeenCalledWith(patientUuid, 'OPEN_VISIT', messageParams, 'MODULE_LABEL_REGISTRATION_KEY');
        });

        it("should set showStartVisitButton to true, if showStartVisitButton config is not present", function () {
            var configValues = {defaultVisitType: "IPD", forwardUrls: []};
            var input = {appDescriptor: {getExtensions: [], getConfigValue: configValues}, stateParams: {patientUuid: 'patientUuid'}, visitSearchResults: {data:{}}};
            initProvider(input);
            injectDependencies();
            expect(scope.showStartVisitButton()).toBe(true);
        });

        it("should set showStartVisitButton to false, if showStartVisitButton config is false", function () {
            var configValues = {defaultVisitType: "IPD", forwardUrls: [], showStartVisitButton: false};
            var input = {appDescriptor: {getExtensions: [], getConfigValue: configValues}, stateParams: {patientUuid: 'patientUuid'}, visitSearchResults: {data:{}}};
            initProvider(input);
            injectDependencies();
            expect(scope.showStartVisitButton()).toBe(false);
        });

        it("should set showStartVisitButton to false, if showStartVisitButton config is true", function () {
            var configValues = {defaultVisitType: "IPD", forwardUrls: [], showStartVisitButton: true};
            var input = {appDescriptor: {getExtensions: [], getConfigValue: configValues}, stateParams: {patientUuid: 'patientUuid'}, visitSearchResults: {data:{}}};
            initProvider(input);
            injectDependencies();
            expect(scope.showStartVisitButton()).toBe(true);
        });
    });
});
