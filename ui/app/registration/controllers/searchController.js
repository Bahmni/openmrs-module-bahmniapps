'use strict';

angular.module('bahmni.registration')
    .controller('SearchPatientController', ['$rootScope', '$scope', '$location', '$window', 'spinner', 'patientService', 'appService', 'Preferences',
        function ($rootScope, $scope, $location, $window, spinner, patientService, appService, preferences) {
            $scope.identifierSources = $rootScope.patientConfiguration.identifierSources;
            $scope.results = [];
            var searching = false;

            var allSearchConfigs = appService.getAppDescriptor().getConfigValue("patientSearch") || {};

            var hasSearchParameters = function () {
                return $scope.searchParameters.name.trim().length > 0
                    || $scope.searchParameters.addressFieldValue.trim().length > 0
                    || $scope.searchParameters.customAttribute.trim().length > 0;
            };

            var searchBasedOnQueryParameters = function (offset) {
                $scope.searchParameters.addressFieldValue = $location.search().addressFieldValue || '';
                $scope.searchParameters.name = $location.search().name || '';
                $scope.searchParameters.customAttribute = $location.search().customAttribute || '';
                var identifierPrefix = $location.search().identifierPrefix;
                if (!identifierPrefix || identifierPrefix.length === 0) {
                    identifierPrefix = preferences.identifierPrefix;
                }
                $scope.identifierSources.forEach(function (identifierSource) {
                    if (identifierPrefix === identifierSource.prefix) {
                        $scope.searchParameters.identifierPrefix = identifierSource;
                    }
                });
                $scope.searchParameters.identifierPrefix = $scope.searchParameters.identifierPrefix || $scope.identifierSources[0];

                $scope.searchParameters.registrationNumber = $location.search().registrationNumber || "";
                if (hasSearchParameters()) {
                    var searchPromise = patientService.search(
                        $scope.searchParameters.name,
                        $scope.addressSearchConfig.field,
                        $scope.searchParameters.addressFieldValue,
                        $scope.searchParameters.customAttribute,
                        offset,
                        $scope.customAttributesSearchConfig.fields
                    ).then(function(response) {
                         mapCustomAttributesSearchResults(response.data);
                         return response.data;
                    });
                    searching = true;
                    searchPromise['finally'](function () {
                        searching = false;
                    });
                    return searchPromise;
                }
            };
            $scope.convertToTableHeader = function(camelCasedText){
                return camelCasedText.replace(/[A-Z]|^[a-z]/g,function (str, group1, group2) {
                    return " " + str.toUpperCase() + "";
                }).trim();
            };

            var mapCustomAttributesSearchResults = function(data){
                if($scope.customAttributesSearchConfig.fields){
                    data.pageOfResults.map(function(result){
                        result.customAttribute = result.customAttribute && JSON.parse(result.customAttribute);
                    });
                }
            };

            var showSearchResults = function (searchPromise) {
                $scope.noMoreResultsPresent = false;
                if (searchPromise) {
                    searchPromise.then(function (data) {
                        $scope.results = data.pageOfResults;
                        $scope.noResultsMessage = $scope.results.length === 0 ? 'REGISTRATION_NO_RESULTS_FOUND' : null;
                    });
                }
            };

            var setAddressSearchConfig = function(){
                var defaultSearchConfig= {
                    label: "Village",
                    placeholder: "Enter village",
                    field: "city_village"
                };
                $scope.addressSearchConfig = allSearchConfigs.address || defaultSearchConfig;
                if(!$scope.addressSearchConfig.label) throw "Search Config label is not present!";
                if(!$scope.addressSearchConfig.field) throw "Search Config field is not present!";
            };

            var setCustomAttributesSearchConfig = function () {
                var customAttributesSearchConfig = allSearchConfigs.customAttributes;
                $scope.customAttributesSearchConfig = customAttributesSearchConfig || {};
                $scope.customAttributesSearchConfig.show = !_.isEmpty(customAttributesSearchConfig) && !_.isEmpty(customAttributesSearchConfig.fields);
            };

            var initialize = function () {
                $scope.searchParameters = {};
                $scope.searchActions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.patient.search.result.action");
                setAddressSearchConfig();
                setCustomAttributesSearchConfig();
            };

            var identifyParams = function (querystring) {
                querystring = querystring.substring(querystring.indexOf('?') + 1).split('&');
                var params = {}, pair, d = decodeURIComponent;
                for (var i = querystring.length - 1; i >= 0; i--) {
                    pair = querystring[i].split('=');
                    params[d(pair[0])] = d(pair[1]);
                }
                return params;
            };

            initialize();

            $scope.disableSearchButton = function () {
                return !$scope.searchParameters.name && !$scope.searchParameters.addressFieldValue && !$scope.searchParameters.customAttribute;
            };

            $scope.$watch(function () {
                return $location.search();
            }, function () {
                showSearchResults(searchBasedOnQueryParameters(0))
            });

            $scope.searchById = function () {
                if (!$scope.searchParameters.registrationNumber) return;
                $scope.results = [];
                var patientIdentifier = $scope.searchParameters.identifierPrefix.prefix + $scope.searchParameters.registrationNumber;
                preferences.identifierPrefix = $scope.searchParameters.identifierPrefix.prefix;
                $location.search({identifierPrefix: $scope.searchParameters.identifierPrefix.prefix, registrationNumber: $scope.searchParameters.registrationNumber});
                var searchPromise = patientService.search(patientIdentifier, $scope.addressSearchConfig.field).success(function (data) {
                    mapCustomAttributesSearchResults(data);
                    if (data.pageOfResults.length === 1) {
                        var patient = data.pageOfResults[0];
                        var forwardUrl = appService.getAppDescriptor().getConfigValue("searchByIdForwardUrl") || "/patient/{{patientUuid}}";
                        $location.url(appService.getAppDescriptor().formatUrl(forwardUrl, {'patientUuid': patient.uuid}));
                    } else if (data.pageOfResults.length > 1) {
                        $scope.results = data.pageOfResults;
                    } else {
                        $scope.patientIdentifier = {'patientIdentifier': patientIdentifier};
                        $scope.noResultsMessage = 'REGISTRATION_LABEL_COULD_NOT_FIND_PATIENT';
                    }
                });
                spinner.forPromise(searchPromise);
            };

            $scope.loadingMoreResults = function () {
                return searching && !$scope.noMoreResultsPresent;
            };

            $scope.searchPatients = function () {
                var queryParams = {};
                 $scope.results = [];
                if ($scope.searchParameters.name) {
                    queryParams.name = $scope.searchParameters.name;
                }
                if ($scope.searchParameters.addressFieldValue) {
                    queryParams.addressFieldValue = $scope.searchParameters.addressFieldValue;
                }
                if ($scope.searchParameters.customAttribute && $scope.customAttributesSearchConfig.show) {
                    queryParams.customAttribute = $scope.searchParameters.customAttribute;
                }
                $location.search(queryParams);
            };

            $scope.resultsPresent = function () {
                return angular.isDefined($scope.results) && $scope.results.length > 0;
            };

            $scope.editPatientUrl = function (url, options) {
                var temp = url;
                for (var key in options) {
                    temp = temp.replace("{{" + key + "}}", options[key]);
                }
                return temp;
            };

            $scope.nextPage = function () {
                if ($scope.nextPageLoading) {
                    return;
                }
                $scope.nextPageLoading = true;
                var promise = searchBasedOnQueryParameters($scope.results.length);
                if (promise) {
                    promise.then(function (data) {
                        data.pageOfResults.forEach(function (result) {
                            $scope.results.push(result)
                        });
                        $scope.noMoreResultsPresent = (data.pageOfResults.length === 0);
                        $scope.nextPageLoading = false;
                    }, function () {
                        $scope.nextPageLoading = false;
                    });
                }
            };

            $scope.forPatient = function (patient) {
                $scope.selectedPatient = patient;
                return $scope;
            };

            $scope.doExtensionAction = function (extension) {
                var forwardTo = appService.getAppDescriptor().formatUrl(extension.url, { 'patientUuid': $scope.selectedPatient.uuid });
                if (extension.label === 'Print') {
                    var params = identifyParams(forwardTo);
                    if (params.launch === 'dialog') {
                        var firstChar = forwardTo.charAt(0);
                        var prefix = firstChar === "/" ? "#" : "#/";
                        var hiddenFrame = $("#printPatientFrame")[0];
                        hiddenFrame.src = prefix + forwardTo;
                        hiddenFrame.contentWindow.print();
                    } else {
                        $location.url(forwardTo);
                    }
                } else {
                    $location.url(forwardTo);
                }
            };

            $scope.extensionActionText = function (extension) {
                return extension.translationKey;
            }
        }]);
