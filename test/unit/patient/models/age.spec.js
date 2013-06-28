'use strict';

describe("Age", function(){
    var ageFactory, scope, age;
    
    beforeEach(module('registration.patient.models'));
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
    });
});