'use strict';

describe("ensure that the directive edit-observation works properly", function () {
    var scope, filter, _spinner, rootScope, httpBackend, compile, q, state, ngDialog, configurations, encounterResponse,
        encounterServiceMock, contextChangeHandler, auditLogServiceMock, messageServiceMock, formService;
    var html = '<edit-observation  concept-set-name="History and Examinations" observation="observation" ></edit-observation>';
    var observation = {
        encounterUuid: "encounter uuid one"
    };
    beforeEach(module('bahmni.common.obs'));

    beforeEach(module(function ($provide) {
        _spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then']);
        _spinner = {
            forPromise: function (promise, element) {
                return promise;
            }
        };
        state = {
            params: {
                encounterUuid: "someEncounterUuid",
                programUuid: "someProgramUuid",
                patientUuid: "somePatientUuid"
            },
            go: function () {
            }
        };
        ngDialog = jasmine.createSpyObj('ngDialong', ['close']);
        contextChangeHandler = jasmine.createSpyObj('contextChangeHandler', ['execute']);
        contextChangeHandler.execute.and.returnValue({allow: true});
        messageServiceMock = jasmine.createSpyObj('messagingService', ['showMessage']);
        configurations = {
            dosageFrequencyConfig: function () {
                return {};
            },
            dosageInstructionConfig: function () {
                return {};
            },
            consultationNoteConcept: function () {
                return {};
            },
            labOrderNotesConcept: function () {
                return {};
            },
            stoppedOrderReasonConfig: function () {
                return {};
            }
        };
        encounterServiceMock = jasmine.createSpyObj('encounterService', ['findByEncounterUuid', 'create']);
        formService = jasmine.createSpyObj('formService', ['getAllForms']);
        var encounterPromise = specUtil.createServicePromise('findByEncounterUuid');
        encounterPromise.then = function (successFn) {
            successFn({data: {
              uuid: "encounter uuid one",
              orders: [{uuid: "order1"}],
              observations: [
                {
                  uuid: 'root-obs-uuid',
                  concept: {
                    name: 'Adverse Events Template',
                    uuid: 'root-concept-uuid'
                  },
                  groupMembers: [
                    {
                      uuid: 'child1-obs-uuid',
                      concept: {
                        name: 'Adverse Event Details',
                        uuid: 'child1-concept-uuid'
                      },
                      groupMembers: []
                    },
                    {
                      uuid: 'child2-obs-uuid',
                      concept: {
                        name: 'Adverse Event Details',
                        uuid: 'child2-concept-uuid'
                      },
                      groupMembers: []
                    }
                  ]
                }],
              drugOrders: [],
              extensions: {mdrtbSpecimen: null}
            }});
            return encounterPromise;
        };
        encounterResponse = {encounterUuid: "encounterUuid", encounterType: 'Consultation'};
        encounterServiceMock.findByEncounterUuid.and.returnValue(encounterPromise);
        encounterServiceMock.create.and.returnValue(specUtil.simplePromise({data: encounterResponse}));
        auditLogServiceMock = jasmine.createSpyObj('auditLogService', ['log']);
        auditLogServiceMock.log.and.returnValue(specUtil.simplePromise({}));

        $provide.value('$state', state);
        $provide.value('spinner', _spinner);
        $provide.value('contextChangeHandler', contextChangeHandler);
        $provide.value('ngDialog', ngDialog);
        $provide.value('messagingService', messageServiceMock);
        $provide.value('encounterService', encounterServiceMock);
        $provide.value('formService', formService);
        $provide.value('configurations', configurations);
        $provide.value('auditLogService', auditLogServiceMock);
    }));

    beforeEach(inject(function ($filter, $compile, $httpBackend, $rootScope, $q) {
        filter = $filter;
        compile = $compile;
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        q = $q;
    }));

    it("should filter saved orders before saving", function () {
        scope = rootScope.$new();
        scope.observation = observation;

        httpBackend.expectGET("../common/obs/views/editObservation.html").respond("<div>dummy</div>");

        var compiledEle = compile(html)(scope);

        scope.$digest();
        httpBackend.flush();

        var compiledScope = compiledEle.isolateScope();
        scope.$digest();

        expect(compiledScope).not.toBeUndefined();
        expect(compiledScope.encounter.orders.length).toBe(1);
        expect(compiledScope.editableObservations).toBe(compiledScope.encounter.observations);

        compiledScope.save();

        expect(compiledScope.encounter.orders.length).toBe(0);
    });

    it("should update only specified observation in encounter observations before saving the encounter", function () {
        scope = rootScope.$new();
        scope.observation = _.extend(observation, {uuid: 'child2-obs-uuid'});

        httpBackend.expectGET("../common/obs/views/editObservation.html").respond("<div>dummy</div>");

        var compiledEle = compile(html)(scope);

        scope.$digest();
        httpBackend.flush();

        var compiledScope = compiledEle.isolateScope();
        scope.$digest();

        expect(compiledScope.encounter.observations[0].groupMembers[0].groupMembers.length).toBe(0);
        expect(compiledScope.encounter.observations[0].groupMembers[1].groupMembers.length).toBe(0);
        expect(compiledScope.editableObservations[0].uuid).toBe("child2-obs-uuid");
        expect(compiledScope.editableObservations[0].concept.name).toBe("Adverse Event Details");
        expect(compiledScope).not.toBeUndefined();

        compiledScope.editableObservations = [{uuid: 'child2-obs-uuid',
            groupMembers: [
                {
                    uuid: 'obs1-uuid',
                    value: 'adverse'
                }
            ]
        }];

        compiledScope.save();

        expect(compiledScope.encounter.observations[0].groupMembers[0].groupMembers.length).toBe(0);
        expect(compiledScope.encounter.observations[0].groupMembers[1].groupMembers.length).toBe(1);
    });

    it("should validate form on save ", function () {
        contextChangeHandler.execute.and.returnValue({allow: false, errorMessage: "Enter mandatory fields"});
        scope = rootScope.$new();
        scope.observation = _.extend(observation, {uuid: 'child2-obs-uuid'});

        httpBackend.expectGET("../common/obs/views/editObservation.html").respond("<div>dummy</div>");

        var compiledEle = compile(html)(scope);

        scope.$digest();
        httpBackend.flush();

        var compiledScope = compiledEle.isolateScope();
        scope.$digest();

        spyOn(rootScope, '$broadcast');
        compiledScope.save();

        expect(rootScope.$broadcast).toHaveBeenCalledWith('event:errorsOnForm');
        expect(messageServiceMock.showMessage).toHaveBeenCalledWith("error", "Enter mandatory fields");
    });

    it('should log the encounter edit after save', function () {
        scope = rootScope.$new();
        scope.observation = observation;

        httpBackend.expectGET("../common/obs/views/editObservation.html").respond("<div>dummy</div>");

        var compiledEle = compile(html)(scope);

        scope.$digest();
        httpBackend.flush();

        var compiledScope = compiledEle.isolateScope();
        compiledScope.patient = {uuid: 'patientUuid'};
        scope.$digest();
        expect(compiledScope).not.toBeUndefined();
        compiledScope.save();
        var messageParams = {encounterUuid: encounterResponse.encounterUuid, encounterType: encounterResponse.encounterType};
        expect(auditLogServiceMock.log).toHaveBeenCalledWith(compiledScope.patient.uuid, "EDIT_ENCOUNTER", messageParams, "MODULE_LABEL_CLINICAL_KEY");
        expect(compiledScope.encounter.orders.length).toBe(0);
    });

    it('should return false if observation formType is not defined', function () {
        scope = rootScope.$new();
        scope.observation = observation;
        httpBackend.expectGET("../common/obs/views/editObservation.html").respond("<div>dummy</div>");
        var compiledEle = compile(html)(scope);
        var compiledScope = compiledEle.isolateScope();
        httpBackend.flush();
        scope.$digest();

        expect(compiledScope.isFormBuilderForm()).toBeFalsy();
    });

    it('should return true if observation formType is v2', function () {
        scope = rootScope.$new();
        scope.observation = observation;
        httpBackend.expectGET("../common/obs/views/editObservation.html").respond("<div>dummy</div>");
        var compiledEle = compile(html)(scope);
        var compiledScope = compiledEle.isolateScope();
        httpBackend.flush();
        scope.observation = Object.assign({}, observation, {formType: 'v2'});
        scope.$digest();

        expect(compiledScope.isFormBuilderForm()).toBeTruthy();
    });

    it('should return false if observation formType is not v2', function () {
        scope = rootScope.$new();
        scope.observation = observation;
        httpBackend.expectGET("../common/obs/views/editObservation.html").respond("<div>dummy</div>");
        var compiledEle = compile(html)(scope);
        var compiledScope = compiledEle.isolateScope();
        httpBackend.flush();
        scope.observation = Object.assign({}, observation, {formType: 'v3'});
        scope.$digest();

        expect(compiledScope.isFormBuilderForm()).toBeFalsy();
    });

    it('should set formDetails for given observation when the observation formType is v2', function () {
        var allForms = [{name: 'EditForm', version: '3', uuid: 'editFormUuid'}];
        formService.getAllForms.and.returnValue(specUtil.respondWithPromise(q, {data: allForms}));
        rootScope.currentUser = {isFavouriteObsTemplate: function(){}};
        scope = rootScope.$new();
        scope.observation = Object.assign({}, observation, {formType: 'v2', formName: 'EditForm', formVersion: '3'});
        httpBackend.expectGET("../common/obs/views/editObservation.html").respond("<div>dummy</div>");

        var compiledEle = compile(html)(scope);
        var compiledScope = compiledEle.isolateScope();
        httpBackend.flush();
        scope.$digest();

        expect(formService.getAllForms).toHaveBeenCalled();
        var formDetails = compiledScope.formDetails;
        expect(formDetails).toBeDefined();
        expect(formDetails.formName).toBe('EditForm');
        expect(formDetails.formVersion).toBe('3');
        expect(formDetails.formUuid).toBe('editFormUuid');
        expect(formDetails.observations.length).toBe(0);
    });

    it('should not set formDetails for given observation when the observation formType is not v2', function () {
        scope = rootScope.$new();
        scope.observation = Object.assign({}, observation, {formType: 'v3', formName: 'EditForm', formVersion: '3'});
        httpBackend.expectGET("../common/obs/views/editObservation.html").respond("<div>dummy</div>");

        var compiledEle = compile(html)(scope);
        var compiledScope = compiledEle.isolateScope();
        httpBackend.flush();
        scope.$digest();

        expect(formService.getAllForms).not.toHaveBeenCalled();
        expect(compiledScope.formDetails).not.toBeDefined();
    });

    it('should get called for observations from formDetails component when observation formType is v2 while saving', function () {
        var component = jasmine.createSpyObj('component', ['getValue']);
        component.getValue.and.returnValue({observations: [{encounterUuid:'9e90667f'}] });
        scope = rootScope.$new();
        scope.observation = observation;
        httpBackend.expectGET("../common/obs/views/editObservation.html").respond("<div>dummy</div>");
        var compiledEle = compile(html)(scope);
        var compiledScope = compiledEle.isolateScope();
        httpBackend.flush();
        scope.observation = Object.assign({}, observation, {formType: 'v2', formName: 'EditForm', formVersion: '3'});
        compiledScope.formDetails = {component: component};
        scope.$digest();

        expect(component.getValue).not.toHaveBeenCalled();

        compiledScope.save();

        expect(component.getValue).toHaveBeenCalled();
        expect(component.getValue.calls.count()).toBe(1);
    });

    it('should not get called for observations from formDetails component when observation formType is not v2 while' +
        ' saving', function () {
        var component = jasmine.createSpyObj('component', ['getValue']);
        component.getValue.and.returnValue({observations: [{encounterUuid:'9e90667f'}] });
        scope = rootScope.$new();
        scope.observation = observation;
        httpBackend.expectGET("../common/obs/views/editObservation.html").respond("<div>dummy</div>");
        var compiledEle = compile(html)(scope);
        var compiledScope = compiledEle.isolateScope();
        httpBackend.flush();
        scope.observation = Object.assign({}, observation, {formType: 'v3', formName: 'EditForm', formVersion: '3'});
        compiledScope.formDetails = {component: component};
        scope.$digest();

        expect(component.getValue).not.toHaveBeenCalled();

        compiledScope.save();

        expect(component.getValue).not.toHaveBeenCalled();
    });

    it('should display error message when formDetails component has error', function () {
        var component = jasmine.createSpyObj('component', ['getValue']);
        component.getValue.and.returnValue({errors: ["Please Fill Mandatory Field"], observations: [{encounterUuid:'9e9066c'}] });
        scope = rootScope.$new();
        scope.observation = observation;
        httpBackend.expectGET("../common/obs/views/editObservation.html").respond("<div>dummy</div>");
        var compiledEle = compile(html)(scope);
        var compiledScope = compiledEle.isolateScope();
        scope.observation = Object.assign({}, observation, {formType: 'v2', formName: 'EditForm', formVersion: '3'});
        compiledScope.formDetails = {component: component};
        httpBackend.flush();
        scope.$digest();
        spyOn(rootScope, '$broadcast');

        compiledScope.save();

        expect(messageServiceMock.showMessage).toHaveBeenCalledWith( 'error', "{{'CLINICAL_FORM_ERRORS_MESSAGE_KEY' | translate }}");
    });

    it('should display saveSuccess message when formDetails component has no errors', function () {
        var component = jasmine.createSpyObj('component', ['getValue']);
        component.getValue.and.returnValue({observations: [{encounterUuid:'9e90667f'}] });
        scope = rootScope.$new();
        scope.observation = observation;
        httpBackend.expectGET("../common/obs/views/editObservation.html").respond("<div>dummy</div>");
        var compiledEle = compile(html)(scope);
        var compiledScope = compiledEle.isolateScope();
        scope.observation = Object.assign({}, observation, {formType: 'v2', formName: 'EditForm', formVersion: '3'});
        compiledScope.formDetails = {component: component};
        httpBackend.flush();
        scope.$digest();
        spyOn(rootScope, '$broadcast');

        compiledScope.save();

        expect(messageServiceMock.showMessage).toHaveBeenCalledWith('info', "{{'CLINICAL_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
    });
});

