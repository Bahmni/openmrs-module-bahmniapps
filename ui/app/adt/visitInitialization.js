'use strict';

angular.module('bahmni.adt').factory('visitInitialization',
    ['$rootScope', '$q', 'visitService', 'initialization','spinner',
        function ($rootScope, $q, visitService, initialization, spinner) {
            return function(visitUuid) {
                var getVisit = function() {
                    if(visitUuid != 'null') {
                        return visitService.getVisit(visitUuid).success(function (visit) {
                            $rootScope.visit = visit;
                        });
                    } else {
                        return $q.when({ id: 1, status: "Returned from service.", promiseComplete: true });
                    }
                };

                return spinner.forPromise(initialization.then(getVisit));
            }
        }]
);
