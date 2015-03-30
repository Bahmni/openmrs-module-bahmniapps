'use strict';

angular.module('bahmni.adt').factory('visitInitialization',
    ['$rootScope', '$q', 'visitService',
        function ($rootScope, $q, visitService) {
            return function (visitUuid) {
                var getVisit = function () {
                    if (visitUuid != 'null') {
                        return visitService.getVisit(visitUuid).then(function (response) {
                            var visit = response.data;
                            $rootScope.visit = new Bahmni.ADT.Visit(visit);
                        });
                    } else {
                        $rootScope.visit = null;
                        return $q.when({id: 1, status: "Returned from service.", promiseComplete: true});
                    }
                };

                return getVisit();
            }
        }]
);
