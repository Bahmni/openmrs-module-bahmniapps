'use strict';

describe("Age", function(){
    var ageFactory, scope, age;
    var dateUtil = Bahmni.Common.Util.DateUtil;
    beforeEach(module('bahmni.common.models'));
    beforeEach(inject(['$rootScope', 'age', function($rootScope, ageFactoryInjected){
        ageFactory = ageFactoryInjected;
        scope = $rootScope.$new();
    }]));


    describe("isEmpty", function(){
        it("should be true when all values are not specified", function(){
            expect(ageFactory.create(null, null, null).isEmpty()).toBeTruthy();
        });

        it("should be false when either years or months or days is specified", function(){
            expect(ageFactory.create(45, null, null).isEmpty()).toBeFalsy();
            expect(ageFactory.create(null, 12, null).isEmpty()).toBeFalsy();
            expect(ageFactory.create(null, null, 31).isEmpty()).toBeFalsy();
        });

        it("should be true when all values are 0", function(){
            expect(ageFactory.create(0, 0, 0).isEmpty()).toBeTruthy();
        });
    });

    describe("calculateBirthDate", function(){
        it("should return today when year, month and day are zero", function(){
            var age = ageFactory.create(0, 0, 0);
            var birthDate = dateUtil.now();

            expect(moment(ageFactory.calculateBirthDate(age)).format("DD MMM YYYY").toString()).toEqual(moment(birthDate).format("DD MMM YYYY").toString());
        });

        it("should return date of birth", function(){
            var age = ageFactory.create(10, 10, 10);

            var birthDate = dateUtil.now();
            birthDate = dateUtil.subtractYears(birthDate, age.years);
            birthDate = dateUtil.subtractMonths(birthDate, age.months);
            birthDate = dateUtil.subtractDays(birthDate, age.days);

            expect(dateUtil.formatDateWithoutTime(ageFactory.calculateBirthDate(age))).toEqual(dateUtil.formatDateWithoutTime(birthDate));
        });
    });


});