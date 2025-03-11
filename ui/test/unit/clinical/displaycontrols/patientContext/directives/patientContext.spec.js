'use strict';

describe('patient context', function () {
    var scope, $compile, mockBackend, patientService, observationsService, spinner, mockAppDescriptor, mockAppService, provide, mocktranslate;

    var observation = {
               "groupMembers": [
                   {
                       "encounterUuid": "efe78fd3-3ae5-41a5-9a0b-9181a3cd1b81",
                       "uuid": "c5843ec9-85b9-487b-a78a-0f2a844feb24",
                       "concept": {
                           "uuid": "9c653330-9825-4f1d-939a-96757bc7cb97",
                           "name": "Expected Date of Discharge",
                           "dataType": "Date",
                           "conceptClass": "Misc"
                       },
                       "voided": false,
                       "conceptUuid": "9c653330-9825-4f1d-939a-96757bc7cb97",
                       "value": "2017-01-03"
                   }
               ],
               "encounterUuid": "efe78fd3-3ae5-41a5-9a0b-9181a3cd1b81",
               "uuid": "c0415c40-8833-445f-945a-c51bb7bccd32",
               "concept": {
                   "uuid": "72baa954-4f6f-46a4-9289-144b4f973864",
                   "name": "Expected Date of Discharge Set",
                   "dataType": "N/A",
                   "conceptClass": "Misc"
               },
               "voided": false,
               "conceptUuid": "72baa954-4f6f-46a4-9289-144b4f973864",
               "observationDateTime": "2017-02-23T13:48:52.000+0200",
               "value": "1212121, 2017-01-03",
               "comment": null
           };

    beforeEach(module('bahmni.common.patient', function ($provide) {
        patientService = jasmine.createSpyObj('patientService', ['getPatientContext']);
        observationsService = jasmine.createSpyObj('observationsService', ['fetch']);
        $provide.value('patientService', patientService);
        $provide.value('observationsService', observationsService);

    }));

    beforeEach(module('bahmni.clinical', function ($provide) {
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        mockAppDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
        mockAppService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        mocktranslate = jasmine.createSpyObj('$translate', ['instant']);
        provide = $provide;
        $provide.value('spinner', spinner);
        $provide.value('appService', mockAppService);
        $provide.value('$state', {params: {enrollment: 'programUuid'}});
        $provide.value('$translate', mocktranslate);
    }));

    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend) {
        scope = $rootScope;
        scope.genderMap = {};
        provide.value('$rootScope', $rootScope)
        $compile = _$compile_;
        scope.patient = {uuid: '123'};
        mockBackend = $httpBackend;
        mockBackend.expectGET('displaycontrols/patientContext/views/patientContext.html').respond("<div>dummy</div>");
    }));

    describe('initialization', function () {
        it('should fetch core patient information if there is no configuration', function () {
            var patientContext = specUtil.createFakePromise({});
            patientService.getPatientContext.and.returnValue(patientContext);
            mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);

            spinner.forPromise.and.callFake(function (param) {
                return {
                    then: function (callback) {
                        return callback({data: patientContext});
                    }
                }
            });

            var simpleHtml = '<patient-context patient="patient"></patient-context>';
            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations?concept=undefined&patientUuid=123&scope=latest').respond(observation);
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(patientService.getPatientContext).toHaveBeenCalledWith(scope.patient.uuid, 'programUuid', undefined, undefined, undefined);
            expect(spinner.forPromise).toHaveBeenCalled();
            expect(compiledElementScope.patientContext).toBe(patientContext.data);
        });

        it('should fetch person attributes if configured.', function () {
            patientService.getPatientContext.and.returnValue(specUtil.createFakePromise({}));
            var patientContextConfig = {
                personAttributes: ['caste']
            };
            mockAppDescriptor.getConfigValue.and.returnValue(patientContextConfig);
            mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);

            spinner.forPromise.and.callFake(function (param) {
                return {
                    then: function (callback) {
                        return callback({data: {}});
                    }
                }
            });

            var simpleHtml = '<patient-context patient="patient"></patient-context>';
            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations?concept=%7B%22personAttributes%22:%5B%22caste%22%5D%7D&patientUuid=123&scope=latest').respond(observation);
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(patientService.getPatientContext).toHaveBeenCalledWith(scope.patient.uuid, 'programUuid', patientContextConfig.personAttributes, undefined, undefined);
            expect(spinner.forPromise).toHaveBeenCalled();
            expect(mockAppService.getAppDescriptor).toHaveBeenCalled();
            expect(mockAppDescriptor.getConfigValue).toHaveBeenCalledWith('patientContext');
        });

        it('should fetch program attributes if configured.', function () {
            patientService.getPatientContext.and.returnValue(specUtil.createFakePromise({}));
            var patientContextConfig = {
                programAttributes: ['Aadhar Number']
            };
            mockAppDescriptor.getConfigValue.and.returnValue(patientContextConfig);
            mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);

            spinner.forPromise.and.callFake(function (param) {
                return {
                    then: function (callback) {
                        return callback({data: {}});
                    }
                }
            });

            var simpleHtml = '<patient-context patient="patient"></patient-context>';
            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations?concept=%7B%22programAttributes%22:%5B%22Aadhar+Number%22%5D%7D&patientUuid=123&scope=latest').respond(observation);
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(patientService.getPatientContext).toHaveBeenCalledWith(scope.patient.uuid, 'programUuid', patientContextConfig.personAttributes, patientContextConfig.programAttributes, undefined);
            expect(spinner.forPromise).toHaveBeenCalled();
            expect(mockAppService.getAppDescriptor).toHaveBeenCalled();
            expect(mockAppDescriptor.getConfigValue).toHaveBeenCalledWith('patientContext');
        });

        it('should fetch patient identifiers if configured.', function () {
            patientService.getPatientContext.and.returnValue(specUtil.createFakePromise({}));
            var patientContextConfig = {
                additionalPatientIdentifiers: ['National Identifier']
            };
            mockAppDescriptor.getConfigValue.and.returnValue(patientContextConfig);
            mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);

            spinner.forPromise.and.callFake(function (param) {
                return {
                    then: function (callback) {
                        return callback({data: {}});
                    }
                }
            });

            var simpleHtml = '<patient-context patient="patient"></patient-context>';
            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations?concept=%7B%22additionalPatientIdentifiers%22:%5B%22National+Identifier%22%5D%7D&patientUuid=123&scope=latest').respond(observation);
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(patientService.getPatientContext).toHaveBeenCalledWith(scope.patient.uuid, 'programUuid', patientContextConfig.personAttributes, patientContextConfig.programAttributes, patientContextConfig.additionalPatientIdentifiers);
            expect(spinner.forPromise).toHaveBeenCalled();
            expect(mockAppService.getAppDescriptor).toHaveBeenCalled();
            expect(mockAppDescriptor.getConfigValue).toHaveBeenCalledWith('patientContext');
        });

        it('should set preffered identifier to configured program attributes', function () {
            var patientContext = {
                programAttributes: {'Aadhar Number': {description: 'Aadhar Number', value: '1234'}},
                personAttributes: {}
            };
            patientService.getPatientContext.and.returnValue(specUtil.createFakePromise(patientContext));

            var patientContextConfig = {
                programAttributes: ['Aadhar Number'],
                preferredIdentifier: 'Aadhar Number'
            };
            mockAppDescriptor.getConfigValue.and.returnValue(patientContextConfig);
            mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);

            spinner.forPromise.and.callFake(function (param) {
                return {
                    then: function (callback) {
                        return callback({data: patientContext});
                    }
                }
            });

            var simpleHtml = '<patient-context patient="patient"></patient-context>';
            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations?concept=%7B%22programAttributes%22:%5B%22Aadhar+Number%22%5D,%22preferredIdentifier%22:%22Aadhar+Number%22%7D&patientUuid=123&scope=latest').respond(observation);
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.patientContext.identifier).toEqual("1234");
            expect(Object.keys(compiledElementScope.patientContext.programAttributes).length).toEqual(0);
        });

        it('should set preffered identifier to configured person attributes', function () {
            var patientContext = {
                personAttributes: {'Aadhar Number': {description: 'Aadhar Number', value: '1234'}},
                programAttributes: {}
            };
            patientService.getPatientContext.and.returnValue(specUtil.createFakePromise(patientContext));
            var patientContextConfig = {
                personAttributes: ['Aadhar Number'],
                preferredIdentifier: 'Aadhar Number'
            };
            mockAppDescriptor.getConfigValue.and.returnValue(patientContextConfig);
            mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);

            spinner.forPromise.and.callFake(function (param) {
                return {
                    then: function (callback) {
                        return callback({data: patientContext});
                    }
                }
            });

            var simpleHtml = '<patient-context patient="patient"></patient-context>';
            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations?concept=%7B%22personAttributes%22:%5B%22Aadhar+Number%22%5D,%22preferredIdentifier%22:%22Aadhar+Number%22%7D&patientUuid=123&scope=latest').respond(observation);
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.patientContext.identifier).toEqual("1234");
            expect(Object.keys(compiledElementScope.patientContext.personAttributes).length).toEqual(0);
        });

        it('should set preffered identifier to patient identifier if the configure attribute does not exists', function () {
            var patientContext = {
                programAttributes: {'Aadhar Number': {description: 'Aadhar Number', value: '1234'}},
                identifier: 'GAN20000',
                personAttributes: []
            };
            patientService.getPatientContext.and.returnValue(specUtil.createFakePromise(patientContext));
            var patientContextConfig = {
                programAttributes: ['Aadhar Number'],
                preferredIdentifier: 'Aadhar Card Number'
            };
            mockAppDescriptor.getConfigValue.and.returnValue(patientContextConfig);
            mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);

            spinner.forPromise.and.callFake(function (param) {
                return {
                    then: function (callback) {
                        return callback({data: patientContext});
                    }
                }
            });

            var simpleHtml = '<patient-context patient="patient"></patient-context>';
            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations?concept=%7B%22programAttributes%22:%5B%22Aadhar+Number%22%5D,%22preferredIdentifier%22:%22Aadhar+Card+Number%22%7D&patientUuid=123&scope=latest').respond(observation);
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.patientContext.identifier).toEqual("GAN20000");
            expect(Object.keys(compiledElementScope.patientContext.programAttributes).length).toEqual(1);
        });

        it('program attribute should take precendence while setting preferred identifier', function () {
            var patientContext = {
                personAttributes: {'Aadhar Number': {description: 'Aadhar Number', value: '1234'}},
                programAttributes: {'Aadhar Number': {description: 'Aadhar Number', value: '2345'}}
            };
            mocktranslate.instant.and.callFake(function (value) {
                return value;
            });
            patientService.getPatientContext.and.returnValue(specUtil.createFakePromise(patientContext));
            var patientContextConfig = {
                personAttributes: ['Aadhar Number'],
                programAttributes: ['Aadhar Number'],
                preferredIdentifier: 'Aadhar Number'
            };
            mockAppDescriptor.getConfigValue.and.returnValue(patientContextConfig);
            mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);

            spinner.forPromise.and.callFake(function (param) {
                return {
                    then: function (callback) {
                        return callback({data: patientContext});
                    }
                }
            });

            var simpleHtml = '<patient-context patient="patient"></patient-context>';
            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations?concept=%7B%22personAttributes%22:%5B%22Aadhar+Number%22%5D,%22programAttributes%22:%5B%22Aadhar+Number%22%5D,%22preferredIdentifier%22:%22Aadhar+Number%22%7D&patientUuid=123&scope=latest').respond(observation);
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(compiledElementScope.patientContext.identifier).toEqual("2345");
            expect(Object.keys(compiledElementScope.patientContext.personAttributes).length).toEqual(1);
            expect(Object.keys(compiledElementScope.patientContext.programAttributes).length).toEqual(0);
        });

        it("should convert boolean values to 'yes' or 'no'", function() {
            var patientContext = {
                personAttributes: {'isUrban': {description: 'Urban', value: 'true'}, 'cool': {description: 'Cool', value: 'false'}},
                programAttributes: {'isUrban': {description: 'Urban', value: 'true'}, 'cool': {description: 'Cool', value: 'false'}}
            };
            patientService.getPatientContext.and.returnValue(specUtil.createFakePromise(patientContext));
            var patientContextConfig = {
                personAttributes: ['isUrban', 'cool']
            };
            mocktranslate.instant.and.callFake(function (value) {
                return value;
            });
            mockAppDescriptor.getConfigValue.and.returnValue(patientContextConfig);
            mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);

            spinner.forPromise.and.callFake(function (param) {
                return {
                    then: function (callback) {
                        return callback({data: patientContext});
                    }
                }
            });

            var simpleHtml = '<patient-context patient="patient"></patient-context>';
            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations?concept=%7B%22personAttributes%22:%5B%22isUrban%22,%22cool%22%5D%7D&patientUuid=123&scope=latest').respond(observation);
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(Object.keys(compiledElementScope.patientContext.personAttributes).length).toEqual(2);
            expect(compiledElementScope.patientContext.personAttributes.isUrban.value).toEqual("Yes");
            expect(compiledElementScope.patientContext.personAttributes.cool.value).toEqual("No");
            expect(compiledElementScope.patientContext.programAttributes.isUrban.value).toEqual("Yes");
            expect(compiledElementScope.patientContext.programAttributes.cool.value).toEqual("No");
        });

        it("should set showNameOnPrint to true by default", function(){
            var patientContext = {

            };
            patientService.getPatientContext.and.returnValue(specUtil.createFakePromise(patientContext));
            var patientContextConfig = {

            };
            var clinicalDashBoardConfig = {
                currentTab: {

                }
            };
            scope.showNameAndImage = undefined;
            mockAppDescriptor.getConfigValue.and.returnValue(patientContextConfig);
            mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);

            spinner.forPromise.and.callFake(function (param) {
                return {
                    then: function (callback) {
                        return callback({data: patientContext});
                    }
                }
            });

            var simpleHtml = '<patient-context patient="patient" show-name-and-image="clinicalDashBoardConfig.currentTab.printing.showNameAndImage"></patient-context>';
            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations?concept=%7B%7D&patientUuid=123&scope=latest').respond(observation);
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope.showNameAndImage).toBeTruthy();

        });

        it("should set showNameOnPrint from config", function(){
            var patientContext = {

            };
            patientService.getPatientContext.and.returnValue(specUtil.createFakePromise(patientContext));
            var patientContextConfig = {

            };
             scope.clinicalDashBoardConfig = {
                currentTab: {
                    "printing": {
                        "title": "Patient Dashboard",
                        "header": "Patient Summary",
                        "logo": "../images/bahmniLogo.png",
                        "showNameAndImage": false
                    }
                }
            };
            mockAppDescriptor.getConfigValue.and.returnValue(patientContextConfig);
            mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);

            spinner.forPromise.and.callFake(function (param) {
                return {
                    then: function (callback) {
                        return callback({data: patientContext});
                    }
                }
            });

            var simpleHtml = '<patient-context patient="patient" show-name-and-image="clinicalDashBoardConfig.currentTab.printing.showNameAndImage"></patient-context>';
            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations?concept=%7B%7D&patientUuid=123&scope=latest').respond(observation);
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope.showNameAndImage).toBeFalsy();

        });


        it('should fetch person latest obs if configured.', function () {
            var patientContext = {
            
                           };
                           patientService.getPatientContext.and.returnValue(specUtil.createFakePromise(patientContext));
            observationsService.fetch.and.returnValue(specUtil.createFakePromise({}));
            var patientContextConfig = {
            };
            mockAppDescriptor.getConfigValue.and.returnValue(patientContextConfig);
            mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);

            spinner.forPromise.and.callFake(function (param) {
                return {
                    then: function (callback) {
                        return callback({data: {}});
                    }
                }
            });

            var simpleHtml = '<patient-context patient="patient"></patient-context>';
            var element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations?concept=%7B%7D&patientUuid=123&scope=latest').respond(observation);
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();

            expect(compiledElementScope).not.toBeUndefined();
            expect(spinner.forPromise).toHaveBeenCalled();
            expect(mockAppService.getAppDescriptor).toHaveBeenCalled();
            expect(mockAppDescriptor.getConfigValue).toHaveBeenCalledWith('patientContext');
        });
    })
});