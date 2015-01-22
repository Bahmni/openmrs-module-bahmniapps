'use strict';

angular.module('bahmni.common.domain', [])
    .service('retrospectiveEntryService', ['$rootScope', '$bahmniCookieStore', function ($rootScope, $bahmniCookieStore) {

        var self = this;
        var hasRestrospectivePrivilege = function () {
            _.find($bahmniCookieStore.get(Bahmni.Common.Constants.currentUser).privileges, function (privilege) {
                return Bahmni.Clinical.Constants.retrospectivePrivilege === privilege.name;
            });
        };


        this.getRetrospectiveEntry = function () {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            if ($rootScope.retrospectiveEntry && $rootScope.retrospectiveEntry.encounterDate)
                return $rootScope.retrospectiveEntry;

            var retrospectiveEncounterDateCookie = $bahmniCookieStore.get(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName);


            if (retrospectiveEncounterDateCookie && hasRestrospectivePrivilege()) {
                $rootScope.retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(dateUtil.getDate(retrospectiveEncounterDateCookie));
                return $rootScope.retrospectiveEntry;
            }

            $rootScope.retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(dateUtil.now());
            return $rootScope.retrospectiveEntry;
        };

        self.getRetrospectiveEntry();

        // Keep service in sync with encounter date changes on the UI.
        $rootScope.$watch(Bahmni.Common.Constants.rootScopeRetrospectiveEntry, function () {
            $bahmniCookieStore.remove(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName);
            $bahmniCookieStore.put(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName, $rootScope.retrospectiveEntry.encounterDate, {path: '/', expires: 1});
        });

        // on fresh login remove the encounter date cookie. User will need to choose a past encounter date again for retrospective entry after fresh login.
//        $rootScope.$on('event:auth-loggedin', function() {
//            $bahmniCookieStore.remove(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName);
//        });

    }]
);