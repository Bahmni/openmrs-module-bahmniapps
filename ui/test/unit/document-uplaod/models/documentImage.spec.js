'use strict';

describe("DocumentImage", function() {
	var DocumentImage = Bahmni.Common.DocumentImage;

	describe("getTitle", function() {
		it("should have concept name when concept is present", function() {
		  var image = new DocumentImage({concept: {name: "Chest X-Ray"}})

		  expect(image.getTitle()).toBe("Chest X-Ray");
		});

		it("should have observation date when present", function() {
			var obsDate = new Date();
		  var image = new DocumentImage({concept: {name: "Chest X-Ray"}, obsDatetime: obsDate})

		  expect(image.getTitle()).toBe("Chest X-Ray, "+ moment(obsDate).format("DD-MMM-YYYY"));
		});

		it("should be blank when concept is absent", function() {
		  var image = new DocumentImage({concept: null})

		  expect(image.getTitle()).toBe("");
		});
	});
});