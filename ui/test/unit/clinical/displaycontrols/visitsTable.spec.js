'use strict';

describe("Visits Table display control", function () {
    var element, scope, $compile, mockBackend, conceptSetService, visitFormService,patientVisitHistoryService;

    beforeEach(module('ngHtml2JsPreprocessor'));
    beforeEach(module('bahmni.clinical'));
    beforeEach(module(function($provide) {
        conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConceptSetMembers']);
        visitFormService = jasmine.createSpyObj('visitFormService', ['formData']);
        patientVisitHistoryService= jasmine.createSpyObj('patientVisitHistoryService', ['getVisitHistory']);
        $provide.value('$state', {});
        $provide.value('$bahmniCookieStore', {});
        $provide.value('clinicalAppConfigService', {getObsIgnoreList: function(){return []}});
        $provide.value('$bahmniTranslate', {use: function() {return "en"}});
        $provide.value('conceptSetService', conceptSetService);
        $provide.value('visitFormService', visitFormService);
        $provide.value('patientVisitHistoryService', patientVisitHistoryService);
    }));

    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend) {
        scope = $rootScope.$new();
        $compile = _$compile_;
        scope.patientUuid = '123';
        scope.params = {};
        scope.showObservationData = true;
        mockBackend = $httpBackend;
        mockBackend.expectGET("displaycontrols/allvisits/views/visitsTable.html").respond("<div></div>");
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

    var mockPatientVisitHistoryService = function (data) {
        patientVisitHistoryService.getVisitHistory.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback(data)
                }
            }
        });
    };

    var beforeEachExecute = function(){
        mockConceptSetService(allObsTemplateData);
        mockVisitFormService(formDataObj);
        mockPatientVisitHistoryService({});

        var simpleHtml = '<visits-table params="params" patient-uuid="patientUuid" show-observation-data="showAllObservationsData"></visits-table>';
        var element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();

        return compiledElementScope;
    };


    it("should show visit tables", function () {
        element = angular.element('<visits-table></visits-table>');
        $compile(element)(scope);
        scope.$digest();

        expect(element.scope().patientUuid).toBe("123");
    });


    it("should fetch short name if available with concept", function () {

        var data ={
            concept: {
                names: [
                    {name: "vitalsShort",conceptNameType :'SHORT'},
                    {name: "vitalsFull", conceptNameType : 'FULLY_SPECIFIED'}
                ],
                displayString: "vitals"
            }
        };

        var compiledElementScope = beforeEachExecute();

        expect(compiledElementScope.getDisplayName(data)).toBe("vitalsShort");

    });

    it("should not display any errors when concept has no names", function(){
        var data ={
            concept: {
                displayString: "vitals"
            }
        };

        var compiledElementScope = beforeEachExecute();

        expect(compiledElementScope.getDisplayName(data)).toBe("vitals");
    });


    it("should fetch locale specific fully specified name if short name is not available", function () {

        var data ={
            concept: {
                names: [
                    {name: "vitalsFull", conceptNameType : 'FULLY_SPECIFIED'}
                ],
                displayString: "vitals"
            }
        };
        var compiledElementScope = beforeEachExecute();

        expect(compiledElementScope.getDisplayName(data)).toBe("vitalsFull");

    });

    it("should fully specified name of english if locale specific short name and full name are not available", function () {

        var data ={
            concept: {
                names: [
                    {name: "", conceptNameType : 'FULLY_SPECIFIED'}
                ],
                displayString: "vitals"
            }
        };
        var compiledElementScope = beforeEachExecute();

        expect(compiledElementScope.getDisplayName(data)).toBe("vitals");

    });
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

});