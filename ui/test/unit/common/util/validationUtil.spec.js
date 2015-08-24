var customValidator = {
    "age.days": {},
    "name": {},
    "Telephone Number": {}
};

describe('ValidationUtil', function () {

    var ValidationUtil = Bahmni.Common.Util.ValidationUtil;
    var complexObject, objectConfiguration;
    beforeEach(function () {
        complexObject = {
            "name": "jack",
            "age": {days: 7},
            "address": {
                "addr1": "addr1",
                "addr2": "addr2",
                "street": "road",
                "pin": 701
            }
        };
        objectConfiguration = {
            "one": { "name": "name" },
            "two": { "name": "age" }
        };
    });

    it("should call the custom validators", function () {
        customValidator["age.days"] = jasmine.createSpyObj('age.days', ['method']);
        customValidator["age.days"].method.and.returnValue(true);
        customValidator["name"] = jasmine.createSpyObj('name', ['method']);
        customValidator["name"].method.and.returnValue(true);
        ValidationUtil.validate(complexObject, objectConfiguration);
        expect(customValidator["name"].method).toHaveBeenCalledWith("name", "jack", objectConfiguration.one);
        expect(customValidator["age.days"].method).toHaveBeenCalledWith("age.days", 7, undefined);
    });

    it("should return the error message when the predicate fails", function () {
        customValidator["Telephone Number"] = jasmine.createSpyObj('Telephone Number', ['method']);
        customValidator["Telephone Number"].method.and.returnValue(false);
        customValidator["Telephone Number"].errorMessage = "Invalid Telephone Number";
        complexObject["Telephone Number"] = 983;
        var msg = ValidationUtil.validate(complexObject, objectConfiguration);
        expect(msg).toEqual("Invalid Telephone Number");
    });

    it("should return nothing when the custom validator is present", function () {
        customValidator = undefined;
        var msg = ValidationUtil.validate(complexObject, objectConfiguration);
        expect(msg).toEqual(undefined);
    });

});