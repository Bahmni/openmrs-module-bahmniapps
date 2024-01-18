'use strict';

angular.module('bahmni.admin')
    .controller('FHIRExportController', ['$rootScope', '$scope', '$q', '$http', '$translate', 'messagingService', 'fhirExportService', function ($rootScope, $scope, $q, $http, $translate, messagingService, fhirExportService) {
        var DateUtil = Bahmni.Common.Util.DateUtil;

        var convertToLocalDate = function (date) {
            var localDate = DateUtil.parseLongDateToServerFormat(date);
            return DateUtil.getDateTimeInSpecifiedFormat(localDate, 'MMMM Do, YYYY [at] h:mm:ss A');
        };

        var subtractDaysFromToday = function (minusDays) {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() - minusDays);
            return currentDate;
        };

        $scope.startDate = subtractDaysFromToday(30);
        $scope.endDate = subtractDaysFromToday(0);

        $scope.anonymise = true;

        var isLoggedInUserPrivileged = function (expectedPrivileges) {
            var currentPrivileges = _.map($rootScope.currentUser.privileges, function (privilege) {
                return privilege.name;
            });
            var hasPrivilege = expectedPrivileges.some(function (privilege) {
                return currentPrivileges.indexOf(privilege) !== -1;
            });
            return hasPrivilege;
        };

        var hasInsufficientPrivilegeForPlainExport = function () {
            var plainExportPrivileges = [Bahmni.Common.Constants.plainFhirExportPrivilege];
            var hasPlainExportPrivilege = isLoggedInUserPrivileged(plainExportPrivileges);
            return !hasPlainExportPrivilege;
        };
        $scope.isCheckboxDisabled = hasInsufficientPrivilegeForPlainExport();

        var isUserPrivilegedForFhirExport = function () {
            var defaultExportPrivileges = [Bahmni.Common.Constants.fhirExportPrivilege, Bahmni.Common.Constants.plainFhirExportPrivilege];
            return isLoggedInUserPrivileged(defaultExportPrivileges);
        };
        $scope.hasExportPrivileges = isUserPrivilegedForFhirExport();

        $scope.loadFhirTasksForPrivilegedUsers = function () {
            var deferred = $q.defer();
            $scope.tasks = [];
            if (isUserPrivilegedForFhirExport()) {
                fhirExportService.getUuidForAnonymiseConcept().then(function (response) {
                    $scope.uuid = response && response.data && response.data.results && response.data.results[0] && response.data.results[0].uuid || null;
                });
                fhirExportService.loadFhirTasks().then(function (response) {
                    if (response.data && response.data.entry) {
                        var fhirExportTasks = response.data.entry.filter(function (task) {
                            return task.resource.basedOn && task.resource.basedOn.some(function (basedOn) {
                                return basedOn.reference === $scope.uuid;
                            });
                        });
                        $scope.tasks = fhirExportTasks.map(function (task) {
                            task.resource.authoredOn = convertToLocalDate(task.resource.authoredOn);
                            return task;
                        });
                        deferred.resolve();
                    }
                }).catch(function (error) {
                    deferred.reject(error);
                });
            }
            return deferred.promise;
        };

        $scope.loadFhirTasksForPrivilegedUsers();

        $scope.exportFhirData = function () {
            var deferred = $q.defer();
            var startDate = DateUtil.getDateWithoutTime($scope.startDate);
            var endDate = DateUtil.getDateWithoutTime($scope.endDate);
            var anonymise = $scope.anonymise;
            var username = $rootScope.currentUser.username;

            fhirExportService.export(username, startDate, endDate, anonymise).success(function () {
                fhirExportService.submitAudit(username, startDate, endDate, anonymise).success(function () {
                    messagingService.showMessage("info", $translate.instant("EXPORT_PATIENT_REQUEST_SUBMITTED"));
                    $scope.loadFhirTasksForPrivilegedUsers();
                    deferred.resolve();
                });
            }).catch(function (error) {
                messagingService.showMessage("error", $translate.instant("EXPORT_PATIENT_REQUEST_SUBMIT_ERROR"));
                console.error("FHIR Export request failed");
                deferred.reject(error);
            });
            return deferred.promise;
        };

        $scope.extractAttribute = function (array, searchValue, attributeToExtract) {
            var foundElement = array && array.find(function (inputElement) { return inputElement.type.text === searchValue; });
            if (foundElement && foundElement.hasOwnProperty(attributeToExtract)) {
                return foundElement[attributeToExtract];
            }
            return null;
        };

        $scope.extractBoolean = function (array, searchValue, attributeToExtract) {
            var booleanStr = $scope.extractAttribute(array, searchValue, attributeToExtract);
            return booleanStr && booleanStr.toLowerCase() === "true";
        };
    }]);
