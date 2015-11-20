'use strict';

describe("ensure that the directive edit-observation works properly", function () {

    var scope, rootScope, filter, httpBackend, compile, q, encounterService, spinner, state, ngDialog;
    var html = '<edit-observation  concept-set-name="History and Examinations" observation="observation" ></edit-observation>';

    var obsDate = new Date();

    var observation = {
        "value": 1,
        encounter:{uuid: "encounter uuid one"},
        patient:{identifier: 'GAN1234', name: 'Ram Singh', uuid: 'p-uuid-1', activeVisitUuid: 'v-uuid-1'},
        "concept": {"shortName": null, "name": "Other", "set": true, "units": null, "conceptClass": "Misc", "dataType": "N/A"},
        "conceptUuid" : "otherUuid",
        "observationDateTime" : obsDate
    };

    var encounterServiceMock = jasmine.createSpyObj('encounterService', ['findByEncounterUuid']);
    var spinnerMock = jasmine.createSpyObj('spinner', ['forPromise']);
    var messageServiceMock = jasmine.createSpyObj('messagingService', ['showMessage']);
    state = {params: {encounterUuid: "someEncounterUuid", programUuid: "someProgramUuid", patientUuid: "somePatientUuid"}};
    ngDialog = null;
    var configurations = {
        dosageFrequencyConfig: function(){
            return {};
        },
        dosageInstructionConfig :function(){
            return {};
        },
        consultationNoteConcept:function(){
        return {};
          },
        labOrderNotesConcept: function(){
            return {};
        },
        stoppedOrderReasonConfig: function(){
            return {};
        }
    };
    beforeEach(module('bahmni.common.obs'));


    beforeEach(module( function ($provide) {
        var _spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then']);
        _spinner.forPromise.and.callFake(function () {
            var deferred = q.defer();
            deferred.resolve({data: {}});
            return deferred.promise;
        });

        _spinner.then.and.callThrough({data: {}});
        $provide.value('spinner', _spinner);

        var encounterServiceMock = jasmine.createSpyObj('encounterService', ['findByEncounterUuid', 'create']);
        var encounterPromise = specUtil.createServicePromise('findByEncounterUuid');
        encounterPromise.then = function (successFn) {
            successFn({data:{
                uuid: "encounter uuid one",
                orders:[{uuid:"order1"}],
                observations:[],
                drugOrders:[],
                extensions:{mdrtbSpecimen: null}
            }});
            return encounterPromise;

        };
       encounterServiceMock.findByEncounterUuid.and.returnValue(encounterPromise);

        $provide.value('$state', state);
        $provide.value('ngDialog', ngDialog);
        $provide.value('messagingService', messageServiceMock);
        $provide.value('encounterService', encounterServiceMock);
        $provide.value('configurations', configurations);
    }));


    beforeEach(inject(function($filter, $compile, $httpBackend, $rootScope, $q){
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

        compiledScope.save();

        expect(compiledScope.encounter.orders.length).toBe(0);
    });


});

