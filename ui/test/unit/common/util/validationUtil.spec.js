Bahmni.Registration.customValidator = {
    "age.days": {},
    "name": {},
    "Telephone Number": {},
    "date": {}
};

describe('ValidationUtil', function () {
    var date = new Date();

    var ValidationUtil = Bahmni.Common.Util.ValidationUtil;
    var customValidator = Bahmni.Registration.customValidator;
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
            },
            "date": date
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
        customValidator["date"] = jasmine.createSpyObj('date', ['method']);
        customValidator["date"].method.and.returnValue(true);
        ValidationUtil.validate(complexObject, objectConfiguration);
        expect(customValidator["name"].method).toHaveBeenCalledWith("name", "jack", objectConfiguration.one);
        expect(customValidator["age.days"].method).toHaveBeenCalledWith("age.days", 7, undefined);
        expect(customValidator["date"].method).toHaveBeenCalledWith("date", date, undefined);
    });

    it("should return the error message when the predicate fails", function () {
        customValidator["Telephone Number"] = jasmine.createSpyObj('Telephone Number', ['method']);
        customValidator["Telephone Number"].method.and.returnValue(false);
        customValidator["Telephone Number"].errorMessage = "Invalid Telephone Number";
        complexObject["Telephone Number"] = 983;
        var msg = ValidationUtil.validate(complexObject, objectConfiguration);
        expect(msg).toEqual(["Invalid Telephone Number"]);
    });

    it("should return nothing when the custom validator is not present", function () {
        customValidator = undefined;
        var msg = ValidationUtil.validate(complexObject, objectConfiguration);
        expect(msg).toEqual([]);
    });

});