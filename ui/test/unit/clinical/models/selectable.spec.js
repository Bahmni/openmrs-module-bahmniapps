'use strict';

describe("Selectable", function () {
	var Selectable = Bahmni.Clinical.Selectable;

	describe("select", function() {
		it("should select with self as source when source not specified", function() {
			var selectable = new Selectable();

			selectable.select();

			expect(selectable.isSelected()).toBeTruthy();
			expect(selectable.isSelectedFromSelf()).toBeTruthy();
		});

		it("should select with given source", function() {
			var parentSlectable = new Selectable();
			var selectable = new Selectable();

			selectable.select(parentSlectable);

			expect(selectable.isSelected()).toBeTruthy();
			expect(selectable.isSelectedFromOtherSource()).toBeTruthy();
			expect(selectable.isSelectedFromSelf()).toBeFalsy();
		});

		it("should select the children", function() {
			var child1 = new Selectable()
			var child2 = new Selectable()
			var selectable = new Selectable({}, [child1, child2]);

			selectable.select();

			expect(selectable.isSelected()).toBeTruthy();
			expect(child1.isSelected()).toBeTruthy();
			expect(child2.isSelected()).toBeTruthy();
		});

		it("should remove the child's self source", function() {
			var child = new Selectable()
			var selectable = new Selectable({}, [child]);

			child.select();
			expect(child.isSelectedFromSelf()).toBeTruthy();

			selectable.select();

			expect(child.isSelected()).toBeTruthy();
			expect(child.isSelectedFromSelf()).toBeFalsy();
		});
	});

	describe("unselect", function() {
		it("should unselect with self as source", function() {
			var selectable = new Selectable();

			selectable.select();
			selectable.unselect();

			expect(selectable.isSelected()).toBeFalsy();
			expect(selectable.isSelectedFromSelf()).toBeFalsy();
		});

		it("should unselect for given source only", function() {
			var child = new Selectable();
			var parent1 = new Selectable({}, [child]);
			var parent2 = new Selectable({}, [child]);

			parent1.select();
			parent2.select();
			expect(child.isSelected()).toBeTruthy();

			child.unselect(parent1);
			expect(child.isSelected()).toBeTruthy();

			child.unselect(parent2);
			expect(child.isSelected()).toBeFalsy();
		});

		it("should unselect the children", function() {
			var child1 = new Selectable()
			var child2 = new Selectable()
			var selectable = new Selectable({}, [child1, child2]);

			selectable.select();
			selectable.unselect();

			expect(child1.isSelected()).toBeFalsy();
			expect(child2.isSelected()).toBeFalsy();
			expect(selectable.isSelected()).toBeFalsy();
		});	
	});

	describe("toggle", function() {
		it("should slect when not selected", function() {
			var child1 = new Selectable()
			var child2 = new Selectable()
			var selectable = new Selectable({}, [child1, child2]);

			selectable.toggle();

			expect(selectable.isSelected()).toBeTruthy();
			expect(selectable.isSelectedFromSelf()).toBeTruthy();
			expect(child1.isSelected()).toBeTruthy();
			expect(child2.isSelected()).toBeTruthy();
		});

		it("should unslect when selected", function() {
			var child1 = new Selectable()
			var child2 = new Selectable()
			var selectable = new Selectable({}, [child1, child2]);

			selectable.select();
			selectable.toggle();

			expect(selectable.isSelected()).toBeFalsy();
			expect(selectable.isSelectedFromSelf()).toBeFalsy();
			expect(child1.isSelected()).toBeFalsy();
			expect(child2.isSelected()).toBeFalsy();
		});
	});

	describe("onSelectionChange", function () {
		var onSelectionChange;

		beforeEach(function() {
			onSelectionChange = jasmine.createSpy('onSelectionChange');
		});

		it("should be triggered on selecting", function() {
			var selectable = new Selectable({},[],onSelectionChange);

			selectable.select();

			expect(onSelectionChange).toHaveBeenCalledWith(selectable);
		});

		it("should be triggered on child and parent on selecting parent", function() {
			var child = new Selectable({}, [], onSelectionChange)
			var selectable = new Selectable({}, [child], onSelectionChange);

			selectable.select();

			expect(onSelectionChange.calls.count()).toBe(2);
			expect(onSelectionChange).toHaveBeenCalledWith(selectable);
			expect(onSelectionChange).toHaveBeenCalledWith(child);
		});

		it("should be triggered on unselecting", function() {
			var selectable = new Selectable({},[],onSelectionChange);

			selectable.select();
			selectable.unselect();

			expect(onSelectionChange.calls.count()).toBe(2);
			expect(onSelectionChange.calls.mostRecent().args[0]).toBe(selectable);
		});

		it("should be triggered on child and parent on unselecting parent", function() {
			var child = new Selectable({}, [], onSelectionChange)
			var selectable = new Selectable({}, [child], onSelectionChange);

			selectable.select();
			selectable.unselect();

			expect(onSelectionChange.calls.count()).toBe(4);
			expect(onSelectionChange.calls.all()[2].args[0]).toBe(child);
			expect(onSelectionChange.calls.all()[3].args[0]).toBe(selectable);
		});

		it("should not be triggered on selecting, when it is already selected via same source", function() {
			var selectable = new Selectable({},[],onSelectionChange);

			selectable.select();
			selectable.select();
			selectable.select();

			expect(onSelectionChange.calls.count()).toBe(1);
		});

		it("should not be triggered on unselecting, when it is already unselected via same source", function() {
			var selectable = new Selectable({},[],onSelectionChange);

			selectable.select();
			selectable.unselect();
			selectable.unselect();
			selectable.unselect();

			expect(onSelectionChange.calls.count()).toBe(2);
		});

		it("should be triggered on selecting already selected one via different sources", function() {
			var child = new Selectable({}, [], onSelectionChange);
			var parent1 = new Selectable({}, [child]);
			var parent2 = new Selectable({}, [child]);

			child.select(parent1);
			child.select(parent2);

			expect(onSelectionChange.calls.count()).toBe(2);
		});

		it("should be triggered on unselecting already unselected one via different sources", function() {
			var child = new Selectable({}, [], onSelectionChange);
			var parent1 = new Selectable({}, [child]);
			var parent2 = new Selectable({}, [child]);

			child.select(parent1);
			child.select(parent2);
			child.unselect(parent1);
			child.unselect(parent2);

			expect(onSelectionChange.calls.count()).toBe(4);
		});
	});
});