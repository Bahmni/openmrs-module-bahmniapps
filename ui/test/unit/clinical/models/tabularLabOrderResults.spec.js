describe("TabularLabOrderResults", function() {
	describe("hasUploadedFiles()", function() {
		it("should return true if any uploaded files present for a given date and test", function() {
		    var labOrderResults = {
	            "values":[
	                {"testOrderIndex":0,"dateIndex":0,"abnormal":false,"result":"25.0", "uploadedFileName": 'asd.jpg' },
	                {"testOrderIndex":1,"dateIndex":0,"abnormal":false,"result":"25.0"}
	            ], "orders":[
	                {"minNomral":0.0,"maxNormal":6.0,"testName":"ZN Stain(Sputum)","testUnitOfMeasurement":"%","index":0}
	            ], "dates":[
	                {"index":0,"date":"30-May-2014"}
	            ]
		    };

		    var tabularLabOrderResults = new Bahmni.Clinical.TabularLabOrderResults(labOrderResults);
    		expect(tabularLabOrderResults.hasUploadedFiles({index: 0}, {index: 0})).toBeTruthy();
    		expect(tabularLabOrderResults.hasUploadedFiles({index: 0}, {index: 1})).toBeFalsy();
		});
	});
});