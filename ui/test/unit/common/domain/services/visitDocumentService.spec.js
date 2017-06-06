"use strict";

describe("visitDocumentService", function () {
    var _$http, _provide, visitDocumentService, _configurationService, _auditLogService;
    beforeEach(function() {
        module('bahmni.common.domain');
        module(function($provide) {
            _$http = jasmine.createSpyObj("$http", ['post', 'delete']);
            _configurationService = jasmine.createSpyObj('configurationService', ['getConfigurations']);
            _configurationService.getConfigurations.and.returnValue(specUtil.simplePromise({enableAuditLog: true}));
            _auditLogService = jasmine.createSpyObj('auditLogService', ['auditLog']);
            _auditLogService.auditLog.and.returnValue(specUtil.simplePromise({}));
            _provide = $provide;
        });
        inject(function(){
            _provide.value('$http', _$http);
            _provide.value('configurationService', _configurationService);
            _provide.value('auditLogService', _auditLogService);
        });
        inject(function(_visitDocumentService_){
            visitDocumentService = _visitDocumentService_;
        });
    });

    it("should able to upload an image", function (done) {
        var file = "image/jpeg;base64asldkjfldasflladsfjaldsfkdsaklf";
        var patientUuid = "test-patient-uuid";
        var encounterTypeName = "test-encounter-name";
        var fileName = "test-file.jpeg";
        var fileType = "image";
        var data =  {url : fileName};
        _$http.post.and.returnValue(specUtil.respondWithPromise(Q, {data: data}));
        visitDocumentService.saveFile(file, patientUuid, encounterTypeName, fileName, fileType).then(function (response) {
            expect(response.data.url).toEqual(fileName);
        }).catch(notifyError).finally(done);
    });

    it("should able to upload a video", function (done) {
        var file = "video/mp4;base64asldkjfldasflladsfjaldsfkdsaklf";
        var patientUuid = "test-patient-uuid";
        var encounterTypeName = "test-encounter-name";
        var fileName = "test-file.mp4";
        var fileType = "video";
        var data =  {url : fileName};
        _$http.post.and.returnValue(specUtil.respondWithPromise(Q, {data: data}));
        visitDocumentService.saveFile(file, patientUuid, encounterTypeName, fileName, fileType).then(function (response) {
            expect(response.data.url).toEqual(fileName);
        }).catch(notifyError).finally(done);
    });

    it("should throw error when we upload a file which file type is not in video, image and pdf", function (done) {
        var file = "data/csv;base64asldkjfldasflladsfjaldsfkdsaklf";
        var patientUuid = "test-patient-uuid";
        var encounterTypeName = "test-encounter-name";
        var fileName = "test-file.csv";
        var fileType = "data";
        var data =  {error:{message:"The file type is not supported. Supported types are image/video/pdf"}};
        _$http.post.and.returnValue(specUtil.respondWithPromise(Q, {data: data}));
        visitDocumentService.saveFile(file, patientUuid, encounterTypeName, fileName, fileType).then(function (response) {
            expect(response.data.error.message).toEqual(data.error.message);
        }).catch(notifyError).finally(done);
    });

    it("should make request to delete voided documents from disk", function () {
        var url = Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument?" +
            "filename=200/196-Patient Document-00870da2-7ee3-4a53-9eeb-abd2f686afab.jpeg";
        var visitDocuments = {
            documents: [{
                testUuid: "c4694ad6-3f10-11e4-adec-0800271c1b75",
                image: "200/196-Patient Document-00870da2-7ee3-4a53-9eeb-abd2f686afab.jpeg",
                voided: true,
                obsUuid: "a42ebc4b-d90a-4e46-8286-5a62650d658e"
            }, {
                testUuid: "c4694ad6-3f13-11e4-adec-0800271c1b95",
                image: "200/196-Patient Document-00870da2-7ee3-4a53-9eeb-abd2f686aaab.jpeg",
                obsUuid: "a42ebc4b-d90a-4e46-8286-5a62650d658e"
            }]
        };
        _$http.post.and.returnValue(specUtil.respondWithPromise(Q, {data: {}}));
        visitDocumentService.save(visitDocuments);
        expect(_$http.delete).toHaveBeenCalledWith(url, {withCredentials: true});
        expect(_$http.delete.calls.count()).toBe(1);
        expect(_$http.post).toHaveBeenCalledWith(Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument", visitDocuments);
    });

    it('should log when uploading files for a new visit', function () {
        var visitDocuments = {documents: [], patientUuid: 'patientUuid'};
        var params = {
            patientUuid: 'patientUuid',
            eventType: 'OPEN_VISIT',
            message: 'OPEN_VISIT_MESSAGE~{"visitUuid":"visitUuid","visitType":"OPD"}',
            module: 'document upload'
        };
        _$http.post.and.returnValue(specUtil.createFakePromise({visitUuid: 'visitUuid'}));
        visitDocumentService.save(visitDocuments, 'OPD');
        expect(_$http.post).toHaveBeenCalledWith(Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument", visitDocuments);
        expect(_configurationService.getConfigurations).toHaveBeenCalledWith(['enableAuditLog']);
        expect(_auditLogService.auditLog).toHaveBeenCalledWith(params);
    });

    describe("getFileType", function () {
        it("should give file type as pdf for pdf mime type", function () {
            expect(visitDocumentService.getFileType("image/jpeg")).toBe("image");
        });

        it("should give file type as pdf for image mime type", function () {
            expect(visitDocumentService.getFileType("application/pdf")).toBe("pdf");
        });

        it("should give file type as not_supported for any other mime type except image and pdf", function () {
            expect(visitDocumentService.getFileType("video/mp4")).toBe("not_supported");
        });
    });
});