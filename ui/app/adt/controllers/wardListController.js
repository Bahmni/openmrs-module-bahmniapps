'use strict';

angular.module('bahmni.adt')
    .controller('WardListController', ['$scope', 'queryService', 'spinner', '$q', '$window', '$stateParams', 'appService', '$rootScope',
        function ($scope, queryService, spinner, $q, $window, $stateParams, appService, $rootScope) {
            const enableIPDFeature = appService.getAppDescriptor().getConfigValue('enableIPDFeature');
            $scope.gotoPatientDashboard = function (patientUuid, visitUuid) {
                var options = $.extend({}, $stateParams);
                $.extend(options, { patientUuid: patientUuid, visitUuid: visitUuid || null });
                if (enableIPDFeature) {
                    $window.location = appService.getAppDescriptor().formatUrl(Bahmni.ADT.Constants.mfeIpdDashboard, options, true);
                } else {
                    $window.location = appService.getAppDescriptor().formatUrl(Bahmni.ADT.Constants.ipdDashboard, options, true);
                }
            };

            $scope.searchText = '';
            $scope.iconAttributeConfig = appService.getAppDescriptor().getConfigValue('iconAttribute') || {};
            $scope.searchTextFilter = function (row) {
                var searchText = $scope.searchText;
                if (!searchText) {
                    return true;
                }
                searchText = searchText.toLowerCase();
                const excludedKeys = ["hiddenAttributes", "$$hashKey", "Diagnosis"];
                var attributes = Object.keys(row).filter(function (key) {
                    return !excludedKeys.includes(key);
                });

                return attributes.some(function (attribute) {
                    const rowValue = row[attribute].toString();
                    return rowValue && rowValue.toLowerCase().includes(searchText);
                });
            };

            var getTableDetails = function () {
                var params = {
                    q: "emrapi.sqlGet.wardsListDetails",
                    v: "full",
                    location_name: $scope.ward.ward.name
                };

                return queryService.getResponseFromQuery(params).then(function (response) {
                    // Process response data
                    $scope.tableDetails = Bahmni.ADT.WardDetails.create(response.data, $rootScope.diagnosisStatus, $scope.iconAttributeConfig.attrName);
                    console.log("Response Data:", response.data); // Debugging

                    // Initialize tableHeadings if undefined
                    $scope.tableHeadings = $scope.tableDetails.length > 0 ? Object.keys($scope.tableDetails[0]).filter(function (name) {
                        return name !== $scope.iconAttributeConfig.attrName;
                    }) : [];

                    // Calculate Age and Add "Age" to Table
                    $scope.tableDetails.forEach(function (row) {
                        if (row.Birthdate) {
                            row.Age = calculateAge(row.Birthdate);
                        } else {
                            row.Age = "Unknown"; // Handle missing birthdates
                        }
                    });

                    // Ensure "Age" column appears in the table
                    if (!$scope.tableHeadings.includes("Age")) {
                        $scope.tableHeadings.push("Age");
                    }
                });
            };

            function calculateAge (birthdate) {
                if (!birthdate) return "Unknown";

                var birth = moment(birthdate, "YYYY-MM-DD");
                var now = moment();

                var years = now.diff(birth, 'years');
                birth.add(years, 'years');

                var months = now.diff(birth, 'months');
                birth.add(months, 'months');

                var days = now.diff(birth, 'days');

                if (years > 0) {
                    return `${years} Y ${months} M`;
                } else if (months > 0) {
                    return `${months} M ${days} D`;
                } else {
                    return `${days} D`;
                }
            }
            spinner.forPromise(getTableDetails());
        }]);
