'use strict';

angular.module('bahmni.common.util')
    .factory('providerInfoService', [ '$rootScope', function ($rootScope) {
        $rootScope.provider = null;
        var setProvider = function (obs) {
            if ($rootScope.provider === null) {
                if (obs.length > 0) {
                    $rootScope.provider = obs[0].providers;
                }
            }
        };
        return {
            setProvider: setProvider
        };
    }]);
