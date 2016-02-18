'use strict';

angular.module('bahmni.registration')
    .factory('patient', ['age', function (age) {
        var create = function () {
            var calculateAge = function () {
                if (this.birthdate) {
                    this.age = age.fromBirthDate(this.birthdate);
                }
                else {
                    this.age = age.create(null, null, null);
                }
            };

            var calculateBirthDate = function () {
                this.birthdate = age.calculateBirthDate(this.age);
            };

            var generateIdentifier = function () {
                if (this.registrationNumber && this.registrationNumber.length > 0) {
                    this.identifier = this.identifierPrefix ? this.identifierPrefix.name + this.registrationNumber : this.registrationNumber;
                }
                return this.identifier
            };

            var clearRegistrationNumber = function () {
                this.registrationNumber = null;
                this.identifier = null;
            };

            var fullNameLocal = function () {
                var givenNameLocal = this.givenNameLocal || this.givenName || "";
                var middleNameLocal = this.middleNameLocal || this.middleName|| "";
                var familyNameLocal = this.familyNameLocal || this.familyName || "";
                return (givenNameLocal.trim() + " " + (middleNameLocal ? middleNameLocal + " " : "" ) + familyNameLocal.trim()).trim();
            };

            var getImageData = function () {
                return this.image && this.image.indexOf('data') === 0 ? this.image.replace("data:image/jpeg;base64,", "") : null;
            };

            return {
                address: {},
                age: age.create(),
                birthdate: null,
                calculateAge: calculateAge,
                identifierPrefix: {},
                generateIdentifier: generateIdentifier,
                clearRegistrationNumber: clearRegistrationNumber,
                image: '../images/blank-user.gif',
                fullNameLocal: fullNameLocal,
                getImageData: getImageData,
                relationships: [],
                newlyAddedRelationships: [{}],
                calculateBirthDate: calculateBirthDate
            };
        };

        return {
            create: create
        }
    }]);
