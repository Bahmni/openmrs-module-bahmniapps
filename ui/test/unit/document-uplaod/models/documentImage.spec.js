'use strict';

describe("DocumentImage", function() {
	var DocumentImage = Bahmni.Common.DocumentImage;

	describe("getTitle", function() {
		it("should have concept name when concept is present", function() {
		  var image = new DocumentImage({concept: {name: "Chest X-Ray"}})

		  expect(image.getTitle()).toBe("Chest X-Ray");
		});

		it("should have observation date when present", function() {
		  var image = new DocumentImage({concept: {name: "Chest X-Ray"}, obsDatetime: "2014-03-14T12:38:21.000+0530"})

		  expect(image.getTitle()).toBe("Chest X-Ray, 14-Mar-2014");
		});

		it("should be blank when concept is absent", function() {
		  var image = new DocumentImage({concept: null})

		  expect(image.getTitle()).toBe("");
		});
	});
});