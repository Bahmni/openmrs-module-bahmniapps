'use strict';

angular.module('bahmni.registration')
    .factory('patient', ['age', 'identifiers', function (age, identifiers) {
        var create = function () {
            var calculateAge = function () {
                if (this.birthdate) {
                    this.age = age.fromBirthDate(this.birthdate);
                    this.birthdateBS = convertDobAdToBs(this.birthdate);
                } else {
                    this.age = age.create(null, null, null);
                }
            };
            var updateAdDate = function () {
                if (this.birthdateBS) {
                    var dateStr = this.birthdateBS.split("-");
                    var birthdateAD = calendarFunctions.getAdDateByBsDate(calendarFunctions.getNumberByNepaliNumber(dateStr[0]), calendarFunctions.getNumberByNepaliNumber(dateStr[1]), calendarFunctions.getNumberByNepaliNumber(dateStr[2]));
                    this.birthdate = birthdateAD;
                }
            };

            var convertDobAdToBs = function (dateStr) {
                var adDate = Bahmni.Common.Util.DateUtil.getDateWithoutTime(dateStr).split("-");
                var bsDate = calendarFunctions.getBsDateByAdDate(parseInt(adDate[0]), parseInt(adDate[1]), parseInt(adDate[2]));
                return calendarFunctions.bsDateFormat("%y-%m-%d", bsDate.bsYear, bsDate.bsMonth, bsDate.bsDate);
            };

            var calculateBirthDate = function () {
                this.birthdate = age.calculateBirthDate(this.age);
                this.birthdateBS = convertDobAdToBs(this.birthdate);
            };

            var fullNameLocal = function () {
                var givenNameLocal = this.givenNameLocal || this.givenName || "";
                var middleNameLocal = this.middleNameLocal || this.middleName || "";
                var familyNameLocal = this.familyNameLocal || this.familyName || "";
                return (givenNameLocal.trim() + " " + (middleNameLocal ? middleNameLocal + " " : "") + familyNameLocal.trim()).trim();
            };

            var getImageData = function () {
                return this.image && this.image.indexOf('data') === 0 ? this.image.replace("data:image/jpeg;base64,", "") : null;
            };

            var identifierDetails = identifiers.create();

            var patient = {
                address: {},
                age: age.create(),
                birthdate: null,
                calculateAge: calculateAge,
                image: '../images/blank-user.gif',
                fullNameLocal: fullNameLocal,
                getImageData: getImageData,
                relationships: [],
                newlyAddedRelationships: [{}],
                deletedRelationships: [],
                calculateBirthDate: calculateBirthDate,
                updateAdDate: updateAdDate
            };
            return _.assign(patient, identifierDetails);
        };

        return {
            create: create
        };
    }]);
