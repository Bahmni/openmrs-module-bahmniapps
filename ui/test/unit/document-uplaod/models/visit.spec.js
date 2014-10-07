'use strict';

describe ("Visit ", function() {
    describe("sortSavedImages ", function(){
       it("should sort by id in ascending order", function(){
           var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

           var savedImages = [
               {"id": 12, "concept": {"uuid": "112", "name": "Arm Xray"}, obsDatetime:"2014-06-04T13:25:00" },
               {"id": 56, "concept": {"uuid": "113", "name": "Leg Xray"}, obsDatetime:"2014-06-03T13:24:00" },
               {"id": 19, "concept": {"uuid": "111", "name": "Hand Xray"}, obsDatetime:"2014-06-04T13:24:00" },
               {"id": 2, "concept": {"uuid": "115", "name": "Skull Xray"}, obsDatetime:"2014-06-04T13:23:00" },
               {"id": 9, "concept": {"uuid": "114", "name": "Chest Xray"}, obsDatetime:"2014-06-07T13:24:00" }
               ];

           var sortedImages = documentUploadVisit._sortSavedImages(savedImages);

           expect(sortedImages[0].id).toBe(2);
           expect(sortedImages[1].id).toBe(9);
           expect(sortedImages[2].id).toBe(12);
           expect(sortedImages[3].id).toBe(19);
           expect(sortedImages[4].id).toBe(56);
       });
    });

    describe("has errors", function(){
        it("should return false if the visit has newly added image and concept associated with it.", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            documentUploadVisit.images = [
                {
                    "concept":{
                        "uuid": 111,
                        "name": "Arm Xray",
                        "editableName": "Arm"
                    }
                }
            ];

            expect(documentUploadVisit.hasErrors()).toBe(false);
        });

        it("should return true if the visit has newly added image and no concept associated with it.", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            documentUploadVisit.images = [
                {

                }
            ];

            expect(documentUploadVisit.hasErrors()).toBe(true);
        });

        it("should return true if the visit has newly added image and editable name is undefined.", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            documentUploadVisit.images = [
                {
                    "concept":{
                        "name": "Arm",
                        "uuid": 111
                    }
                }
            ];

            expect(documentUploadVisit.hasErrors()).toBe(true);
        });

        it("should return true if the visit has newly added image and uuid is undefined.", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            documentUploadVisit.images = [
                {
                    "concept":{
                        "name": "Arm Xray",
                        "editableName": "Arm"
                    }
                }
            ];

            expect(documentUploadVisit.hasErrors()).toBe(true);
        });

        it("should return true if one of the newly added image has errors.", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            documentUploadVisit.images = [
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

            expect(documentUploadVisit.hasErrors()).toBe(true);
        });
    })
});