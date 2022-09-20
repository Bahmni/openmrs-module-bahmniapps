'use strict';
angular.module('bahmni.common.services')
    .factory('virtualConsultService', ['$http', '$rootScope', function ($http, $rootScope) {
        var launchMeeting = function (uuid, link, startWithVideoMuted) {
            $rootScope.$broadcast("event:launchVirtualConsult", {"uuid": uuid, "link": link, "startWithVideoMuted": startWithVideoMuted});
        };

        return {
            launchMeeting: launchMeeting
        };
    }]);
