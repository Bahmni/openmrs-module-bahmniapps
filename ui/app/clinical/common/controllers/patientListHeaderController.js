'use strict';

angular.module('bahmni.clinical')
    .controller('PatientListHeaderController', ['$scope', '$rootScope', '$bahmniCookieStore', 'providerService', 'spinner', 'locationService', '$window', 'ngDialog', 'retrospectiveEntryService', '$translate', 'appService',
        function ($scope, $rootScope, $bahmniCookieStore, providerService, spinner, locationService, $window, ngDialog, retrospectiveEntryService, $translate, appService) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            $scope.maxStartDate = DateUtil.getDateWithoutTime(DateUtil.today());
            $scope.minStartDate = DateUtil.getDateWithoutTime(new Date(0));
            var selectedProvider = {};
            $scope.retrospectivePrivilege = Bahmni.Common.Constants.retrospectivePrivilege;
            $scope.locationPickerPrivilege = Bahmni.Common.Constants.locationPickerPrivilege;
            $scope.onBehalfOfPrivilege = Bahmni.Common.Constants.onBehalfOfPrivilege;
            $scope.selectedLocationUuid = {};
            $scope.getProviderList = function () {
                return function (searchAttrs) {
                    return providerService.search(searchAttrs.term);
                };
            };

            $scope.getProviderDataResults = function (data) {
                return data.data.results.map(function (providerDetails) {
                    return {
                        'value': providerDetails.person ? providerDetails.person.display : providerDetails.display,
                        'uuid': providerDetails.uuid
                    };
                });
            };

            $scope.providerSelected = function () {
                return function (providerData) {
                    selectedProvider = providerData;
                };
            };

            $scope.clearProvider = function (data) {
                if (!_.isEmpty(selectedProvider) && data !== selectedProvider.value) {
                    $scope.encounterProvider = '';
                    selectedProvider = {};
                }
            };

            $scope.windowReload = function () {
                changeCookieData();
                $window.location.reload(false);
            };

            $scope.isCurrentLocation = function (location) {
                return getCurrentCookieLocation().uuid === location.uuid;
            };

            $scope.popUpHandler = function () {
                $scope.dialog = ngDialog.open({ template: 'consultation/views/defaultDataPopUp.html',
                    className: 'test ngdialog-theme-default',
                    controller: 'PatientListHeaderController'});
                $('body').addClass('show-controller-back');
            };

            $scope.$on('ngDialog.closed', function () {
                $('body').removeClass('show-controller-back');
            });

            $scope.closePopUp = function () {
                ngDialog.close();
            };

            $scope.getTitle = function () {
                var title = [];
                if (getCurrentCookieLocation()) {
                    title.push($translate.instant(getCurrentCookieLocation().name));
                }
                if (getCurrentProvider() && getCurrentProvider().value) {
                    title.push(getCurrentProvider().value);
                }
                if (retrospectiveEntryService.getRetrospectiveDate()) {
                    title.push(DateUtil.formatDateWithoutTime(retrospectiveEntryService.getRetrospectiveDate()));
                }
                return title.join(',');
            };

            $scope.sync = function () {
            };
            var retrospectiveDateCheck = function () {
                var hasPrivilege = _.some($rootScope.currentUser.privileges, {name: 'bypassRetrospectiveDateThreshold'});
                var retrospectiveDateThreshold = appService.getAppDescriptor().getConfigValue('retrospectiveDateThreshold');
                if (!hasPrivilege && retrospectiveDateThreshold) {
                    var thresholdDate = new Date(new Date().setDate(retrospectiveDateThreshold));
                    var currentDate = new Date();

                    var startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1, 0);
                    if (currentDate > thresholdDate) {
                        startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0);
                    }

                    $scope.minStartDate = DateUtil.getDateWithoutTime(startDate);
                }
            };

            var getCurrentCookieLocation = function () {
                return $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) ? $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) : null;
            };

            var getCurrentProvider = function () {
                return $bahmniCookieStore.get(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
            };

            var getLocationFor = function (uuid) {
                return _.find($scope.locations, function (location) {
                    return location.uuid === uuid;
                });
            };

            var changeCookieData = function () {
                retrospectiveEntryService.resetRetrospectiveEntry($scope.date);
                $bahmniCookieStore.remove(Bahmni.Common.Constants.grantProviderAccessDataCookieName);
                $bahmniCookieStore.put(Bahmni.Common.Constants.grantProviderAccessDataCookieName, selectedProvider, {path: '/', expires: 1});

                var selectedLocation = getLocationFor($scope.selectedLocationUuid);
                $bahmniCookieStore.remove(Bahmni.Common.Constants.locationCookieName);
                $bahmniCookieStore.put(Bahmni.Common.Constants.locationCookieName, {name: selectedLocation.display, uuid: selectedLocation.uuid}, {path: '/', expires: 7});
            };

            var init = function () {
                var retrospectiveDate = retrospectiveEntryService.getRetrospectiveDate();
                $scope.date = retrospectiveDate ? new Date(retrospectiveDate) : new Date($scope.maxStartDate);
                $scope.encounterProvider = getCurrentProvider();
                selectedProvider = getCurrentProvider();
                retrospectiveDateCheck();
                return locationService.getAllByTag("Login Location").then(function (response) {
                    $scope.locations = response.data.results;
                    $scope.selectedLocationUuid = getCurrentCookieLocation().uuid;
                }
                );
            };

            return init();
        }]);
