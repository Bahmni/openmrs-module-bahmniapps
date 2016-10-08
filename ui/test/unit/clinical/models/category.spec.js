'use strict';

describe("Category", function () {
	var Category = Bahmni.Clinical.Category;

	describe("filteredTests", function() {
		it("should have all tests by default", function () {
			var test1 = {uuid: "1-1-1-1"};
			var test2 = {uuid: "2-2-2-2"};
			var category = new Category("Department1", [test1, test2]);

			expect(category.filteredTests.length).toBe(2);
		})
	});

	describe("filter", function() {
		it("should apply given filter", function() {
			var test1 = {uuid: "1-1-1-1"};
			var test2 = {uuid: "2-2-2-2"};
			var category = new Category("Department1", [test1, test2]);

			category.filter(function(test){ return test.uuid === '2-2-2-2'; });
			expect(category.filteredTests.length).toBe(1);
			expect(category.filteredTests[0]).toBe(test2);

			category.filter(function(){ return true; });
			expect(category.filteredTests.length).toBe(2);
		});
	})
});