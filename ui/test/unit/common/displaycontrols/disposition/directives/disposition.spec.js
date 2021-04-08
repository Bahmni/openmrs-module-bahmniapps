'use strict';

describe('Disposition DisplayControl', function () {
    var q,
        dispositions,
        compile,
        mockBackend,
        rootScope,
        deferred,
        timeout,
        dispositionService,
        $translate,
        simpleHtml = '<disposition id="disposition" params="section" patient-uuid="patientUuid" visit-uuid="visitUuid"></disposition>';

    dispositions = [
        {
            "code": "ABSCONDING",
            "voided": false,
            "voidReason": null,
            "conceptName": "Absconding",
            "dispositionDateTime": "2014-12-16T16:06:49.000+0530",
            "additionalObs": [
                {
                    "voided": false,
                    "concept": {
                        "uuid": "5723b2f2-9bc6-11e3-927e-8840ab96f0f1",
                        "conceptClass": null,
                        "shortName": null,
                        "units": null,
                        "dataType": null,
                        "name": "Disposition Note",
                        "set": false
                    },
                    "uuid": "666e89b0-05f2-4037-955e-186d412f9da5",
                    "voidReason": null,
                    "groupMembers": [],
                    "observationDateTime": null,
                    "orderUuid": null,
                    "value": "notes",
                    "comment": null
                }
            ],
            "existingObs": "a26a8c32-6fc1-4f5e-8a96-f5f5b05b87de",
            "providers": [
                {
                    "uuid": "d390d057-ec33-45c1-8342-9e23d706aa4d",
                    "name": "Surajkumar Surajkumar Surajkumar"
                }
            ]
        }
    ];

    beforeEach(module('bahmni.common.uiHelper'), function(){});
    beforeEach(module('bahmni.common.domain'), function(){});

    beforeEach(module('bahmni.common.displaycontrol.disposition'), function($provide){
        var _spinner = jasmine.createSpyObj('spinner',['forPromise','then']);
        _spinner.forPromise.and.callFake(function(){
            deferred = q.defer();
            deferred.resolve({data: dispositions});
            return deferred.promise;
        });
        _spinner.then.and.callThrough({data: dispositions});
        dispositionService = jasmine.createSpyObj('dispositionService', ['getDispositionByPatient']);
        $translate = jasmine.createSpyObj('$translate', ['instant']);
        $translate.instant.and.callFake(function (value) {
            return value;
        });
         $provide.value('spinner', _spinner);
         $provide.value('dispositionService', dispositionService);
         $provide.value('$translate', $translate);
    });

    beforeEach(inject(function ($compile, $httpBackend, $rootScope,$q, $timeout) {
        compile = $compile;
        mockBackend = $httpBackend;
        rootScope = $rootScope;
        q = $q;
        timeout = $timeout;

        rootScope.currentUser = {
                    userProperties: function () {
                        return {defaultLocale: 'en'};
                    }
                }
    }));

    it('should call dispositons by visit when visitUuid is passed', function () {
        var scope = rootScope.$new();
        scope.section = {
            numberOfVisits:1
        };
        scope.visitUuid= "1234";

        mockBackend.expectGET('../common/displaycontrols/disposition/views/disposition.html').respond("<div>dummy</div>");
        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/disposition/visitWithLocale?visitUuid=1234').respond(dispositions);

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();
        timeout.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.dispositions).not.toBeUndefined();
        expect(compiledElementScope.dispositions).toEqual(dispositions);
    });

    it('should return notes when getNotes method is called', function(){
        var scope = rootScope.$new();
         rootScope.currentUser = {
                    userProperties: function () {
                        return {defaultLocale: 'en'};
                    }
         }
        scope.section = {
            numberOfVisits:1
        };
        scope.visitUuid= "1234";

        mockBackend.expectGET('../common/displaycontrols/disposition/views/disposition.html').respond("<div>dummy</div>");
        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/disposition/visitWithLocale?visitUuid=1234').respond(dispositions);

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();
        timeout.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.getNotes(dispositions[0])).toEqual("notes");
        expect(compiledElementScope.getNotes({additionalObs:[{}]})).toEqual("");
        expect(compiledElementScope.getNotes({additionalObs:[{value:"abc"}]})).toEqual("abc");


    });

    it('should call dispositions by patient when visitUuid is NOT passed', function () {
        var scope = rootScope.$new();
        scope.section = {
            numberOfVisits: 4
        };
        scope.patientUuid="123456";

        mockBackend.expectGET('../common/displaycontrols/disposition/views/disposition.html').respond("<div>dummy</div>");
       mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/disposition/patientWithLocale?numberOfVisits=4&patientUuid=123456').respond(dispositions);

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();
        timeout.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.dispositions).not.toBeUndefined();
        expect(compiledElementScope.dispositions).toEqual(dispositions);

    });

    it('should hide details button when the notes is available', function () {
        var scope = rootScope.$new();
        scope.section = {
            numberOfVisits: 4,
            showDetailsButton: true
        };
        scope.patientUuid="123456";

        mockBackend.expectGET('../common/displaycontrols/disposition/views/disposition.html').respond("<div>dummy</div>");
        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/disposition/patientWithLocale?numberOfVisits=4&patientUuid=123456').respond(dispositions);

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.showDetailsButton(dispositions[0])).toBeFalsy();
        expect(compiledElementScope.showDetailsButton({additionalObs:[{}]})).toBeTruthy();//Should return the value of showDetailsButton when the notes is not available
    });

    it('should hide details button when the showDetailsButton is false', function () {
        var scope = rootScope.$new();

        scope.section = {
            numberOfVisits: 4,
            showDetailsButton: false
        };
        scope.patientUuid="123456";

        mockBackend.expectGET('../common/displaycontrols/disposition/views/disposition.html').respond("<div>dummy</div>");
        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/disposition/patientWithLocale?numberOfVisits=4&patientUuid=123456').respond(dispositions);

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.showDetailsButton(dispositions[0])).toBeFalsy();
        expect(compiledElementScope.showDetailsButton({additionalObs:[{}]})).toBeFalsy();//Should return the value of showDetailsButton when the notes is not available
    });

    it('should return noDispositions message when dispositions are not available', function () {
        var scope = rootScope.$new();

        scope.section = {
            numberOfVisits: 4
        };
        scope.patientUuid="123456";

        mockBackend.expectGET('../common/displaycontrols/disposition/views/disposition.html').respond("<div>dummy</div>");
        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/disposition/patientWithLocale?numberOfVisits=4&patientUuid=123456').respond([]);

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();
        timeout.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        expect(compiledElementScope.dispositions).not.toBeUndefined();
        expect(compiledElementScope.noDispositionsMessage).toEqual(Bahmni.Common.Constants.messageForNoDisposition);

    });
});