'use strict';

angular.module('opd.patient.controllers')
    .controller('ActivePatientsListController', ['$route', '$scope', '$location', '$window', 'patientService', 'patientMapper', '$rootScope', 'appService',
        function ($route, $scope, $location, $window, patientService, patientMapper, $rootScope, appService) {

            $scope.searchTypes = [];
            var handlePatientList = function (patientList, callback) {
                resetPatientLists();
                if (patientList) {
                    $scope.storeWindowDimensions();
                    patientList.forEach(function (patient) {
                        patient.display = patient.identifier + " - " + patient.name;
                        patient.image = patientMapper.constructImageUrl(patient.identifier);
                    });
                    $scope.activePatients = patientList;
                    $scope.searchResults = $scope.activePatients;
                    $scope.visiblePatients = $scope.searchResults.slice(0, $scope.tilesToFit);
                }
                if (callback) {
                    callback();
                }
            };

            var findPatientsByHandler = function (handlerName) {
                patientService.findPatients(handlerName).success(function (data) {
                    handlePatientList(data, function () {
                        $scope.searchPatients();
                    });
                });
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

            $scope.storeWindowDimensions = function () {
                var windowWidth = window.innerWidth;
                var windowHeight = window.innerHeight;

                var tileWidth = Bahmni.Opd.Constants.patientTileWidth;
                var tileHeight = Bahmni.Opd.Constants.patientTileHeight;
                $scope.tilesToFit = Math.ceil(windowWidth * windowHeight / (tileWidth * tileHeight));
                $scope.tilesToLoad = Math.ceil($scope.tilesToFit * Bahmni.Opd.Constants.tileLoadRatio);
            };


            var matchesNameOrId = function (patient) {
                return patient.display.toLowerCase().search($scope.searchCriteria.searchParameter.toLowerCase()) !== -1;
            };

            $scope.searchPatients = function () {
                var searchList = $scope.activePatients.filter(function (patient) {
                    return matchesNameOrId(patient);
                });
                $scope.searchResults = searchList;
                if ($scope.searchResults) {
                    $scope.visiblePatients = $scope.searchResults.slice(0, $scope.tilesToFit);
                }
            };

            $scope.consultation = function (patient) {
                $window.location = "../consultation/#/visit/" + patient.activeVisitUuid;
            };

            $scope.showPatientsForType = function (sType) {
                $scope.searchCriteria.type = sType;
                findPatientsByHandler(sType.handler);
            };

            var resetPatientLists = function () {
                $scope.activePatients = [];
                $scope.searchResults = [];
                $scope.visiblePatients = [];
            };

            var initialize = function () {
                resetPatientLists();
                var appExtensions = appService.allowedAppExtensions("org.bahmni.patient.search", "config");
                var allowedSearches = [];
                appExtensions.forEach(function (appExtn) {
                    allowedSearches.push({
                        name: appExtn.label,
                        display: appExtn.extensionParams.display,
                        handler: appExtn.extensionParams.searchHandler
                    });
                });
                $scope.searchTypes = allowedSearches;
                $scope.searchCriteria = { searchParameter: '', type: $scope.searchTypes[0]};
                findPatientsByHandler($scope.searchCriteria.type.handler);
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
;

