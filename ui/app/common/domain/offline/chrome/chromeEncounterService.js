'use strict';

angular.module('bahmni.common.domain')
    .service('offlineEncounterServiceStrategy', ['$q', '$rootScope', '$bahmniCookieStore', 'offlineDbService',
        function ($q, $rootScope, $bahmniCookieStore, offlineDbService) {
            this.getDefaultEncounterType = function () {
                return offlineDbService.getReferenceData("DefaultEncounterType");
            };

            this.getEncounterTypeBasedOnLoginLocation = function () {
                return offlineDbService.getReferenceData("LoginLocationToEncounterTypeMapping").then(function (results) {
                    var mappings = results.data.results[0].mappings;
                    return {"data": mappings};
                });
            };

            this.getEncounterTypeBasedOnProgramUuid = function (programUuid) {
                return $q.when();
            };

            this.create = function (encounterData) {
                return offlineDbService.createEncounter(encounterData);
            };

            this.delete = function (encounterUuid, reason) {
                return $q.when({"data": {"results": []}});
            };

            this.search = function (visitUuid, encounterDate) {
                return $q.when({"data": {"results": []}});
            };

            this.find = function (params) {
                return offlineDbService.getActiveEncounter(params);
            };

            this.getEncountersByPatientUuid = function (patientUuid) {
                return offlineDbService.getEncountersByPatientUuid(patientUuid);
            };
        }]);
