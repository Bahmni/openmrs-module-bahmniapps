describe("bedManagementService", function() {
    var bedLayouts = [
            {bedId: 1,
             bedNumber: "I1",
             bedType: {description: "This is the ICU bed type",
                       displayName: "ICU Bed",
                       id: 102,
                       name: "ICU Bed"},
             columnNumber: 1, 
             rowNumber: 1, 
             status: "OCCUPIED"
            },
            {bedId: 2,
             bedNumber: "I2",
             bedType: {description: "This is another bed type",
                       displayName: "ICU Bed",
                       id: 103,
                       name: "ICU Bed"},
             columnNumber: 2, 
             rowNumber: 2, 
             status: "AVAILABLE"
            }];

    beforeEach(module('bahmni.adt'));

    beforeEach(inject(['bedManagementService', function (bedManagementServiceInjected) {
	bedManagementService = bedManagementServiceInjected
    }]));

	describe("createLayoutGrid", function(){
		it("should create grid layout", function(){
            expect(bedManagementService.createLayoutGrid(bedLayouts).length).toBe(2);
        });
    });
});