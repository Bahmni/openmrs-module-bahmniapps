"use strict";

describe("visitDocumentService", function () {
    var _$http, _provide, visitDocumentService, _auditLogService, _configurations;
    beforeEach(function () {
        module('bahmni.common.domain');
        module(function ($provide) {
            _$http = jasmine.createSpyObj("$http", ['post', 'delete']);
            _auditLogService = jasmine.createSpyObj('auditLogService', ['log']);
            _auditLogService.log.and.returnValue(specUtil.simplePromise({}));
            var encounterConfig = jasmine.createSpyObj("encounterConfig", ["getVisitTypeByUuid", "getEncounterTypeByUuid"]);
            encounterConfig.getVisitTypeByUuid.and.returnValue({name: "OPD"});
            encounterConfig.getEncounterTypeByUuid.and.returnValue({name: "Patient Document"});
            _configurations = jasmine.createSpyObj("configurations", ["encounterConfig"]);
            _configurations.encounterConfig.and.returnValue(encounterConfig);
            _provide = $provide;
        });
        inject(function () {
            _provide.value('$http', _$http);
            _provide.value('auditLogService', _auditLogService);
            _provide.value('configurations', _configurations);
        });
        inject(function (_visitDocumentService_) {
            visitDocumentService = _visitDocumentService_;
        });
    });

    it("should able to upload an image", function (done) {
        var file = "image/jpeg;base64asldkjfldasflladsfjaldsfkdsaklf";
        var patientUuid = "test-patient-uuid";
        var encounterTypeName = "test-encounter-name";
        var fileName = "test-file.jpeg";
        var fileType = "image";
        var data = {url: fileName};
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
        var data = {url: fileName};
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
        var data = {error: {message: "The file type is not supported. Supported types are image/video/pdf"}};
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

    it("should not make request to delete voided documents from disk if the image path is not present", function () {
        var visitDocuments = {
            documents: [{
                testUuid: "c4694ad6-3f10-11e4-adec-0800271c1b75",
                image: "",
                voided: true,
                obsUuid: "a42ebc4b-d90a-4e46-8286-5a62650d658e"
            }, {
                testUuid: "c4694ad6-3f13-11e4-adec-0800271c1b95",
                image: null,
                voided: true,
                obsUuid: "a42ebc4b-d90a-4e46-8286-5a62650d658f"
            },
                {
                    testUuid: "c4694ad6-3f13-11e4-adec-0800271c1b96",
                    image: undefined,
                    voided: true,
                    obsUuid: "a42ebc4b-d90a-4e46-8286-5a62650d6590"
                }]
        };
        _$http.post.and.returnValue(specUtil.respondWithPromise(Q, {data: {}}));
        visitDocumentService.save(visitDocuments);
        expect(_$http.delete).not.toHaveBeenCalledWith();
        expect(_$http.delete.calls.count()).toBe(0);
        expect(_$http.post).toHaveBeenCalledWith(Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument", visitDocuments);
    });

    it("should make request to delete only voided documents from disk if the image path is present", function () {
        var url = Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument?" +
            "filename=200/196-Patient Document-00870da2-7ee3-4a53-9eeb-abd2f686afab.jpeg";
        var visitDocuments = {
            documents: [{
                testUuid: "c4694ad6-3f10-11e4-adec-0800271c1b75",
                image: "",
                voided: true,
                obsUuid: "a42ebc4b-d90a-4e46-8286-5a62650d658e"
            }, {
                testUuid: "c4694ad6-3f13-11e4-adec-0800271c1b95",
                image: null,
                voided: true,
                obsUuid: "a42ebc4b-d90a-4e46-8286-5a62650d658f"
            },{
                testUuid: "c4694ad6-3f13-11e4-adec-0800271c1b96",
                image: undefined,
                voided: true,
                obsUuid: "a42ebc4b-d90a-4e46-8286-5a62650d6590"
            },{
                testUuid: "c4694ad6-3f13-11e4-adec-0800271c1b97",
                image: "200/196-Patient Document-00870da2-7ee3-4a53-9eeb-abd2f686afab.jpeg",
                voided: true,
                obsUuid: "a42ebc4b-d90a-4e46-8286-5a62650d6591"
            }]
        };
        _$http.post.and.returnValue(specUtil.respondWithPromise(Q, {data: {}}));
        visitDocumentService.save(visitDocuments);
        expect(_$http.delete).toHaveBeenCalledWith(url, {withCredentials: true});
        expect(_$http.delete.calls.count()).toBe(1);
        expect(_$http.post).toHaveBeenCalledWith(Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument", visitDocuments);
    });

    it('should log when uploading files for a new visit and encounter', function () {
        var visitDocuments = {documents: [], patientUuid: 'patientUuid'};
        var visitDocumentResponse = {visitUuid: 'visitUuid', encounterUuid: "encounterUuid"};
        _$http.post.and.returnValue(specUtil.createFakePromise(visitDocumentResponse));
        visitDocumentService.save(visitDocuments);
        expect(_$http.post).toHaveBeenCalledWith(Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument", visitDocuments);
        expect(_auditLogService.log).toHaveBeenCalledWith(visitDocuments.patientUuid, 'OPEN_VISIT', {visitUuid: visitDocumentResponse.visitUuid, visitType: "OPD"}, "Patient Document");
        expect(_auditLogService.log).toHaveBeenCalledWith(visitDocuments.patientUuid, 'EDIT_ENCOUNTER', {encounterUuid: visitDocumentResponse.encounterUuid, encounterType: "Patient Document"}, "Patient Document");
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
