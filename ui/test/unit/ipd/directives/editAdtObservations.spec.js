'use strict';

describe('editAdtObservations', function () {
    var scope, rootScope, httpBackend, compile, q, compiledScope;
    var spinner, encounterService, observationsService, sessionService, conceptSetService, conceptSetUiConfigService, messagingService;
    var window = {location: {href: "some url"}};
    var state = {};
    var html = '<edit-adt-observations patient="patient" concept-set-name="conceptSetName" edit-mode="$parent.editMode" visit-type-uuid="visitTypeUuid"></edit-adt-observations>';

    var conceptSet = {
        "uuid": "72baa954-4f6f-46a4-9289-144b4f973864",
        "set": true,
        "name": {
            "uuid": "f0e9a2e3-a6fb-4754-ac4a-dc6910c5142b",
            "name": "Expected Date of Discharge Set"
        },
        "datatype": {
            "uuid": "8d4a4c94-c2cc-11de-8d13-0010c6dffd0f",
            "name": "N/A"
        },
        "conceptClass": {
            "uuid": "8d492774-c2cc-11de-8d13-0010c6dffd0f",
            "name": "Misc"
        },
        "setMembers": [
            {
                "uuid": "9c653330-9825-4f1d-939a-96757bc7cb97",
                "name": {
                    "uuid": "30a9a7e1-01ba-4aab-b03b-620527b0fb26",
                    "name": "Expected Date of Discharge"
                },
                "datatype": {
                    "uuid": "8d4a505e-c2cc-11de-8d13-0010c6dffd0f",
                    "name": "Date"
                },
                "conceptClass": {
                    "uuid": "8d492774-c2cc-11de-8d13-0010c6dffd0f",
                    "name": "Misc"
                }
            }
        ]
    };

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

    var observation2 = {
        "groupMembers": [
            {
                "encounterUuid": "efe78fd3-3ae5-41a5-9a0b-9181a3cd1b82",
                "uuid": "c5843ec9-85b9-487b-a78a-0f2a844feb22",
                "concept": {
                    "uuid": "9c653330-9825-4f1d-939a-96757bc7cb97",
                    "name": "Expected Date of Discharge",
                    "dataType": "Date",
                    "conceptClass": "Misc"
                },
                "voided": false,
                "conceptUuid": "9c653330-9825-4f1d-939a-96757bc7cb97",
                "value": "2020-01-23"
            }
        ],
        "encounterUuid": "efe78fd3-3ae5-41a5-9a0b-9181a3cd1b82",
        "uuid": "c0415c40-8833-445f-945a-c51bb7bccd22",
        "concept": {
            "uuid": "72baa954-4f6f-46a4-9289-144b4f973864",
            "name": "Expected Date of Discharge Set",
            "dataType": "N/A",
            "conceptClass": "Misc"
        },
        "voided": false,
        "conceptUuid": "72baa954-4f6f-46a4-9289-144b4f973864",
        "observationDateTime": "2017-02-23T13:48:52.000+0200",
        "value": "2020-01-23",
        "comment": null
    };

    spinner = jasmine.createSpyObj('spinner',['forPromise']);
    encounterService = jasmine.createSpyObj('encounterService',['create']);
    observationsService = jasmine.createSpyObj('observationsService',['fetch']);
    sessionService = jasmine.createSpyObj('sessionService',['getLoginLocationUuid']);
    conceptSetService = jasmine.createSpyObj('conceptSetService',['getConcept']);
    conceptSetUiConfigService = jasmine.createSpyObj('conceptSetUiConfigService',['getConfig']);
    messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);

    spinner.forPromise.and.returnValue(specUtil.createFakePromise({}));
    encounterService.create.and.returnValue(specUtil.createServicePromise("create"));
    sessionService.getLoginLocationUuid.and.returnValue("someLocationUuid");
    conceptSetService.getConcept.and.returnValue(specUtil.simplePromise({"data": {"results": [conceptSet]}}));
    conceptSetUiConfigService.getConfig.and.returnValue("configInfo");

    beforeEach(function () {
        module('bahmni.ipd');
    });

    beforeEach(module(function ($provide) {
        $provide.value('spinner', spinner);
        $provide.value('$state', state);
        $provide.value('encounterService', encounterService);
        $provide.value('observationsService', observationsService);
        $provide.value('sessionService', sessionService);
        $provide.value('conceptSetService', conceptSetService);
        $provide.value('conceptSetUiConfigService', conceptSetUiConfigService);
        $provide.value('messagingService', messagingService);
    }));

    var injectFn = function () {
        inject(function ($compile, $httpBackend, $rootScope) {
            compile = $compile;
            httpBackend = $httpBackend;
            rootScope = $rootScope;
            scope = rootScope.$new();
            httpBackend.expectGET("views/editAdtObservations.html").respond("<div>dummy</div>");
            var compiledEle = $compile(html)(scope);
            rootScope.encounterConfig = {
                getConsultationEncounterTypeUuid: function () {
                    return "consultationEncounterTypeUuid";
                }
            };
            rootScope.bedDetails = {};
            rootScope.patient = {};
            scope.promiseResolved = false;
            scope.patient = {uuid: "patientUuid"};
            scope.conceptSetName = "Expected Date of Discharge Set";
            scope.visitTypeUuid = "visitTypeUuid";
            scope.observations = [];
            scope.editMode = false;
            scope.$digest();
            httpBackend.flush();
            scope = compiledEle.isolateScope();
            scope.$digest();

        });
    };

    it('Should get the concept with conceptSetName and create a obs mapper with the concept and if there no saved observation for the same concept', function () {
        observationsService.fetch.and.returnValue(specUtil.simplePromise({"data": []}));
        injectFn();

        expect(conceptSetService.getConcept).toHaveBeenCalled();
        expect(observationsService.fetch).toHaveBeenCalled();
        expect(scope.promiseResolved).toBe(true);
        expect(scope.editMode).toBeFalsy();
        expect(scope.observations[0]).toBeDefined();
        expect(scope.observations[0].concept.name).toBe("Expected Date of Discharge Set");
        expect(scope.observations[0].groupMembers).toBeDefined();
        expect(scope.observations[0].groupMembers.length).toBe(1);
        expect(scope.observations[0].groupMembers[0].concept.name).toBe("Expected Date of Discharge");
        expect(scope.observations[0].groupMembers[0].value).toBeUndefined();
        expect(scope.observations[0].groupMembers[0].disabled).toBeTruthy();
    });

    it('Should get the concept with conceptSetName and create a obs mapper with the concept and if there is saved observation for the same concept exist copy values to mapped observation', function () {
        observationsService.fetch.and.returnValue(specUtil.simplePromise({"data": [observation]}));
        injectFn();

        expect(conceptSetService.getConcept).toHaveBeenCalled();
        expect(observationsService.fetch).toHaveBeenCalled();
        expect(scope.promiseResolved).toBe(true);
        expect(scope.editMode).toBeFalsy();
        expect(scope.observations[0]).toBeDefined();
        expect(scope.observations[0].concept.name).toBe("Expected Date of Discharge Set");
        expect(scope.observations[0].groupMembers).toBeDefined();
        expect(scope.observations[0].groupMembers.length).toBe(1);
        expect(scope.observations[0].groupMembers[0].concept.name).toBe("Expected Date of Discharge");
        expect(scope.observations[0].groupMembers[0].value).toBe("2017-01-03");
        expect(scope.observations[0].groupMembers[0].disabled).toBeTruthy();
    });

    it('Should enable obs on edit and reset the changes made observation on cancel, i.e reset back to last saved obs and disable them', function () {
        observationsService.fetch.and.returnValue(specUtil.simplePromise({"data": [observation]}));
        injectFn();

        expect(scope.editMode).toBeFalsy();
        expect(scope.observations[0].groupMembers[0].value).toEqual("2017-01-03");
        expect(conceptSetService.getConcept).toHaveBeenCalled();
        expect(observationsService.fetch).toHaveBeenCalled();

        scope.edit();
        expect(scope.editMode).toBeTruthy();
        scope.observations[0].groupMembers[0].value = "2020-01-13";

        scope.cancel();
        expect(scope.editMode).toBeFalsy();
        expect(scope.observations[0].groupMembers[0].value).toEqual("2017-01-03");
    });

    it('Should enable obs on edit and save the observations with the changes made', function () {
        observationsService.fetch.and.returnValue(specUtil.simplePromise({"data": [observation]}));
        injectFn();

        expect(scope.editMode).toBeFalsy();
        expect(scope.visitTypeUuid).toBe("visitTypeUuid");
        expect(scope.observations[0].groupMembers[0].value).toEqual("2017-01-03");
        expect(conceptSetService.getConcept).toHaveBeenCalled();
        expect(observationsService.fetch).toHaveBeenCalled();

        scope.edit();
        expect(scope.editMode).toBeTruthy();
        scope.observations[0].groupMembers[0].value = "2020-01-13";

        scope.save();
        expect(scope.editMode).toBeFalsy();
        expect(scope.observations[0].groupMembers[0].value).toEqual("2020-01-13");
        expect(encounterService.create).toHaveBeenCalled();
    });

    it('Should reset observation values, if fetch the observations returns empty array for patient', function () {
        observationsService.fetch.and.returnValue(specUtil.simplePromise({"data": []}));
        injectFn();

        expect(scope.editMode).toBeFalsy();
        expect(conceptSetService.getConcept).toHaveBeenCalled();
        expect(observationsService.fetch).toHaveBeenCalled();

        scope.patient = {uuid: "newPatientUuid"};
        scope.$digest();

        expect(observationsService.fetch).toHaveBeenCalled();
        //scope.observations[0].groupMembers[0].value = "2020-01-13";

        expect(scope.editMode).toBeFalsy();
        expect(scope.observations[0].groupMembers[0].value).toBeUndefined();
    });

    it('Should set onBedManagement to true when current state is bedmanagement', function () {
        state = {current : {name : "bedManagement.bed"}};
        injectFn();

        expect(scope.onBedManagement).toBeTruthy();
    });

    it('Should set onBedManagement to false when current state is not bedmanagement', function () {
        state = {current : {name : ""}};
        injectFn();

        expect(scope.onBedManagement).toBeFalsy();
    });

    it('Should throw a message when trying to save empty fields', function () {
        observationsService.fetch.and.returnValue(specUtil.simplePromise({"data": []}));
        injectFn();
        scope.observations = [{concept : {name : "IPD Expected DD"}, groupMembers : [{value : ""} ,{value : ""}]}];
        scope.savedObservations = [{concept : {name : "IPD Expected DD"}, groupMembers : [{value : ""} ,{value : ""}]}];
        scope.$digest();
        scope.save();
        expect(messagingService.showMessage).toHaveBeenCalled();
    });
});