'use strict';

angular.module('bahmni.registration')
    .controller('SearchPatientController', ['$rootScope', '$scope', '$location', '$window', 'spinner', 'patientService', 'appService',
        'messagingService', '$translate', '$filter',
        function ($rootScope, $scope, $location, $window, spinner, patientService, appService, messagingService, $translate, $filter) {
            $scope.results = [];
            var searching = false;
            var maxAttributesFromConfig = 5;
            const allSearchConfigs = appService.getAppDescriptor().getConfigValue("patientSearch") || {};
            const patientSearchResultOptions = allSearchConfigs.patientSearchResultOptions != null ? allSearchConfigs.patientSearchResultOptions : {};
            const ignoredIdentifiers = new Set(patientSearchResultOptions.ignorePatientIdentifiers || []);
            $scope.showAge = patientSearchResultOptions.showAge != null ? patientSearchResultOptions.showAge : true;
            $scope.showDOB = patientSearchResultOptions.showDOB != null ? patientSearchResultOptions.showDOB : false;
            $scope.extraIdentifierTypes = _.filter($rootScope.patientConfiguration.identifierTypes, function (identifierType) {
                return !identifierType.primary && !ignoredIdentifiers.has(identifierType.name);
            });
            var patientSearchResultConfigs = appService.getAppDescriptor().getConfigValue("patientSearchResults") || {};
            maxAttributesFromConfig = !_.isEmpty(allSearchConfigs.programAttributes) ? maxAttributesFromConfig - 1 : maxAttributesFromConfig;

            $scope.getAddressColumnName = function (column) {
                var columnName = "";
                var columnCamelCase = column.replace(/([-_][a-z])/g, function ($1) {
                    return $1.toUpperCase().replace(/[-_]/, '');
                });
                _.each($scope.addressLevels, function (addressLevel) {
                    if (addressLevel.addressField === columnCamelCase) { columnName = addressLevel.name; }
                });
                return columnName;
            };

            var hasSearchParameters = function () {
                return $scope.searchParameters.name.trim().length > 0 ||
                    $scope.searchParameters.addressFieldValue.trim().length > 0 ||
                    $scope.searchParameters.customAttribute.trim().length > 0 ||
                    $scope.searchParameters.programAttributeFieldValue.trim().length > 0;
            };

            var searchBasedOnQueryParameters = function (offset) {
                if (!isUserPrivilegedForSearch()) {
                    showInsufficientPrivMessage();
                    return;
                }
                var searchParameters = $location.search();
                $scope.searchParameters.addressFieldValue = searchParameters.addressFieldValue || '';
                $scope.searchParameters.name = searchParameters.name || '';
                $scope.searchParameters.customAttribute = searchParameters.customAttribute || '';
                $scope.searchParameters.programAttributeFieldValue = searchParameters.programAttributeFieldValue || '';
                $scope.searchParameters.addressSearchResultsConfig = searchParameters.addressSearchResultsConfig || '';
                $scope.searchParameters.personSearchResultsConfig = searchParameters.personSearchResultsConfig || '';

                $scope.searchParameters.registrationNumber = searchParameters.registrationNumber || "";
                if (hasSearchParameters()) {
                    searching = true;
                    var searchPromise = patientService.search(
                        $scope.searchParameters.name,
                        undefined,
                        $scope.addressSearchConfig.field,
                        $scope.searchParameters.addressFieldValue,
                        $scope.searchParameters.customAttribute,
                        offset,
                        $scope.customAttributesSearchConfig.fields,
                        $scope.programAttributesSearchConfig.field,
                        $scope.searchParameters.programAttributeFieldValue,
                        $scope.addressSearchResultsConfig.fields,
                        $scope.personSearchResultsConfig.fields
                    ).then(function (response) {
                        mapExtraIdentifiers(response);
                        mapCustomAttributesSearchResults(response);
                        mapAddressAttributesSearchResults(response);
                        mapProgramAttributesSearchResults(response);
                        return response;
                    });
                    searchPromise['finally'](function () {
                        searching = false;
                    });
                    return searchPromise;
                }
            };
            $scope.convertToTableHeader = function (camelCasedText) {
                return $translate.instant(camelCasedText).replace(/[A-Z]|^[a-z]/g, function (str) {
                    return " " + str.toUpperCase() + "";
                }).trim();
            };

            $scope.getProgramAttributeValues = function (result) {
                var attributeValues = result && result.patientProgramAttributeValue && result.patientProgramAttributeValue[$scope.programAttributesSearchConfig.field];
                var commaSeparatedAttributeValues = "";
                _.each(attributeValues, function (attr) {
                    commaSeparatedAttributeValues = commaSeparatedAttributeValues + attr + ", ";
                });
                return commaSeparatedAttributeValues.substring(0, commaSeparatedAttributeValues.length - 2);
            };

            var mapExtraIdentifiers = function (data) {
                if (data !== "Searching") {
                    _.each(data.pageOfResults, function (result) {
                        result.extraIdentifiers = result.extraIdentifiers && JSON.parse(result.extraIdentifiers);
                    });
                }
            };

            var mapCustomAttributesSearchResults = function (data) {
                if (($scope.personSearchResultsConfig.fields) && data !== "Searching") {
                    _.map(data.pageOfResults, function (result) {
                        result.customAttribute = result.customAttribute && JSON.parse(result.customAttribute);
                    });
                }
            };

            var mapAddressAttributesSearchResults = function (data) {
                if (($scope.addressSearchResultsConfig.fields) && data !== "Searching") {
                    _.map(data.pageOfResults, function (result) {
                        try {
                            result.addressFieldValue = JSON.parse(result.addressFieldValue);
                        } catch (e) {
                        }
                    });
                }
            };

            var mapProgramAttributesSearchResults = function (data) {
                if (($scope.programAttributesSearchConfig.field) && data !== "Searching") {
                    _.map(data.pageOfResults, function (result) {
                        var programAttributesObj = {};
                        var arrayOfStringOfKeysValue = result.patientProgramAttributeValue && result.patientProgramAttributeValue.substring(2, result.patientProgramAttributeValue.length - 2).split('","');
                        _.each(arrayOfStringOfKeysValue, function (keyValueString) {
                            var keyValueArray = keyValueString.split('":"');
                            var key = keyValueArray[0];
                            var value = keyValueArray[1];
                            if (!_.includes(_.keys(programAttributesObj), key)) {
                                programAttributesObj[key] = [];
                                programAttributesObj[key].push(value);
                            } else {
                                programAttributesObj[key].push(value);
                            }
                        });
                        result.patientProgramAttributeValue = programAttributesObj;
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

            var setPatientIdentifierSearchConfig = function () {
                $scope.patientIdentifierSearchConfig = {};
                $scope.patientIdentifierSearchConfig.show = allSearchConfigs.searchByPatientIdentifier === undefined ? true : allSearchConfigs.searchByPatientIdentifier;
            };

            var setAddressSearchConfig = function () {
                $scope.addressSearchConfig = allSearchConfigs.address || {};
                $scope.addressSearchConfig.show = !_.isEmpty($scope.addressSearchConfig) && !_.isEmpty($scope.addressSearchConfig.field);
                if ($scope.addressSearchConfig.label && !$scope.addressSearchConfig.label) {
                    throw new Error("Search Config label is not present!");
                }
                if ($scope.addressSearchConfig.field && !$scope.addressSearchConfig.field) {
                    throw new Error("Search Config field is not present!");
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

            var sliceExtraColumns = function () {
                var orderedColumns = Object.keys(patientSearchResultConfigs);
                _.each(orderedColumns, function (column) {
                    if (patientSearchResultConfigs[column].fields && !_.isEmpty(patientSearchResultConfigs[column].fields)) {
                        patientSearchResultConfigs[column].fields = patientSearchResultConfigs[column].fields.slice(patientSearchResultConfigs[column].fields, maxAttributesFromConfig);
                        maxAttributesFromConfig -= patientSearchResultConfigs[column].fields.length;
                    }
                });
            };

            var setSearchResultsConfig = function () {
                var resultsConfigNotFound = false;
                if (_.isEmpty(patientSearchResultConfigs)) {
                    resultsConfigNotFound = true;
                    patientSearchResultConfigs.address = {"fields": allSearchConfigs.address ? [allSearchConfigs.address.field] : []};
                    patientSearchResultConfigs.personAttributes
                        = {fields: allSearchConfigs.customAttributes ? allSearchConfigs.customAttributes.fields : {}};
                } else {
                    if (!patientSearchResultConfigs.address) patientSearchResultConfigs.address = {};
                    if (!patientSearchResultConfigs.personAttributes) patientSearchResultConfigs.personAttributes = {};
                }

                if (patientSearchResultConfigs.address.fields && !_.isEmpty(patientSearchResultConfigs.address.fields)) {
                    patientSearchResultConfigs.address.fields =
                        patientSearchResultConfigs.address.fields.filter(function (item) {
                            return !_.isEmpty($scope.getAddressColumnName(item));
                        });
                }
                if (!resultsConfigNotFound) sliceExtraColumns();
                $scope.personSearchResultsConfig = patientSearchResultConfigs.personAttributes;
                $scope.addressSearchResultsConfig = patientSearchResultConfigs.address;
            };

            var initialize = function () {
                $scope.searchParameters = {};
                $scope.searchActions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.patient.search.result.action");
                setPatientIdentifierSearchConfig();
                setAddressSearchConfig();
                setCustomAttributesSearchConfig();
                setProgramAttributesSearchConfig();
                setSearchResultsConfig();
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
                showSearchResults(searchBasedOnQueryParameters(0));
            });

            $scope.searchById = function () {
                if (!isUserPrivilegedForSearch()) {
                    showInsufficientPrivMessage();
                    return;
                }
                if (!$scope.searchParameters.registrationNumber) {
                    return;
                }
                $scope.results = [];

                var patientIdentifier = $scope.searchParameters.registrationNumber;

                $location.search({
                    registrationNumber: $scope.searchParameters.registrationNumber,
                    programAttributeFieldName: $scope.programAttributesSearchConfig.field,
                    patientAttributes: $scope.customAttributesSearchConfig.fields,
                    programAttributeFieldValue: $scope.searchParameters.programAttributeFieldValue,
                    addressSearchResultsConfig: $scope.addressSearchResultsConfig.fields,
                    personSearchResultsConfig: $scope.personSearchResultsConfig.fields
                });

                var searchPromise = patientService.search(undefined, patientIdentifier, $scope.addressSearchConfig.field,
                    undefined, undefined, undefined, $scope.customAttributesSearchConfig.fields,
                    $scope.programAttributesSearchConfig.field, $scope.searchParameters.programAttributeFieldValue,
                    $scope.addressSearchResultsConfig.fields, $scope.personSearchResultsConfig.fields,
                    $scope.isExtraIdentifierConfigured())
                    .then(function (data) {
                        mapExtraIdentifiers(data);
                        mapCustomAttributesSearchResults(data);
                        mapAddressAttributesSearchResults(data);
                        mapProgramAttributesSearchResults(data);
                        if (data.pageOfResults.length === 1) {
                            var patient = data.pageOfResults[0];
                            var forwardUrl = appService.getAppDescriptor().getConfigValue("searchByIdForwardUrl") || "/patient/{{patientUuid}}";
                            $location.url(appService.getAppDescriptor().formatUrl(forwardUrl, {'patientUuid': patient.uuid}));
                        } else if (data.pageOfResults.length > 1) {
                            $scope.results = data.pageOfResults;
                            $scope.noResultsMessage = null;
                        } else {
                            $scope.patientIdentifier = {'patientIdentifier': patientIdentifier};
                            $scope.noResultsMessage = 'REGISTRATION_LABEL_COULD_NOT_FIND_PATIENT';
                        }
                    });
                spinner.forPromise(searchPromise);
            };
            var isUserPrivilegedForSearch = function () {
                var applicablePrivs = [Bahmni.Common.Constants.viewPatientsPrivilege, Bahmni.Common.Constants.editPatientsPrivilege,
                    Bahmni.Common.Constants.addVisitsPrivilege, Bahmni.Common.Constants.deleteVisitsPrivilege];
                var userPrivs = _.map($rootScope.currentUser.privileges, function (privilege) {
                    return privilege.name;
                });
                var result = _.some(userPrivs, function (privName) {
                    return _.includes(applicablePrivs, privName);
                });
                return result;
            };

            var showInsufficientPrivMessage = function () {
                var message = $translate.instant("REGISTRATION_INSUFFICIENT_PRIVILEGE");
                messagingService.showMessage('error', message);
            };

            $scope.loadingMoreResults = function () {
                return searching && !$scope.noMoreResultsPresent;
            };

            $scope.searchPatients = function () {
                if (!isUserPrivilegedForSearch()) {
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
                        angular.forEach(data.pageOfResults, function (result) {
                            $scope.results.push(result);
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
            };

            $scope.isExtraIdentifierConfigured = function () {
                return !_.isEmpty($scope.extraIdentifierTypes);
            };
        }]);
