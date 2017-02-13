'use strict';

describe("conditionsService", function () {
    var _$http;
    var _provide;
    var conditionsService;

    beforeEach(function () {
        module('bahmni.common.domain');
        module(function ($provide) {
            _$http = jasmine.createSpyObj('$http', ['post','get']);
            _provide = $provide;
            _provide.value('$http', _$http);
        });
        inject(function (_conditionsService_) {
            conditionsService = _conditionsService_;
        });
    });

    describe("save", function () {
        it("should map before saving", function (done) {
            var conditions = [{
                unwantedProperty:'unwantedProperty'
            }];

            _$http.post.and.returnValue(specUtil.respondWithPromise(Q, {data: []}));

            conditionsService.save(conditions, 'patientUuid').then(function () {
                expect(_$http.post.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.conditionUrl);
                expect(_$http.post.calls.mostRecent().args[1].length).toBe(1);
                expect(_$http.post.calls.mostRecent().args[1][0].unwantedProperty).toBeUndefined();
            }).catch(notifyError).finally(done);
        });
    });

    describe("getConditionHistory",function () {
        it("should fetch from condition History Url",function (done) {
            _$http.get.and.returnValue(specUtil.respondWithPromise(Q, {data: []}));

            conditionsService.getConditionHistory('patientUuid').then(function () {
                expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.conditionHistoryUrl);
                expect(_$http.get.calls.mostRecent().args[1].params.patientUuid).toBe('patientUuid');
            }).catch(notifyError).finally(done);
        });
    });

    describe("getFollowUpConditionConcept",function () {
        it("should fetch from conceptSearchByFullNameUrl",function (done) {
            _$http.get.and.returnValue(specUtil.respondWithPromise(Q, {data: []}));

            conditionsService.getFollowUpConditionConcept().then(function () {
                expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.conceptSearchByFullNameUrl);
                expect(_$http.get.calls.mostRecent().args[1].params.name).toBe(Bahmni.Common.Constants.followUpConditionConcept);
                expect(_$http.get.calls.mostRecent().args[1].params.v).toBe("custom:(uuid,name:(name))");
            }).catch(notifyError).finally(done);
        });
    });
});