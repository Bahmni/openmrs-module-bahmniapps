var errStr = "Age should be a possitive value";
var validate_name,validate_age = {
    'method': function (name, value) {
        if (value > 40) {
            return true;
        }
        return false;
    },
    'errorMessage': errStr
};

describe('ValidationUtil', function () {
    validate_name = jasmine.createSpyObj('validate_name', ['method']);
    var ValidationUtil = Bahmni.Common.Util.ValidationUtil;

    it("validate", function () {
        var complexObject = {
            "justAfunciton": function () {
            },
            "name": "jack",
            "age": 30,
            "address": {
                "addr1": "addr1",
                "addr2": "addr2",
                "street": "road",
                "pin": 701
            }
        };
        var objectConfiguration = {
            "one": {
                "name": "name"
            },
            "two": {
                "name": "age"
            }
        };
        var msg = ValidationUtil.validate(complexObject, objectConfiguration);
        expect(msg).toBe(errStr);
        expect(validate_name.method).toHaveBeenCalledWith("name", "jack", objectConfiguration.one);
    });
});