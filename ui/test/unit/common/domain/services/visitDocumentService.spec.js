"use strict"

describe("visitDocumentService", function () {
    var _$http;
    var _$rootScope;
    var _provide;
    var visitDocumentService;
    beforeEach(function() {
        module('bahmni.common.domain');
        module(function($provide) {
            _$http = jasmine.createSpyObj("$http", ['post']);
            _provide = $provide;
        });
        inject(function(){
            _provide.value('$http', _$http);
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