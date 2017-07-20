'use strict';

angular.module('bahmni.common.domain')
    .service('offlineEncounterServiceStrategy', ['$q', '$rootScope', '$bahmniCookieStore', 'androidDbService',
        function ($q, $rootScope, $bahmniCookieStore, androidDbService) {
            this.getDefaultEncounterType = function () {
                return androidDbService.getReferenceData("DefaultEncounterType");
            };

            this.getEncounterTypeBasedOnLoginLocation = function () {
                return androidDbService.getReferenceData("LoginLocationToEncounterTypeMapping").then(function (results) {
                    var mappings = results.data.results[0].mappings;
                    return {"data": mappings};
                });
            };

            this.getEncounterTypeBasedOnProgramUuid = function (programUuid) {
                return $q.when();
            };

            this.create = function (encounterData) {
                return androidDbService.createEncounter(encounterData);
            };

            this.delete = function (encounterUuid, reason) {
                return $q.when({"data": {"results": []}});
            };

            this.search = function (visitUuid, encounterDate) {
                return $q.when({"data": {"results": []}});
            };

            this.find = function (params) {
                return androidDbService.getActiveEncounter(params);
            };

            this.getEncountersByPatientUuid = function (patientUuid) {
                return androidDbService.getEncountersByPatientUuid(patientUuid);
            };
        }]);
