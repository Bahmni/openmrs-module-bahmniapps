'use strict';

angular.module('bahmni.registration')
    .controller('SearchPatientController', ['$rootScope', '$scope', '$location', '$window', 'spinner', 'patientService', 'appService', 'Preferences',
                'messagingService', '$translate','$filter',
        function ($rootScope, $scope, $location, $window, spinner, patientService, appService, preferences, messagingService, $translate,$filter) {

            $scope.identifierSources = $rootScope.patientConfiguration.identifierSources;
            $scope.results = [];
            var searching = false;

            var allSearchConfigs = appService.getAppDescriptor().getConfigValue("patientSearch") || {};

            var hasSearchParameters = function () {
                return $scope.searchParameters.name.trim().length > 0 ||
                    $scope.searchParameters.addressFieldValue.trim().length > 0 ||
                    $scope.searchParameters.customAttribute.trim().length > 0 ||
                    $scope.searchParameters.programAttributeFieldValue.trim().length > 0;
            };

            var searchBasedOnQueryParameters = function (offset) {

                if(! isUserPrivilegedForSearch()) {
                    showInsufficientPrivMessage();
                    return;
                }
                var searchParameters = $location.search();
                $scope.searchParameters.addressFieldValue = searchParameters.addressFieldValue || '';
                $scope.searchParameters.name = searchParameters.name || '';
                $scope.searchParameters.customAttribute = searchParameters.customAttribute || '';
                $scope.searchParameters.programAttributeFieldValue = searchParameters.programAttributeFieldValue || '';
                var identifierPrefix = searchParameters.identifierPrefix;
                if (!identifierPrefix || identifierPrefix.length === 0) {
                    identifierPrefix = preferences.identifierPrefix;
                }
                $scope.identifierSources.forEach(function (identifierSource) {
                    if (identifierPrefix === identifierSource.prefix) {
                        $scope.searchParameters.identifierPrefix = identifierSource;
                    }
                });
                $scope.searchParameters.identifierPrefix = $scope.searchParameters.identifierPrefix || $scope.identifierSources[0];

                $scope.searchParameters.registrationNumber = searchParameters.registrationNumber || "";
                if (hasSearchParameters()) {
                    searching = true;
                    var searchPromise = patientService.search(
                        $scope.searchParameters.name,
                        undefined,
                        undefined,
                        $scope.addressSearchConfig.field,
                        $scope.searchParameters.addressFieldValue,
                        $scope.searchParameters.customAttribute,
                        offset,
                        $scope.customAttributesSearchConfig.fields,
                        $scope.programAttributesSearchConfig.field,
                        $scope.searchParameters.programAttributeFieldValue
                    ).then(function(response) {
                         mapCustomAttributesSearchResults(response);
                         mapProgramAttributesSearchResults(response);
                         return response;
                    });
                    searchPromise['finally'](function () {
                        searching = false;
                    });
                    return searchPromise;
                }

            };
            $scope.convertToTableHeader = function(camelCasedText){
                return camelCasedText.replace(/[A-Z]|^[a-z]/g,function (str) {
                    return " " + str.toUpperCase() + "";
                }).trim();
            };

            $scope.getProgramAttributeValues = function(result){
                var attributeValues = result && result.patientProgramAttributeValue && result.patientProgramAttributeValue[$scope.programAttributesSearchConfig.field];
                var commaSeparatedAttributeValues = "";
                _.each(attributeValues, function (attr) {
                    commaSeparatedAttributeValues = commaSeparatedAttributeValues + attr + ", ";
                });
                return commaSeparatedAttributeValues.substring(0, commaSeparatedAttributeValues.length-2);
            };

            $scope.getAddressFieldLabel = function(){
              if($scope.addressSearchConfig.label){
                  return $scope.addressSearchConfig.label;
              }
              return $translate.instant('REGISTRATION_LABEL_CITY');
            };

            var mapCustomAttributesSearchResults = function(data){
                if(( $scope.programAttributesSearchConfig.field || $scope.customAttributesSearchConfig.fields) && data != "Searching"){
                    _.map(data.pageOfResults, function(result){
                        result.customAttribute = result.customAttribute && JSON.parse(result.customAttribute);
                    });
                }
            };

            var mapProgramAttributesSearchResults = function (data) {
                if(( $scope.programAttributesSearchConfig.field || $scope.customAttributesSearchConfig.fields) && data != "Searching") {
                    _.map(data.pageOfResults, function (result) {
                        var programAttributesObj ={};
                        var arrayOfStringOfKeysValue = result.patientProgramAttributeValue && result.patientProgramAttributeValue.substring(2, result.patientProgramAttributeValue.length-2).split('","');
                        _.each(arrayOfStringOfKeysValue, function(keyValueString){
                            var keyValueArray = keyValueString.split('":"');
                            var key = keyValueArray[0];
                            var value = keyValueArray[1]
                            if(! _.includes(_.keys(programAttributesObj), key)) {
                                programAttributesObj[key] = [];
                                programAttributesObj[key].push(value);
                            }
                            else {
                                programAttributesObj[key].push(value)
                            }
                        });
                        result.patientProgramAttributeValue = programAttributesObj;
                    });
                }
            }

            var showSearchResults = function (searchPromise) {
                $scope.noMoreResultsPresent = false;
                if (searchPromise) {
                    searchPromise.then(function (data) {
                        $scope.results = data.pageOfResults;
                        $scope.noResultsMessage = $scope.results.length === 0 ? 'REGISTRATION_NO_RESULTS_FOUND' : null;
                    });
                }
            };

            var setPatientIdentifierSearchConfig = function(){
                $scope.patientIdentifierSearchConfig = {};
                $scope.patientIdentifierSearchConfig.show = allSearchConfigs.searchByPatientIdentifier === undefined ? true: allSearchConfigs.searchByPatientIdentifier ;
            };

            var setAddressSearchConfig = function(){
                $scope.addressSearchConfig = allSearchConfigs.address || {};
                $scope.addressSearchConfig.show = !_.isEmpty($scope.addressSearchConfig) && !_.isEmpty($scope.addressSearchConfig.field);
                if($scope.addressSearchConfig.label && !$scope.addressSearchConfig.label) {
                    throw "Search Config label is not present!";
                }
                if($scope.addressSearchConfig.field && !$scope.addressSearchConfig.field) {
                    throw "Search Config field is not present!";
                }
            };

            var setCustomAttributesSearchConfig = function () {
                var customAttributesSearchConfig = allSearchConfigs.customAttributes;
                $scope.customAttributesSearchConfig = customAttributesSearchConfig || {};
                $scope.customAttributesSearchConfig.show = !_.isEmpty(customAttributesSearchConfig) && !_.isEmpty(customAttributesSearchConfig.fields);
            };

            var setProgramAttributesSearchConfig = function () {
                $scope.programAttributesSearchConfig = allSearchConfigs.programAttributes || {};
                $scope.programAttributesSearchConfig.show = !_.isEmpty($scope.programAttributesSearchConfig.field);
            };

            var initialize = function () {
                $scope.searchParameters = {};
                $scope.searchActions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.patient.search.result.action");
                setPatientIdentifierSearchConfig();
                setAddressSearchConfig();
                setCustomAttributesSearchConfig();
                setProgramAttributesSearchConfig();
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
                return !$scope.searchParameters.name && !$scope.searchParameters.addressFieldValue && !$scope.searchParameters.customAttribute && !$scope.searchParameters.programAttributeFieldValue;
            };

            $scope.$watch(function () {
                return $location.search();
            }, function () {
                showSearchResults(searchBasedOnQueryParameters(0))
            });

            $scope.searchById = function () {
                if(! isUserPrivilegedForSearch()) {
                    showInsufficientPrivMessage();
                    return;
                }
                if (!$scope.searchParameters.registrationNumber) {
                    return;
                }
                $scope.results = [];

                var patientIdentifier = $scope.searchParameters.registrationNumber;

                // strip off the identifier prefix from the identifier itself if it exists
                $scope.identifierSources.forEach(function (identifierSource) {
                    var regex = new RegExp('^' + identifierSource.prefix, 'i');
                    if (regex.test(patientIdentifier)) {
                        patientIdentifier = patientIdentifier.replace(regex, '');
                        $scope.searchParameters.identifierPrefix = identifierSource;  // make sure that the identifier prefix search parameter is set to the prefix we found
                    }
                });

                preferences.identifierPrefix = $scope.searchParameters.identifierPrefix ? $scope.searchParameters.identifierPrefix.prefix : "";

                $location.search({
                    identifierPrefix: preferences.identifierPrefix,
                    registrationNumber: $scope.searchParameters.registrationNumber,
                    programAttributeFieldName: $scope.programAttributesSearchConfig.field,
                    programAttributeFieldValue: $scope.searchParameters.programAttributeFieldValue
                });

                var searchPromise = patientService.search(undefined, patientIdentifier, preferences.identifierPrefix, $scope.addressSearchConfig.field, undefined, undefined, undefined, undefined, $scope.programAttributesSearchConfig.field, $scope.searchParameters.programAttributeFieldValue).then(function (data) {
                    mapCustomAttributesSearchResults(data);
                    mapProgramAttributesSearchResults(data)
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
            var isUserPrivilegedForSearch = function() {
                var applicablePrivs = [Bahmni.Common.Constants.viewPatientsPrivilege, Bahmni.Common.Constants.editPatientsPrivilege,
                    Bahmni.Common.Constants.addVisitsPrivilege, Bahmni.Common.Constants.deleteVisitsPrivilege];
                var userPrivs = _.map($rootScope.currentUser.privileges, function(privilege) {
                    return privilege.name;
                });
                var result = _.some(userPrivs, function(privName){
                    return _.includes(applicablePrivs, privName);
                });
                return result;
            };

            var showInsufficientPrivMessage = function(){
                var message = $translate.instant("REGISTRATION_INSUFFICIENT_PRIVILEGE");
                messagingService.showMessage('error', message);
            };

            $scope.loadingMoreResults = function () {
                return searching && !$scope.noMoreResultsPresent;
            };

            $scope.searchPatients = function () {
                if(! isUserPrivilegedForSearch()) {
                    showInsufficientPrivMessage();
                    return;
                }
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
                if ($scope.searchParameters.programAttributeFieldValue && $scope.programAttributesSearchConfig.show) {
                    queryParams.programAttributeFieldName = $scope.programAttributesSearchConfig.field;
                    queryParams.programAttributeFieldValue = $scope.searchParameters.programAttributeFieldValue;
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
                        angular.forEach(data.pageOfResults,function (result) {
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
                return $filter('titleTranslate')(extension);
            }

            $scope.hasIdentifierSources = function(){
                return $scope.identifierSources.length > 0;
            }
        }]);
