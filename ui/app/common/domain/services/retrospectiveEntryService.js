'use strict';

angular.module('bahmni.common.domain', [])
    .service('retrospectiveEntryService', ['$rootScope', '$cookieStore', function ($rootScope, $cookieStore) {

        var self = this;

        this.getRetrospectiveEntry = function () {
            if ($rootScope.retrospectiveEntry && $rootScope.retrospectiveEntry.encounterDate)
                return $rootScope.retrospectiveEntry;

            var retrospectiveEncounterDateCookie = $cookieStore.get('bahmni.clinical.retrospectiveEncounterDate');

            if (retrospectiveEncounterDateCookie) {
                $rootScope.retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(retrospectiveEncounterDateCookie);
                return $rootScope.retrospectiveEntry;
            }

            $rootScope.retrospectiveEntry = Bahmni.Common.Domain.RetrospectiveEntry.createFrom(Bahmni.Common.Util.DateUtil.getDateWithoutTime(Bahmni.Common.Util.DateUtil.now()));
            return $rootScope.retrospectiveEntry;
        };

        self.getRetrospectiveEntry();

        // Keep service in sync with encounter date changes on the UI.
        $rootScope.$watch('retrospectiveEntry.encounterDate', function () {
            $cookieStore.remove('bahmni.clinical.retrospectiveEncounterDate');
            $cookieStore.put('bahmni.clinical.retrospectiveEncounterDate', $rootScope.retrospectiveEntry.encounterDate, {path: '/', expires: 7});
        });

    }]
);