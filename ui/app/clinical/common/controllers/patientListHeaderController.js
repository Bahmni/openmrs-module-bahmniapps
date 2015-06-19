'use strict';

angular.module('bahmni.clinical')
    .controller('PatientListHeaderController', ['$scope', '$rootScope', '$bahmniCookieStore', 'providerService', 'spinner', 'locationService', '$window', 'ngDialog',
        function ($scope, $rootScope, $bahmniCookieStore, providerService, spinner, locationService, $window, ngDialog) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var selectedProvider = {};
            $scope.today = DateUtil.getDateWithoutTime(DateUtil.today());
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
                        'value': providerDetails.person ? providerDetails.person.display : providerDetails.display,
                        'uuid': providerDetails.uuid
                    }
                });
            };

            $scope.providerSelected = function() {
                return function(providerData){
                    selectedProvider = providerData;
                }
            };

            $scope.clearProvider = function(data) {
                if(!_.isEmpty(selectedProvider) && data !== selectedProvider.value){
                    $scope.encounterProvider = '';
                    selectedProvider = {};
                }
            };

            $scope.windowReload = function() {
                changeCookieData();
                $window.location.reload(false);
            };

            $scope.isCurrentLocation = function (location) {
                return getCurrentCookieLocation().uuid === location.uuid;
            };

            $scope.popUpHandler = function() {
                $scope.dialog = ngDialog.open({ template: 'consultation/views/defaultDataPopUp.html', className: 'test ngdialog-theme-default', controller: 'PatientListHeaderController'});

            };

            $scope.closePopUp = function() {
                ngDialog.close();
            };

            $scope.getTitle = function(){
                var title = [];
                if(getCurrentCookieLocation()) title.push(getCurrentCookieLocation().name);
                if(getCurrentProvider() && getCurrentProvider().value) title.push(getCurrentProvider().value);
                if(getCurrentDate()) title.push(DateUtil.formatDateWithoutTime(getCurrentDate()));
                return title.join(',');
            };

            var getCurrentCookieLocation = function () {
                return $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) ? $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) : null;
            };

            var getCurrentProvider = function () {
                return $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
            };

            var getCurrentDate = function () {
                return $bahmniCookieStore.get(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName);
            };

            var getLocationFor = function(uuid){
                return _.find($scope.locations, function(location){
                    return location.uuid == uuid;
                })
            };

            var changeCookieData = function() {
                $rootScope.retrospectiveEntry = $scope.date ? Bahmni.Common.Domain.RetrospectiveEntry.createFrom(DateUtil.getDate($scope.date)) : Bahmni.Common.Domain.RetrospectiveEntry.createFrom(DateUtil.getDate(DateUtil.today()));
                $bahmniCookieStore.remove(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName);
                $bahmniCookieStore.put(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName,  $scope.date, {path: '/', expires: 1});

                $bahmniCookieStore.remove(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
                $bahmniCookieStore.put(Bahmni.Common.Constants.grantProviderAccessDataCookieName, selectedProvider, {path: '/', expires: 1});

                var selectedLocation = getLocationFor($scope.selectedLocationUuid);
                $bahmniCookieStore.remove(Bahmni.Common.Constants.locationCookieName);
                $bahmniCookieStore.put(Bahmni.Common.Constants.locationCookieName, {name: selectedLocation.display, uuid: selectedLocation.uuid},{path: '/', expires: 7});
            };

            var init = function () {
                var retrospectiveDate = getCurrentDate();
                $scope.date = retrospectiveDate ? new Date(retrospectiveDate) : new Date($scope.today);
                $rootScope.retrospectiveEntry = retrospectiveDate ? Bahmni.Common.Domain.RetrospectiveEntry.createFrom(DateUtil.getDate(retrospectiveDate)) : Bahmni.Common.Domain.RetrospectiveEntry.createFrom(DateUtil.getDate(DateUtil.today()));

                $scope.encounterProvider = getCurrentProvider();
                selectedProvider = getCurrentProvider();

                return locationService.getAllByTag("Login Location").then(function (response) {
                        $scope.locations = response.data.results;
                        $scope.selectedLocationUuid = getCurrentCookieLocation().uuid;

                    }
                );
            };

            return spinner.forPromise(init());

        }]);