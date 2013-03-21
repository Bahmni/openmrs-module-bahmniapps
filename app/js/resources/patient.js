'use strict';

angular.module('resources.patient', [])
    .factory('patient', [function () {
        var create = function(){
            var calculateAge = function(){
                var curDate = new Date();
                var birthDate = new Date(this.birthdate.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3") );;
                this.age = curDate.getFullYear() - birthDate.getFullYear() - ((curDate.getMonth() < birthDate.getMonth())? 1: 0);
            }

            return {
                names: [{}],
                addresses: [{}],
                attributes: [],
                calculateAge: calculateAge
            };
        }

        return {
            create: create
        }
    }]);
