'use strict';

angular.module('resources.bmi', [])
    .factory('bmi', [function () {

    //BMI WHO Constants
    var BMI_VERY_SEVERELY_UNDERWEIGHT = 16;
    var BMI_SEVERELY_UNDERWEIGHT = 17;
    var BMI_UNDERWEIGHT = 18.5;
    var BMI_NORMAL = 25;
    var BMI_OVERWEIGHT = 30;
    var BMI_OBESE = 35;
    var BMI_SEVERELY_OBESE = 40;

   var calculateBmi = function(height, weight){
       if (weight === null || height === null) {
           return;
       }
       var heightMtrs = height / 100;
       var value = weight / (heightMtrs * heightMtrs);
       return createBmi(parseFloat(value.toFixed(2)));
   }

   var createBmi = function(value){
       var valid = function(){
           return value >= 0 && value <= 100;
       }

       var status= function(){
           if (value  < BMI_VERY_SEVERELY_UNDERWEIGHT) {
               return 'Very Severely Underweight';
           }
           if (value  < BMI_SEVERELY_UNDERWEIGHT) {
               return 'Severely Underweight';
           }
           if (value  < BMI_UNDERWEIGHT) {
               return 'Underweight';
           }
           if (value  < BMI_NORMAL) {
               return 'Normal';
           }
           if (value  < BMI_OVERWEIGHT) {
               return 'Overweight';
           }
           if (value  < BMI_OBESE) {
               return 'Obese';
           }
           if (value  < BMI_SEVERELY_OBESE) {
               return 'Severely Obese';
           }
           if (value  >= BMI_SEVERELY_OBESE) {
               return 'Very Severely Obese';
           }
       }

       return {
         value: value,
         valid: valid,
         status: status
     }
   }


    return {
        calculateBmi : calculateBmi,
        createBmi: createBmi
    };
}]);