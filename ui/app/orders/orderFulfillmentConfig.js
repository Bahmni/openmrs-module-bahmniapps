'use strict';

angular.module('bahmni.orders').factory('orderFulfillmentConfig',
    ['conceptSetService', 'spinner', function(conceptSetService, spinner){
        return function(formName){
            var prepareConfig = spinner.forPromise(conceptSetService.getConceptSetMembers({name : formName, v :"custom:(uuid,name,names,conceptClass,setMembers:(uuid,name,names,conceptClass,setMembers:(uuid,name,names,conceptClass,setMembers:(uuid,name,names,conceptClass))))"})).then(function (response) {
                var config = {};
                config.conceptNames = [];
                _.forEach(response.data.results[0].setMembers, function(obsConcept){
                    config.conceptNames.push(obsConcept.name.name);
                });
                config.isObservation = true;
                config.numberOfVisits = 2;
                config.showDetailsButton = true;
                config.hideIfEmpty = false;
                config.showHeader = false;
                config.scope = "latest";
                return config;
            });

            return prepareConfig;
        }
    }
    ]
);
