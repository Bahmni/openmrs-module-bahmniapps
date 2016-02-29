'use strict';

describe('mergeLocaleFilesService', function () {

    var mergeLocaleFilesService, mergeService;
    var _$http;
    var baseFile = {"KEY1" : "This is base key"};
    var customFile = {"KEY1" : "This is custom key"};

    beforeEach(function(){
        module('bahmni.common.i18n');
        module('bahmni.common.appFramework');
        module(function ($provide){
            _$http = jasmine.createSpyObj('$http', ['get']);
            $provide.value('$http', _$http);
            $provide.value('$q', Q);
        });

        inject(function (_mergeLocaleFilesService_, _mergeService_) {
            mergeLocaleFilesService = _mergeLocaleFilesService_;
            mergeService = _mergeService_;
        });
    });

    it('merge when both base, custom configs are there', function(done){
        _$http.get.and.callFake(function(param) {
            if(param.indexOf('bahmni_config') != -1)
                return specUtil.createFakePromise(customFile);
            else
                return specUtil.createFakePromise(baseFile);
        });


        var promise = mergeLocaleFilesService({app: 'clinical', shouldMerge: true, key: 'en'});

        promise.then(function(response) {
            expect(response.data).toEqual(customFile);
            done();
        });
    });

    it('return both base, custom locales when shouldMerge is false', function(done){
        _$http.get.and.callFake(function(param) {
            if(param.indexOf('bahmni_config') != -1)
                return specUtil.createFakePromise(customFile);
            else
                return specUtil.createFakePromise(baseFile);
        });

        var promise = mergeLocaleFilesService({app: 'clinical', shouldMerge: false, key: 'en'});

        promise.then(function(response) {
            expect([response[0].data, response[1].data]).toEqual([ baseFile, customFile ]);
            done();
        });
    });
});