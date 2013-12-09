'use strict';

describe("objectUtil", function(){
	var ObjectUtil = Bahmni.Registration.Util.ObjectUtil;
	
	describe("slice", function(){
		it("should create new object with given the properties", function(){
			var obj = {a: 1, b: "foo", c: "bar"}

			var slicedObj = ObjectUtil.slice(obj, ['a', 'c'])

			expect(slicedObj.a).toBe(obj.a)
			expect(slicedObj.c).toBe(obj.c)
			expect(slicedObj.b).toBe(undefined)
		})

		it("should not fail the object does not have given property", function(){
			var obj = {a: 1}

			var slicedObj = ObjectUtil.slice(obj, ['a', 'c'])

			expect(slicedObj.a).toBe(obj.a)
			expect(slicedObj.c).toBe(undefined)
		})
	});	
});