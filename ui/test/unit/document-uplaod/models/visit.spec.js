'use strict';

describe ("Visit ", function() {
    describe("sortSavedImages ", function(){
       it("should sort by id in descending order", function(){
           var documentUploadVisit = new Bahmni.DocumentUpload.Visit;

           var savedImages = [
               {"id": 12, "concept": {"uuid": "112", "name": "Arm Xray"}, obsDatetime:"2014-06-04T13:25:00" },
               {"id": 56, "concept": {"uuid": "113", "name": "Leg Xray"}, obsDatetime:"2014-06-03T13:24:00" },
               {"id": 19, "concept": {"uuid": "111", "name": "Hand Xray"}, obsDatetime:"2014-06-04T13:24:00" },
               {"id": 2, "concept": {"uuid": "115", "name": "Skull Xray"}, obsDatetime:"2014-06-04T13:23:00" },
               {"id": 9, "concept": {"uuid": "114", "name": "Chest Xray"}, obsDatetime:"2014-06-07T13:24:00" }
               ];

           var sortedImages = documentUploadVisit._sortSavedImages(savedImages);

           expect(sortedImages[0].id).toBe(56);
           expect(sortedImages[1].id).toBe(19);
           expect(sortedImages[2].id).toBe(12);
           expect(sortedImages[3].id).toBe(9);
           expect(sortedImages[4].id).toBe(2);
       });
    });
})