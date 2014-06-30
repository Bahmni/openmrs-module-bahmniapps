'use strict';

angular.module('bahmni.common.patientSearch')
    .controller('PatientsListController', ['$scope', '$location', '$window', 'patientService', '$rootScope', 'appService', 'spinner', '$stateParams', '$q',
        function ($scope, $location, $window, patientService, $rootScope, appService, spinner, $stateParams, $q) {

            var deferred = $q.defer();
            this.loaded = deferred.promise;

            $scope.searchTypes = [];
            $scope.searchCriteria = {searchParameter: '', type: undefined};
            $scope.noResultsMessage = null;

            var initialize = function () {
                setAllowedSearchTypes();
                setDefaultSearchType();
                spinner.forPromise(fetchPatients($scope.searchCriteria.type).then(function () {
                    deferred.resolve();
                }));
            };

            $scope.switchSearchType = function (searchType) {

                $scope.searchCriteria.searchParameter = '';
                $scope.searchCriteria.type = searchType;
                resetPatientLists();
                if (searchType.handler) {
                    return spinner.forPromise(fetchPatients(searchType));
                } else {
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                }
            };

            var updateVisiblePatients = function updateVisiblePatients() {
                $scope.visiblePatients = $scope.searchResults.slice(0, $scope.tilesToFit);
            };

            $scope.searchPatients = function () {
                if ($scope.searchCriteria.type.handler) {
                    if ($scope.searchCriteria.searchParameter == '') {
                        $scope.searchResults = $scope.activePatients;
                    } else {
                        $scope.searchResults = $scope.activePatients.filter(function (patient) {
                            return  matchesNameOrId(patient);
                        });
                    }
                } else {
                    spinner.forPromise(fetchPatientsByIdentifier($scope.searchCriteria.searchParameter)).then(function() {
                        if ($scope.activePatients.length === 0 && $scope.searchCriteria.searchParameter != '') {
                            $scope.noResultsMessage = "No results found";
                        }
                        if ($scope.activePatients.length === 1) {
                            $scope.forwardPatient($scope.activePatients[0]);
                        }
                    });
                }
                updateVisiblePatients();
                $scope.storeWindowDimensions();
            };

            var setAllowedSearchTypes = function () {
                var appExtensions = appService.getAppDescriptor().getExtensions("org.bahmni.patient.search", "config");
                var allowedSearches = [];
                appExtensions.forEach(function (appExtn) {
                    allowedSearches.push({
                        name: appExtn.label,
                        display: appExtn.extensionParams.display,
                        handler: appExtn.extensionParams.searchHandler,
                        forwardUrl: appExtn.extensionParams.forwardUrl,
                        id: appExtn.id,
                        params:appExtn.extensionParams.searchParams
                    });
                });
                $scope.searchTypes = allowedSearches;
            };

            var setDefaultSearchType = function () {
                var defaultType = $scope.searchTypes.length > 0 ? $scope.searchTypes[0] : null;
                $scope.searchCriteria = { searchParameter: '', type: defaultType};
            };

            function mapBasic(patient) {
                patient.name = getPatientDisplayName(patient);
                patient.display = patient.identifier + " - " + patient.name;
                patient.image = Bahmni.Common.Constants.patientImageUrl + patient.uuid + ".jpeg";
                return  patient;
            }

            var parametersForHandler = function(searchType) {
                var params = {
                    q:searchType.handler,
                    v:"full",
                    provider_uuid:$rootScope.currentProvider.uuid
                }
                return params;
            }

            var fetchPatients = function (searchType) {
                var params = parametersForHandler(searchType)
                return patientService.findPatients(params).then(function (response) {
                    var searchResults = response.data.map(function (patient) {
                        return mapBasic(patient);
                    });
                    updatePatientList(searchResults);
                })
            };

            var getPatientDisplayName = function (patient) {
                if (patient.hasOwnProperty("name")) {
                    return patient.name;
                } else {
                    return patient.givenName + ' ' + patient.familyName;
                }

            };

            var fetchPatientsByIdentifier = function (patientIdentifier) {
                return patientService.search(patientIdentifier).then(function (response) {
                    var searchResults = response.data.results.map(function (patient) {
                        return mapBasic(patient);
                    });
                    updatePatientList(searchResults);
                });
            };

            
            var updatePatientList = function (patientList) {
                $scope.activePatients = patientList;
                $scope.searchResults = $scope.activePatients;
                $scope.visiblePatients = $scope.searchResults.slice(0, $scope.tilesToFit);
            };

            var resetPatientLists = function () {
                $scope.activePatients = [];
                $scope.searchResults = [];
                $scope.visiblePatients = [];
            };

            $scope.loadMore = function () {
                if ($scope.visiblePatients !== undefined) {
                    var last = $scope.visiblePatients.length;
                    var more = ($scope.searchResults.length - last);
                    var toShow = (more > $scope.tilesToLoad) ? $scope.tilesToLoad : more;
                    if (toShow > 0) {
                        for (var i = 1; i <= toShow; i++) {
                            $scope.visiblePatients.push($scope.searchResults[last + i - 1]);
                        }
                    }
                }
            };

//        should this be in the directive??
            $scope.storeWindowDimensions = function () {
                var windowWidth = window.innerWidth;
                var windowHeight = window.innerHeight;

                var tileWidth = Bahmni.Common.PatientSearch.Constants.patientTileWidth;
                var tileHeight = Bahmni.Common.PatientSearch.Constants.patientTileHeight;
                $scope.tilesToFit = Math.ceil(windowWidth * windowHeight / (tileWidth * tileHeight));
                $scope.tilesToLoad = Math.ceil($scope.tilesToFit * Bahmni.Common.PatientSearch.Constants.tileLoadRatio);
            };


            var matchesNameOrId = function (patient) {
                return patient.display.toLowerCase().search($scope.searchCriteria.searchParameter.toLowerCase()) !== -1;
            };

            $scope.forwardPatient = function (patient) {
                var currentAppExtension = $scope.searchTypes.filter(function (searchType) {
                    return $scope.searchCriteria.type.id == searchType.id;
                })[0];

                var routeParameters = angular.extend({}, $stateParams);
                var options = $.extend({}, routeParameters);
                $.extend(options, {
                    patientUuid: patient.uuid,
                    visitUuid: patient.activeVisitUuid || null
                });

                $window.location = appService.getAppDescriptor().formatUrl(currentAppExtension.forwardUrl, options, true);
            };

            initialize();

        }]).directive('resize', function ($window) {
        return function (scope, element) {
            scope.storeWindowDimensions();
            angular.element($window).bind('resize', function () {
                scope.$apply(function () {
                    scope.storeWindowDimensions();
                    if (scope.searchResults !== undefined) {
                        scope.visiblePatients = scope.searchResults.slice(0, scope.tilesToFit);
                    }
                });
            });
        };
    });


