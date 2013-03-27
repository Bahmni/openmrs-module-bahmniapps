'use strict';

angular.module('resources.patient', ['resources.date'])
    .factory('patient', ['date', function (date) {
        var create = function(){
            var calculateAge = function(){
                if(this.birthdate) {
                    var curDate = date.now();
                    var birthDate = new Date(this.birthdate.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3") );
                    this.age = curDate.getFullYear() - birthDate.getFullYear() - ((curDate.getMonth() < birthDate.getMonth())? 1: 0);
                }
                else {
                    this.age = null;
                }
            }

            var generatePatientIdentifier = function() {
                if (this.registrationNumber && this.registrationNumber.length > 0) {
                    this.patientIdentifier = this.centerID.name + this.registrationNumber;
                }

                return this.patientIdentifier
            }

            return {
                address: {},
                calculateAge: calculateAge,
                generatePatientIdentifier: generatePatientIdentifier
            };
        }

        return {
            create: create
        }
    }]);
