'use strict';

angular.module('resources.bmi', [])
    .factory('bmi', [function () {
    var bmi;

    //BMI WHO Constants
    var BMI_VERY_SEVERELY_UNDERWEIGHT = 15;
    var BMI_SEVERELY_UNDERWEIGHT = 16;
    var BMI_UNDERWEIGHT = 18.5;
    var BMI_NORMAL = 25;
    var BMI_OVERWEIGHT = 30;
    var BMI_OBESE = 35;
    var BMI_SEVERELY_OBESE = 40;

    // BMI Custom Constants
    var BMI_MAX = 60;
    var BMI_HEIGHT_MAX = 300;
    var BMI_HEIGHT_MIN = 0;
    var BMI_WEIGHT_MAX = 800;
    var BMI_WEIGHT_MIN = 0;

    var calculateBmi = function (height, weight) {
        if (weight === null || height === null) {
            return;
        }
        var heightMtrs = height / 100;
        bmi = (weight / (heightMtrs * heightMtrs));
        return bmi;
    }

    var calculateBMIStatus= function(){
        var status;
        if (bmi < BMI_VERY_SEVERELY_UNDERWEIGHT) {
            status = 'Very Severely Underweight';
        }
        if (bmi >= BMI_VERY_SEVERELY_UNDERWEIGHT && bmi < BMI_SEVERELY_UNDERWEIGHT) {
            status = 'Severely Underweight';
        }
        if (bmi >= BMI_SEVERELY_UNDERWEIGHT && bmi < BMI_UNDERWEIGHT) {
            status = 'Underweight';
        }
        if (bmi >= BMI_UNDERWEIGHT && bmi < BMI_NORMAL) {
            status = 'Normal';
        }
        if (bmi >= BMI_NORMAL && bmi < BMI_OVERWEIGHT) {
            status = 'Overweight';
        }
        if (bmi >= BMI_OVERWEIGHT && bmi < BMI_OBESE) {
            status = 'Obese';
        }
        if (bmi >= BMI_OBESE && bmi < BMI_SEVERELY_OBESE) {
            status = 'Severely Obese';
        }
        if (bmi >= BMI_SEVERELY_OBESE) {
            status = 'Very Severely Obese';
        }
        console.log(status);
        return status;
    }

    return {
        calculateBmi : calculateBmi,
        calculateBMIStatus : calculateBMIStatus
    };
}]);