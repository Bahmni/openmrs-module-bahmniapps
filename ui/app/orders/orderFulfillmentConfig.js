'use strict';

angular.module('bahmni.orders')
    .factory('orderFulfillmentConfig', ['conceptSetService', 'spinner',
        function (conceptSetService, spinner) {
            var representation = "custom:(uuid,name,names,conceptClass," +
                "setMembers:(uuid,name,names,conceptClass," +
                "setMembers:(uuid,name,names,conceptClass," +
                "setMembers:(uuid,name,names,conceptClass))))";

            return function (formName) {
                return spinner.forPromise(conceptSetService.getConceptSetMembers({
                    name: formName,
                    v: representation
                }).then(function (response) {
                    var config = {};
                    var formMembers = response.data.results[0].setMembers;
                    config.conceptNames = _.map(formMembers,function(concept){
                        return concept.name.name;
                    });
                    config.isObservation = true;
                    config.numberOfVisits = 2;
                    config.showDetailsButton = true;
                    config.hideIfEmpty = false;
                    config.showHeader = false;
                    config.scope = "latest";
                    return config;
                }));
            }
        }
    ]
);
