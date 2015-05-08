'use strict';

angular.module('bahmni.clinical')
    .controller('PatientListHeaderController', ['$scope', '$rootScope', '$bahmniCookieStore', 'providerService', 'spinner', 'locationService',
        function ($scope, $rootScope, $bahmniCookieStore, providerService, spinner, locationService) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var selectedProviderData = {};
            $scope.today = DateUtil.getDateWithoutTime(DateUtil.addDays(DateUtil.today(), 1));
            $scope.retrospectivePrivilege = Bahmni.Common.Constants.retrospectivePrivilege;
            $scope.grantProviderAccess = Bahmni.Common.Constants.grantProviderAccess;
            $scope.selectedLocationUuid = {};

            $scope.getProviderList = function() {
                return function (searchAttrs) {
                    return providerService.search(searchAttrs.term);
                };
            };

            $scope.getProviderDataResults = function(data) {
                return data.data.results.map(function (providerDetails) {
                    return {
                        'value': providerDetails.display,
                        'uuid': providerDetails.uuid
                    }
                });
            };

            $scope.providerSelected = function(data) {
                return function(providerData){
                    selectedProviderData = providerData;
                }
            };

            $scope.clearProvider = function(data) {
                if(!_.isEmpty(selectedProviderData) && data !== selectedProviderData.value){
                    $scope.encounterProvider = '';
                    selectedProviderData = {};
                }
            };

            $scope.windowReload = function() {
                changeCookieData();
                window.location.reload(false);
            };

            $scope.isCurrentLocation = function (location) {
                return getCurrentLocation().uuid === location.uuid;
            };

            var getCurrentLocation = function () {
                return $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) ? $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) : null;
            };

            var getLocationFor = function(uuid){
                return _.find($scope.locations, function(location){
                    return location.uuid == uuid;
                })
            };

            var changeCookieData = function() {
                $bahmniCookieStore.remove(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName);
                $bahmniCookieStore.put(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName, $scope.date, {path: '/', expires: 1});

                $bahmniCookieStore.remove(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
                $bahmniCookieStore.put(Bahmni.Common.Constants.grantProviderAccessDataCookieName, selectedProviderData, {path: '/', expires: 1});

                var selectedLocation = getLocationFor($scope.selectedLocationUuid);
                $bahmniCookieStore.remove(Bahmni.Common.Constants.locationCookieName);
                $bahmniCookieStore.put(Bahmni.Common.Constants.locationCookieName, {name: selectedLocation.display, uuid: selectedLocation.uuid},{path: '/', expires: 7});
            };


            var init = function () {
                var retrospectiveDate = $bahmniCookieStore.get(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName);
                $scope.date =  retrospectiveDate ? new Date(retrospectiveDate) : new Date($scope.today);
                $scope.encounterProvider = $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
                selectedProviderData = $scope.encounterProvider;
                return locationService.getAllByTag("Login Location").then(function (response) {
                        $scope.locations = response.data.results;
                        $scope.selectedLocationUuid = getCurrentLocation().uuid;
                    }
                );
            };

            return spinner.forPromise(init());

        }]);

