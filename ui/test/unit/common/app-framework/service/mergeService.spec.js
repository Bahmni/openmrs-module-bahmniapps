describe("merge functionality", function (mergeService) {

    var master;
    beforeEach(module('bahmni.common.appFramework'));
    beforeEach(function () {
        master = {
            a: {
                c: "Hi",
                d: {
                    e: "Ola",
                    f: "Salut"
                }
            },
            b: "Hello"
        };
    });

    it("should change a leaf value", inject(['mergeService', function (mergeService) {
        var result = mergeService.merge(master, {
            a: {
                d: {
                    e: "Konnichiwa"
                }

            }
        });
        expect(result.a.b).toBe(master.a.b);
        expect(result.a.d.e).toBe("Konnichiwa");
        expect(result.a.d.f).toBe(master.a.d.f);
    }]));

    it("should be able to remove a value", inject(['mergeService', function (mergeService) {
        var result = mergeService.merge(master, {
            a: {
                d: {
                    e: "annyeonghaseyo",
                    f: null
                }

            }
        });
        expect(result.a.b).toBe(master.a.b);
        expect(result.a.c).toBe(master.a.c);
        expect(result.a.d.e).toBe("annyeonghaseyo");
        expect(result.a.d.f).toBeFalsy();
    }]));


    it("should be able to add a new node", inject(['mergeService', function (mergeService) {
        var result = mergeService.merge(master, {
            x: {key: "something"}
        });
        expect(result.a.b).toBe(master.a.b);
        expect(result.a.c).toBe(master.a.c);
        expect(result.a.d.e).toBe("Ola");
        expect(result.x.key).toBe("something");
    }]));

    it("should be able to remove a null node", inject(['mergeService', function (mergeService) {
        var result = mergeService.merge(master, {
            x: {key: "something"},
            a:{d: null, s:{}}
        });
        expect(result.a.b).toBe(master.a.b);
        expect(result.a.c).toBe(master.a.c);
        expect(result.a.d).toBeFalsy();
        expect(result.a.s).toBeTruthy();
        expect(result.x.key).toBe("something");
    }]));

    it("should not throw an error for undefined parameter", inject(['mergeService', function (mergeService) {
        var result = mergeService.merge(master, undefined);
        expect(result.a.b).toBe(master.a.b);
        expect(result.a.c).toBe(master.a.c);
        expect(result.b).toBe(master.b);
        expect(result.a.d.e).toBe(master.a.d.e);
        expect(result.a.d.f).toBe(master.a.d.f)
    }]));

    it("should not throw an error for undefined base and custom parameters", inject(['mergeService', function (mergeService){
        var base = undefined;
        var custom = undefined;
        var result = mergeService.merge(base, custom);
        expect(result).toBeEmpty();
    }]));

    it("should not throw an error for undefined base parameter", inject(['mergeService', function(mergeService){
        var base = undefined;
        var result = mergeService.merge(base, master);
        expect(result.a.b).toBe(master.a.b);
        expect(result.a.c).toBe(master.a.c);
        expect(result.b).toBe(master.b);
        expect(result.a.d.e).toBe(master.a.d.e);
        expect(result.a.d.f).toBe(master.a.d.f)
    }]));

});
