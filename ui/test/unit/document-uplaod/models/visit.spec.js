'use strict';

describe ("Visit ", function() {
    describe("sortSavedImages ", function(){
       it("should sort by id in descending order", function(){
           var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

           var savedImages = [
               {"id": 19, "concept": {"uuid": "111", "name": "Hand Xray"}},
               {"id": 12, "concept": {"uuid": "112", "name": "Arm Xray"}},
               {"id": 56, "concept": {"uuid": "113", "name": "Leg Xray"}},
               {"id": 9, "concept": {"uuid": "114", "name": "Chest Xray"}},
               {"id": 2, "concept": {"uuid": "115", "name": "Skull Xray"}}
               ];

           var sortedImages = documentUploadVisit._sortSavedImages(savedImages);

           expect(sortedImages[0].id).toBe(56);
           expect(sortedImages[1].id).toBe(19);
           expect(sortedImages[2].id).toBe(12);
           expect(sortedImages[3].id).toBe(9);
           expect(sortedImages[4].id).toBe(2);
       });

        it("should sort descendingly by id and group by concept", function(){
            var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

            var savedImages = [
                {"id": 19, "concept": {"uuid": "115", "name": "Skull Xray"}},
                {"id": 12, "concept": {"uuid": "112", "name": "Arm Xray"}},
                {"id": 56, "concept": {"uuid": "113", "name": "Leg Xray"}},
                {"id": 9, "concept": {"uuid": "114", "name": "Chest Xray"}},
                {"id": 2, "concept": {"uuid": "115", "name": "Skull Xray"}}
            ];

            var sortedImages = documentUploadVisit._sortSavedImages(savedImages);

            expect(sortedImages[0].id).toBe(56);
            expect(sortedImages[1].id).toBe(19);
            expect(sortedImages[2].id).toBe(2);
            expect(sortedImages[3].id).toBe(12);
            expect(sortedImages[4].id).toBe(9);
        });
    });
})