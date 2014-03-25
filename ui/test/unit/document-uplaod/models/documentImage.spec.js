'use strict';

describe("DocumentImage", function() {
	var DocumentImage = Bahmni.DocumentUpload.DocumentImage;

	describe("getTitle", function() {
		it("should have concept name when concept is present", function() {
		  var image = new DocumentImage({concept: {name: "Chest X-Ray"}})

		  expect(image.getTitle()).toBe("Chest X-Ray");
		});

		it("should be blank when concept is absent", function() {
		  var image = new DocumentImage({concept: null})

		  expect(image.getTitle()).toBe("");
		});
	});
});