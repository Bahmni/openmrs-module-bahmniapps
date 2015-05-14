'use.strict';

angular.module('bahmni.clinical').factory('orderTypesInitialization',
    ['$http', function($http){
            return function(){

                var orderTypes = $http.get("/openmrs/ws/rest/v1/ordertype",{
                    method: "GET",
                    params: {v: "full"},
                    withCredentials: true
                }).then(function (response) {

                    var orderTypeConceptClassMap = {};
                    _.forEach(response.data.results, function(orderType){
                        orderTypeConceptClassMap['\''+orderType.name+'\''] = orderType;
                    });

                    return orderTypeConceptClassMap;
                });

                return orderTypes;
            }
        }
    ]
);