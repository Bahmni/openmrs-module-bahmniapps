'use strict';
angular.module('bahmni.common.services')
    .factory('virtualConsultService', ['$http', '$rootScope', function ($http, $rootScope) {
        var launchMeeting = function (uuid, link) {
            $rootScope.$broadcast("event:launchVirtualConsult", {"uuid": uuid, "link": link});
        };

        return {
            launchMeeting: launchMeeting
        };
    }]);
