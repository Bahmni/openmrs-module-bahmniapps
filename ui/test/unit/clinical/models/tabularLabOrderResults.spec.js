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

	describe("getDateLabels", function() {
		it("should return only initial and latest accessions based on the count", function() {
			var labOrderResults = {
				"values":[
					{"testOrderIndex":0,"dateIndex":0,"abnormal":false,"result":"25.0", "uploadedFileName": 'asd.jpg' },
					{"testOrderIndex":1,"dateIndex":2,"abnormal":false,"result":"25.0"}
				], "orders":[
					{"minNomral":0.0,"maxNormal":6.0,"testName":"ZN Stain(Sputum)","testUnitOfMeasurement":"%","index":0}
				], "dates":[
					{"index":0,"date":"30-May-2014"},
					{"index":1,"date":"01-Jun-2014"},
					{"index":2,"date":"02-Jun-2014"}
				]
			};
			var accessionConfig = {initialAccessionCount : 1, latestAccessionCount : 1};
			var tabularLabOrderResults = new Bahmni.Clinical.TabularLabOrderResults(labOrderResults, accessionConfig);
			var dateLabels = tabularLabOrderResults.getDateLabels();
            expect(dateLabels.length).toBe(2);
			expect(dateLabels[0]).toEqual({"index":0,"date":moment("30-May-2014", "DD-MMM-YYYY").toDate()});
			expect(dateLabels[1]).toEqual({"index":2,"date":moment("02-Jun-2014", "DD-MMM-YYYY").toDate()});
		});

		it("should return all accessions if the initial and latest count is greater than or equal to number of accessions", function() {
			var labOrderResults = {
				"values":[
					{"testOrderIndex":0,"dateIndex":0,"abnormal":false,"result":"25.0", "uploadedFileName": 'asd.jpg' },
					{"testOrderIndex":1,"dateIndex":2,"abnormal":false,"result":"25.0"}
				], "orders":[
					{"minNomral":0.0,"maxNormal":6.0,"testName":"ZN Stain(Sputum)","testUnitOfMeasurement":"%","index":0}
				], "dates":[
					{"index":0,"date":"30-May-2014"},
					{"index":2,"date":"01-Jun-2014"}
				]
			};
			var accessionConfig = {initialAccessionCount : 3, latestAccessionCount : 3};
			var tabularLabOrderResults = new Bahmni.Clinical.TabularLabOrderResults(labOrderResults, accessionConfig);
			var dateLabels = tabularLabOrderResults.getDateLabels();
            expect(dateLabels.length).toBe(2);
			expect(dateLabels[0]).toEqual({"index":0,"date":moment("30-May-2014", "DD-MMM-YYYY").toDate()});
			expect(dateLabels[1]).toEqual({"index":2,"date":moment("01-Jun-2014", "DD-MMM-YYYY").toDate()});
		});

		it("should return all accessions if the initial and latest count is undefined", function() {
			var labOrderResults = {
				"values":[
					{"testOrderIndex":0,"dateIndex":0,"abnormal":false,"result":"25.0", "uploadedFileName": 'asd.jpg' },
					{"testOrderIndex":1,"dateIndex":2,"abnormal":false,"result":"25.0"}
				], "orders":[
					{"minNomral":0.0,"maxNormal":6.0,"testName":"ZN Stain(Sputum)","testUnitOfMeasurement":"%","index":0}
				], "dates":[
					{"index":0,"date":"30-May-2014"},
					{"index":2,"date":"01-Jun-2014"}
				]
			};
			var accessionConfig = {};
			var tabularLabOrderResults = new Bahmni.Clinical.TabularLabOrderResults(labOrderResults, accessionConfig);
			var dateLabels = tabularLabOrderResults.getDateLabels();
            expect(dateLabels.length).toBe(2);

			expect(dateLabels[0]).toEqual({"index":0,"date":moment("30-May-2014", "DD-MMM-YYYY").toDate()});
			expect(dateLabels[1]).toEqual({"index":2,"date":moment("01-Jun-2014", "DD-MMM-YYYY").toDate()});
		})
	})
});