'use strict';

describe("bedService",function () {

    var _$http;
    var _$rootScope;
    var _provide;
    var bedService;

    beforeEach(function(){
        module('bahmni.common.domain');
        module(function($provide){
            _$http = jasmine.createSpyObj('$http', ['get']);
            _provide = $provide;
        });
        inject(function(_$rootScope_){
            _$rootScope = _$rootScope_;
            _provide.value('$http',_$http);
            _provide.value('$rootScope',_$rootScope);
        });
        inject(function(_bedService_){
            bedService = _bedService_;
        });
    });

    it("getAssignedBedForPatient should hit bedDetailsFromVisit search handler",function (done) {

        var data = {
            results:[{
                physicalLocation:{
                    name:'Physical Location Name',
                    parentLocation:{
                        display:'Labour Ward',
                        uuid:'Labour Ward uuid'
                    }
                },
                bedNumber:'314-a',
                bedId:'900'
            }]
        };
        _$http.get.and.returnValue(specUtil.respondWithPromise(Q, {data:data}));
        bedService.getAssignedBedForPatient('patientUuid','visitUuid').then(function(bedDetails){
            expect(bedDetails).toEqual({
                wardName:'Labour Ward',
                bedId:'900',
                bedNumber:'314-a',
                wardUuid:'Labour Ward uuid',
                physicalLocationName:'Physical Location Name'
            });
            expect(_$http.get).toHaveBeenCalledWith(Bahmni.Common.Constants.bedFromVisit,jasmine.objectContaining({
                params:{
                    patientUuid: 'patientUuid',
                    v: "full",
                    visitUuid: 'visitUuid',
                    s:'bedDetailsFromVisit'
                }
            }));
        }).catch(notifyError).finally(done);
    });
    it("getAssignedBedForPatient should hit regular resource handler",function (done) {

        var data = {
            results:[{
                physicalLocation:{
                    name:'Physical Location Name',
                    parentLocation:{
                        display:'Labour Ward',
                        uuid:'Labour Ward uuid'
                    }
                },
                bedNumber:'314-a',
                bedId:'900'
            }]
        };
        _$http.get.and.returnValue(specUtil.respondWithPromise(Q, {data:data}));
        bedService.getAssignedBedForPatient('patientUuid').then(function(bedDetails){
            expect(bedDetails).toEqual({
                wardName:'Labour Ward',
                bedId:'900',
                bedNumber:'314-a',
                wardUuid:'Labour Ward uuid',
                physicalLocationName:'Physical Location Name'
            });
            expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.bedFromVisit);
            expect(_$http.get.calls.mostRecent().args[1].params).toEqual({
                patientUuid: 'patientUuid',
                v: "full"
            });
        }).catch(notifyError).finally(done);
    });
});