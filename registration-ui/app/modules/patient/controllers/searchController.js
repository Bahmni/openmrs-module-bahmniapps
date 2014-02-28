'use strict';

angular.module('registration.patient.controllers')
    .controller('SearchPatientController', ['$rootScope', '$scope', '$route', '$location', '$window', 'spinner', 'loader', 'patientService', 'appService', 'Preferences', function ($rootScope, $scope, $route, $location, $window, spinner, loader, patientService, appService, preferences) {
        $scope.identifierSources = $rootScope.patientConfiguration.identifierSources;
        $scope.results = [];

        var searchBasedOnQueryParameters = function(offset) {
            $scope.village = $location.search().village || '';
            $scope.name = $location.search().name || '';
            var identifierPrefix = $location.search().identifierPrefix;
            if (!identifierPrefix || identifierPrefix.length === 0) {
                identifierPrefix = preferences.identifierPrefix;
            }
            $scope.identifierSources.forEach(function(identifierSource) {
                if (identifierPrefix === identifierSource.prefix) {
                    $scope.identifierPrefix = identifierSource;
                }
            });
            $scope.identifierPrefix = $scope.identifierPrefix ||  $scope.identifierSources[0];

            $scope.registrationNumber = $location.search().registrationNumber || "";
            if ($scope.name.trim().length > 0 || $scope.village.trim().length > 0) {
                var searchPromise = patientService.search($scope.name, $scope.village, offset);
                loader.forPromise(searchPromise);
                return searchPromise;
            }
        };

        var showSearchResults = function(searchPromise) {
            $scope.noMoreResultsPresent = false;
            if(searchPromise) {
                searchPromise.success(function(data) {
                    $scope.results = data.results;
                    $scope.noResultsMessage = $scope.results.length == 0 ?  "No results found" : null;
                });
            }
        };

        var initialize = function() {
            $scope.searchActions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.patient.search.result.action");
        };

        var identifyParams = function (querystring) {
            querystring = querystring.substring(querystring.indexOf('?')+1).split('&');
            var params = {}, pair, d = decodeURIComponent;
            for (var i = querystring.length - 1; i >= 0; i--) {
                pair = querystring[i].split('=');
                params[d(pair[0])] = d(pair[1]);
            }
            return params;
        };

        initialize();

        $scope.$watch(function(){ return $location.search(); }, function() { showSearchResults(searchBasedOnQueryParameters(0))} );

        $scope.searchById = function () {
            if(!$scope.registrationNumber) return;
            $scope.results = [];
            var patientIdentifier = $scope.identifierPrefix.prefix + $scope.registrationNumber;
            preferences.identifierPrefix = $scope.identifierPrefix.prefix;
            $location.search({identifierPrefix: $scope.identifierPrefix.prefix, registrationNumber: $scope.registrationNumber});
            spinner.show();
            var searchPromise = patientService.search(patientIdentifier).success(function (data) {
                if (data.results.length == 1) {
                    var patient = data.results[0];
                    var forwardUrl = appService.getAppDescriptor().getConfigValue("searchByIdForwardUrl") || "/patient/{{patientUuid}}";
                    $location.url(appService.getAppDescriptor().formatUrl(forwardUrl, {'patientUuid': patient.uuid} ));
                } else if(data.results.length > 1) {
                    spinner.hide();
                    $scope.results = data.results;
                } else {
                    spinner.hide();
                    $scope.noResultsMessage = "Could not find patient with identifier " + patientIdentifier + ". Please verify the patient ID entered or create a new patient record with this ID."
                }
            }).error(spinner.hide);
        };

        $scope.searchByVillageAndName = function () {
            var queryParams = {};
            if($scope.name){
                queryParams.name = $scope.name;
            }
            if ($scope.village) {
                queryParams.village = $scope.village;
            }
            $location.search(queryParams);
        };

        $scope.resultsPresent = function () {
            return angular.isDefined($scope.results) && $scope.results.length > 0;
        };

        $scope.editPatientUrl = function (url, options) {
            var temp = url;
            for (var key in options) {
                temp = temp.replace("{{"+key+"}}", options[key]);
            }
            return temp;
        };

        $scope.nextPage =  function() {
            if ($scope.nextPageLoading) {
                return;
            }
            $scope.nextPageLoading = true;
            var promise = searchBasedOnQueryParameters($scope.results.length);
            if(promise) {
                promise.success(function(data) {
                    data.results.forEach(function(result) {$scope.results.push(result)});
                    $scope.noMoreResultsPresent = (data.results.length == 0 ? true : false);
                    $scope.nextPageLoading = false;
                });
                promise.error(function(data) {
                    $scope.nextPageLoading = false;
                });
            }
        };

        $scope.forPatient = function(patient){
            $scope.selectedPatient = patient;
            patientService.rememberPatient(patient);
            return $scope;
        }

        $scope.doExtensionAction = function(extension) {
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
            } else{
                $location.url(forwardTo);
            }
        };

        $scope.extensionActionText = function(extension) {
            return extension.label;
        }

        $scope.printLayout = function () {
            return $route.routes['/printPatient'].templateUrl;
        };
    }]);
