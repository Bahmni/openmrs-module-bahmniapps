'use strict';

describe ("Visit ", function() {
    describe("sortSavedFiles ", function(){
       it("should sort by id in ascending order", function(){
           var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

           var savedFiles = [
               {"id": 12, "concept": {"uuid": "112", "name": "Arm Xray"}, obsDatetime:"2014-06-04T13:25:00" },
               {"id": 56, "concept": {"uuid": "113", "name": "Leg Xray"}, obsDatetime:"2014-06-03T13:24:00" },
               {"id": 19, "concept": {"uuid": "111", "name": "Hand Xray"}, obsDatetime:"2014-06-04T13:24:00" },
               {"id": 2, "concept": {"uuid": "115", "name": "Skull Xray"}, obsDatetime:"2014-06-04T13:23:00" },
               {"id": 9, "concept": {"uuid": "114", "name": "Chest Xray"}, obsDatetime:"2014-06-07T13:24:00" }
               ];

           var sortedFiles = documentUploadVisit._sortSavedFiles(savedFiles);

           expect(sortedFiles[0].id).toBe(2);
           expect(sortedFiles[1].id).toBe(9);
           expect(sortedFiles[2].id).toBe(12);
           expect(sortedFiles[3].id).toBe(19);
           expect(sortedFiles[4].id).toBe(56);
       });
    });

    describe("assignImageIndex", function(){
        var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

        it("should assign image index to the image files excluding pdf files", function(){
            documentUploadVisit.files = [
                {"id": 2, "encodedValue":"/document_images/abc.img","concept": {"uuid": "115", "name": "Skull Xray"}, obsDatetime:"2014-06-04T13:23:00" },
                {"id": 9, "encodedValue":"/document_images/def.img","concept": {"uuid": "114", "name": "Chest Xray"}, obsDatetime:"2014-06-07T13:24:00" },
                {"id": 10,"encodedValue":"/document_images/123.pdf", obsDatetime:"2014-06-07T13:24:00" },
                {"id": 12,"encodedValue":"/document_images/ghi.img", "concept": {"uuid": "112", "name": "Arm Xray"}, obsDatetime:"2014-06-04T13:25:00" },
                {"id": 19,"encodedValue":"/document_images/jkl.img", "concept": {"uuid": "111", "name": "Hand Xray"}, obsDatetime:"2014-06-04T13:24:00" },
                {"id": 56,"encodedValue":"/document_images/mno.img", "concept": {"uuid": "113", "name": "Leg Xray"}, obsDatetime:"2014-06-03T13:24:00" }
            ];

            documentUploadVisit.assignImageIndex();

            expect(documentUploadVisit.files[0].imageIndex).toBe(4);
            expect(documentUploadVisit.files[1].imageIndex).toBe(3);
            expect(documentUploadVisit.files[2].imageIndex).toBeUndefined();
            expect(documentUploadVisit.files[3].imageIndex).toBe(2);
            expect(documentUploadVisit.files[4].imageIndex).toBe(1);
            expect(documentUploadVisit.files[5].imageIndex).toBe(0);
        });

        it("should assign image index to the image files when a new image file is added", function(){
            documentUploadVisit.files = [
                {"id": 2, "encodedValue":"/document_images/abc.img","concept": {"uuid": "115", "name": "Skull Xray"}, obsDatetime:"2014-06-04T13:23:00" },
                {"id": 10,"encodedValue":"/document_images/123.pdf", obsDatetime:"2014-06-07T13:24:00" },
                {"id": 12,"encodedValue":"/document_images/ghi.img", "concept": {"uuid": "112", "name": "Arm Xray"}, obsDatetime:"2014-06-04T13:25:00" }
            ];
            var file = "/document_images/new.jpeg";

            documentUploadVisit.addFile(file);

            expect(documentUploadVisit.files[0].imageIndex).toBe(2);
            expect(documentUploadVisit.files[1].imageIndex).toBeUndefined();
            expect(documentUploadVisit.files[2].imageIndex).toBe(1);
            expect(documentUploadVisit.files[3].imageIndex).toBe(0);
        });

        it("should not change the image index of image files when a new pdf file is added", function(){
            documentUploadVisit.files = [
                {"id": 2, "encodedValue":"/document_images/abc.img","concept": {"uuid": "115", "name": "Skull Xray"}, obsDatetime:"2014-06-04T13:23:00" },
                {"id": 10,"encodedValue":"/document_images/123.pdf", obsDatetime:"2014-06-07T13:24:00" },
                {"id": 12,"encodedValue":"/document_images/ghi.img", "concept": {"uuid": "112", "name": "Arm Xray"}, obsDatetime:"2014-06-04T13:25:00" }
            ];
            var file = "/document_images/new.pdf";

            documentUploadVisit.addFile(file);

            expect(documentUploadVisit.files[0].imageIndex).toBe(1);
            expect(documentUploadVisit.files[1].imageIndex).toBeUndefined();
            expect(documentUploadVisit.files[2].imageIndex).toBe(0);
            expect(documentUploadVisit.files[3].imageIndex).toBeUndefined();
        });

        it("should not update the image index of image files when an unsaved image file is removed", function(){
            var unsavedFile = {"id": 12, "encodedValue": "/document_images/ghi.img", "concept": {"uuid": "112", "name": "Arm Xray"}, obsDatetime: "2014-06-04T13:25:00", imageIndex:0 };
            documentUploadVisit.files = [
                {"id": 2, "encodedValue":"/document_images/abc.img","concept": {"uuid": "115", "name": "Skull Xray"}, obsDatetime:"2014-06-04T13:23:00", imageIndex: 1 },
                {"id": 10,"encodedValue":"/document_images/123.pdf", obsDatetime:"2014-06-07T13:24:00" },
                unsavedFile
            ];

            documentUploadVisit.removeFile(unsavedFile);

            expect(documentUploadVisit.files[0].imageIndex).toBe(0);
            expect(documentUploadVisit.files[1].imageIndex).toBeUndefined();
        })
    });

    describe("has errors", function(){
        it("should return false if the visit has newly added file and concept associated with it.", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            documentUploadVisit.files = [
                {
                    "concept":{
                        "uuid": 111,
                        "name": "Arm Xray",
                        "editableName": "Arm"
                    }
                }
            ];

            expect(documentUploadVisit.hasErrors()).toBeFalsy();
        });

        it("should return true if the visit has newly added file and no concept associated with it.", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            documentUploadVisit.files = [
                {

                }
            ];

            expect(documentUploadVisit.hasErrors()).toBeTruthy();
        });

        it("should return true if the visit has newly added file and editable name is undefined.", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            documentUploadVisit.files = [
                {
                    "concept":{
                        "name": "Arm",
                        "uuid": 111
                    }
                }
            ];

            expect(documentUploadVisit.hasErrors()).toBeTruthy();
        });

        it("should return true if the visit has newly added file and uuid is undefined.", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            documentUploadVisit.files = [
                {
                    "concept":{
                        "name": "Arm Xray",
                        "editableName": "Arm"
                    }
                }
            ];

            expect(documentUploadVisit.hasErrors()).toBeTruthy();
        });

        it("should return false if the file is voided and it has errors", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            documentUploadVisit.files = [
                {
                    "concept":{
                        "name": "Arm Xray",
                        "editableName": "Arm"
                    },
                    "voided": true
                }
            ];

            expect(documentUploadVisit.hasErrors()).toBeFalsy();
        });

        it("should return false if the file is voided and it has no errors", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            documentUploadVisit.files = [
                {
                    "concept":{
                        "name": "Arm Xray",
                        "editableName": "Arm",
                        "uuid": 111
                    },
                    "voided": true
                }
            ];

            expect(documentUploadVisit.hasErrors()).toBeFalsy();
        });

        it("should return true if one of the newly added file has errors.", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            documentUploadVisit.files = [
                {
                    "concept":{
                        "uuid": 111,
                        "name": "Arm Xray",
                        "editableName": "Arm"
                    }
                },
                {
                    "concept":{
                        "name": "Head Xray",
                        "editableName": "Head"
                    }
                }
            ];

            expect(documentUploadVisit.hasErrors()).toBeTruthy();
        });
    });

    describe("hasVisitType", function(){
        it("should return true if it has visit type uuid.", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            documentUploadVisit.visitType = {
                uuid: "uuid"
            };

            expect(documentUploadVisit.hasVisitType()).toBeTruthy();
        });

        it("should return false if it don't have visit type uuid.", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            documentUploadVisit.visitType = {
            };

            expect(documentUploadVisit.hasVisitType()).toBeFalsy();
        });

        it("should return false if it don't have visit type.", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            expect(documentUploadVisit.hasVisitType()).toBeFalsy();
        });
    });

    describe("initSavedFiles", function(){
        it("should map the observation to document from same encounter.", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            var obsConceptName = "Radiology";
            var member1 = {id: "skull id", value: "Skull value", obsDatetime: "2014-06-07T13:24:00", comment: "Skull broken"};
            var member2 = {id: "Kidney id", value: "Kidney value", obsDatetime: "2014-06-07T13:24:00", comment: "Kidney Failure"};
            var observation = {uuid: "ObsUuid",groupMembers: [member1, member2], concept: {name: {name: obsConceptName}, uuid: "obsConceptUuid"}};
            var encounter = {uuid: "encounterUuid",visit: {uuid: "visitUuid"}, obs: [observation]};
            var encounters = [encounter];

            var documentImageKidney = new Bahmni.Common.DocumentImage({
                id: member2.id,
                encodedValue: Bahmni.Common.Constants.documentsPath + '/' + member2.value,
                obsUuid: observation.uuid,
                obsDatetime: member2.obsDatetime,
                visitUuid: encounter.visit.uuid,
                encounterUuid: encounter.uuid,
                provider: new Bahmni.Common.Domain.ProviderMapper().map(encounter.provider),
                concept: {uuid: observation.concept.uuid, editableName: obsConceptName, name: obsConceptName},
                comment: member2.comment,
                imageIndex : 0
            });
            var documentImageSkull = new Bahmni.Common.DocumentImage({
                id: member1.id,
                encodedValue: Bahmni.Common.Constants.documentsPath + '/' + member1.value,
                obsUuid: observation.uuid,
                obsDatetime: member1.obsDatetime,
                visitUuid: encounter.visit.uuid,
                encounterUuid: encounter.uuid,
                provider: new Bahmni.Common.Domain.ProviderMapper().map(encounter.provider),
                concept: {uuid: observation.concept.uuid, editableName: obsConceptName, name: obsConceptName},
                comment: member1.comment,
                imageIndex : 1
            });
            var expectedMappedFiles = [documentImageSkull, documentImageKidney];

            documentUploadVisit.initSavedFiles(encounters);

            expect(documentUploadVisit.files).toEqual(expectedMappedFiles);
        });

        it("should map the observation to document from different encounters.", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            var obsConceptName = "Radiology";
            var provider = {uuid: "providerUuid", preferredName: {display: "ProviderPreferredName"}};
            var member1 = {id: "skull id", value: "Skull value", obsDatetime: "2014-06-07T13:24:00", comment: "Skull broken"};
            var member2 = {id: "Kidney id", value: "Kidney value", obsDatetime: "2014-06-07T13:24:00", comment: "Kidney Failure"};
            var observation1 = {uuid: "ObsUuid",groupMembers: [member1], concept: {name: {name: obsConceptName}, uuid: "obsConceptUuid"}};
            var observation2 = {uuid: "ObsUuid",groupMembers: [member2], concept: {name: {name: obsConceptName}, uuid: "obsConceptUuid"}};
            var encounter1 = {uuid: "encounterUuid1",visit: {uuid: "visitUuid"}, obs: [observation1], provider: provider};
            var encounter2 = {uuid: "encounterUuid2",visit: {uuid: "visitUuid"}, obs: [observation2], provider: provider};
            var encounters = [encounter1, encounter2];

            var documentImageSkull = new Bahmni.Common.DocumentImage({
                id: member1.id,
                encodedValue: Bahmni.Common.Constants.documentsPath + '/' + member1.value,
                obsUuid: observation1.uuid,
                obsDatetime: member1.obsDatetime,
                visitUuid: encounter1.visit.uuid,
                encounterUuid: encounter1.uuid,
                provider: new Bahmni.Common.Domain.ProviderMapper().map(encounter1.provider),
                concept: {uuid: observation1.concept.uuid, editableName: obsConceptName, name: obsConceptName},
                comment: member1.comment,
                imageIndex : 1
            });
            var documentImageKidney = new Bahmni.Common.DocumentImage({
                id: member2.id,
                encodedValue: Bahmni.Common.Constants.documentsPath + '/' + member2.value,
                obsUuid: observation2.uuid,
                obsDatetime: member2.obsDatetime,
                visitUuid: encounter2.visit.uuid,
                encounterUuid: encounter2.uuid,
                provider: new Bahmni.Common.Domain.ProviderMapper().map(encounter2.provider),
                concept: {uuid: observation2.concept.uuid, editableName: obsConceptName, name: obsConceptName},
                comment: member2.comment,
                imageIndex : 0
            });
            var expectedMappedFiles = [documentImageSkull, documentImageKidney];

            documentUploadVisit.initSavedFiles(encounters);

            expect(documentUploadVisit.files).toEqual(expectedMappedFiles);
        });

    });
});