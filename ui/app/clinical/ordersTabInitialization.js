'use.strict';

angular.module('bahmni.clinical').factory('ordersTabInitialization',
    ['conceptSetService', 'spinner', function(conceptSetService, spinner){
        return function(){

            var allOrderables = spinner.forPromise(conceptSetService.getConceptSetMembers({name:"All Orderables",v:"custom:(uuid,name,names,set,conceptClass,setMembers:(uuid,name,names,set,conceptClass,setMembers:(uuid,name,names,set,conceptClass,setMembers:(uuid,name,names,set,conceptClass,setMembers:(uuid,name,names,set,conceptClass)))))"})).then(function (response) {
                var allOrderables = {};
                _.forEach(response.data.results[0].setMembers, function(orderable){
                    var conceptName = _.find(orderable.names, {conceptNameType: "SHORT"}) || _.find(orderable.names, {conceptNameType: "FULLY_SPECIFIED"});
                    conceptName = conceptName ? conceptName.name : conceptName;
                    allOrderables['\''+conceptName+'\''] = orderable;
                });

                return allOrderables;
            });

            return allOrderables;
        }
    }
    ]
);