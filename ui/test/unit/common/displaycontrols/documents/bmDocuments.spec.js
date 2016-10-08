'use strict';

describe("Radiology Display Control", function () {
    var scope, element, $compile, encounterService, spinner, configurations, params, translateFilter;
    beforeEach(module('bahmni.common.displaycontrol.documents'));
    beforeEach(module('bahmni.common.i18n'));
    beforeEach(module('ngHtml2JsPreprocessor'));

    beforeEach(module(function ($provide) {
        var encounterConfig = {
            getEncounterTypeUuid: function (type) {
            }
        };
        configurations = {
            encounterConfig: function(){
                return encounterConfig;
            }
        };
        params = {"RADIOLOGY": "radiology-uuid", "radiology-uuid": specUtil.respondWith([])};
        spyOn(encounterConfig, 'getEncounterTypeUuid').and.callFake(function(myParam) {
            return params[myParam]
        });
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        encounterService = jasmine.createSpyObj('encounterService',['getEncountersForEncounterType']);
        translateFilter = jasmine.createSpy('translateFilter');

        $provide.value('configurations', configurations);
        $provide.value('spinner', spinner);
        $provide.value('encounterService', encounterService);
        $provide.value('translateFilter',translateFilter);
    }));

    beforeEach(inject(function (_$compile_, $rootScope) {
        scope = $rootScope;
        $compile = _$compile_;
        scope.patient = {
            "name": "Patient name",
            "genderText": "Female",
            "identifier": "Some identifier",
            "ageText": "21 years"
        };
    }));

    var compileAndDigest = function(){
        element = angular.element('<bm-documents patient="patient" config="config" encounter-type="\'RADIOLOGY\'"></bm-documents>');
        $compile(element)(scope);
        scope.$digest();
    };

    it("should show active visit star if visit stop date is not present", function () {
        var records_group1 = [{
            visitStopDate: null
        }, {
            visitStopDate: "2014-10-02T16:10:11.000+0530"
        }];

        var records_group2 = [{
            visitStopDate: "2014-11-02T16:10:11.000+0530"
        }, {
            visitStopDate: "2014-10-02T16:10:11.000+0530"
        }];

        var radiologyRecords = [records_group1, records_group2];

        scope.config = {translationKey: "translationKey"};
        encounterService.getEncountersForEncounterType.and.callFake(function(param1, param2){
            return params[param2];
        });
        compileAndDigest();

        var isoScope = element.isolateScope();

        expect(isoScope.shouldShowActiveVisitStar(radiologyRecords[0])).toBe(true);
        expect(isoScope.shouldShowActiveVisitStar(radiologyRecords[1])).toBe(false);
    });

    it("should not show active visit star if it is on the visit page", function(){
        scope.config = {
            visitUuids: ["uuid1"],
            translationKey: "translationKey"
        };
        encounterService.getEncountersForEncounterType.and.callFake(function(param1, param2){
            return params[param2];
        });
        compileAndDigest();

        var isoScope = element.isolateScope();
        expect(isoScope.shouldShowActiveVisitStar()).toBe(false);
    })
});