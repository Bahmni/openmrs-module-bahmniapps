'use strict';

angular.module('bahmni.registration')
    .factory('patient', ['age', function (age) {
        var create = function (identifierTypes) {
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

            var generateIdentifier = function (identifier) {
                if (identifier.registrationNumber && identifier.registrationNumber.length > 0) {
                    identifier.identifier = identifier.selectedIdentifierSource ? identifier.selectedIdentifierSource.prefix + identifier.registrationNumber : identifier.registrationNumber;
                }else if(identifier.uuid){
                    identifier.voided = true;
                }
            };

            var clearRegistrationNumber = function (identifier) {
                identifier.registrationNumber = null;
                identifier.identifier = null;
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

            var buildIdentifiers = function(){
                var identifiers = [];
                _.each(identifierTypes, function(identifierType){
                   var identifier = {
                       identifierType: identifierType,
                       "preferred": identifierType.primary,
                       "voided": false
                   };
                    identifiers.push(identifier);
                });
                return identifiers;
            }
            return {
                address: {},
                age: age.create(),
                birthdate: null,
                calculateAge: calculateAge,
                identifiers: buildIdentifiers(),
                generateIdentifier: generateIdentifier,
                clearRegistrationNumber: clearRegistrationNumber,
                image: '../images/blank-user.gif',
                fullNameLocal: fullNameLocal,
                getImageData: getImageData,
                relationships: [],
                newlyAddedRelationships: [{}],
                deletedRelationships : [],
                calculateBirthDate: calculateBirthDate
            };
        };

        return {
            create: create
        }
    }]);
