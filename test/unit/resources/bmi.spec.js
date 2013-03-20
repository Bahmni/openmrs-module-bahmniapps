describe("bmi", function(){
    beforeEach(module('resources.bmi'));

    describe("calculateBmi", function(){
        it("should calculate bmi as weight by height square", inject(['bmi', function(bmiModule){
            var bmi = bmiModule.calculateBmi(160, 50);

            expect(bmi.value).toBe(19.53);
        }]));

        it("should be invalid when bmi is less than 0", inject(['bmi', function(bmiModule){
            var bmiValue = bmiModule.calculateBmi(160, -5);

            expect(bmiValue.valid()).toBe(false);
        }]));

        it("should be invalid when bmi is greater than 100", inject(['bmi', function(bmiModule){
            var bmiValue = bmiModule.calculateBmi(16, 100);

            expect(bmiValue.valid()).toBe(false);
        }]));
    });

    describe("status", function(){
        it("should be Very Severely Underweight when bmi is less than 16 " , inject(['bmi', function(bmiModule){
            expect(bmiModule.createBmi(15.9).status()).toBe('Very Severely Underweight');
        }]));
        it("should be  Severely Underweight when bmi is between 16 and 16.99 " , inject(['bmi', function(bmiModule){
            expect(bmiModule.createBmi(16.5).status()).toBe('Severely Underweight');
        }]));

        it("should be Underweight when bmi is between 17 and  18.49 " , inject(['bmi', function(bmiModule){
            expect(bmiModule.createBmi(18).status()).toBe('Underweight');
        }]));

        it("should be Normal when bmi is between 18.5 and 24.99 " , inject(['bmi', function(bmiModule){
            expect(bmiModule.createBmi(23).status()).toBe('Normal');
        }]));

        it("should be Overweight when bmi is between 25 and 29.99 " , inject(['bmi', function(bmiModule){
            expect(bmiModule.createBmi(27).status()).toBe('Overweight');
        }]));

        it("should be Obese when bmi is between 30 and 34.99 " , inject(['bmi', function(bmiModule){
            expect(bmiModule.createBmi(33).status()).toBe('Obese');
        }]));

        it("should be Severely Obese when bmi is between 35 and 39.99 " , inject(['bmi', function(bmiModule){
            expect(bmiModule.createBmi(37).status()).toBe('Severely Obese');
        }]));

        it("should be Very Severely Obese when bmi is more than 39.99 " , inject(['bmi', function(bmiModule){
            expect(bmiModule.createBmi(39.99).status()).not.toBe('Very Severely Obese');
            expect(bmiModule.createBmi(41).status()).toBe('Very Severely Obese');
        }]));
    });
});
