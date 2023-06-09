'use strict';

angular.module('bahmni.adt')
    .controller('WardListController', ['$scope', 'queryService', 'spinner', '$q', '$window', '$stateParams', 'appService', '$rootScope',
        function ($scope, queryService, spinner, $q, $window, $stateParams, appService, $rootScope) {
            $scope.gotoPatientDashboard = function (patientUuid, visitUuid) {
                var options = $.extend({}, $stateParams);
                $.extend(options, {patientUuid: patientUuid, visitUuid: visitUuid || null});
                $window.location = appService.getAppDescriptor().formatUrl(Bahmni.ADT.Constants.ipdDashboard, options, true);
            };

            $scope.searchText = '';

            $scope.searchTextFilter = function (row) {
                var searchText = $scope.searchText;
                if (!searchText) {
                    return true;
                }
                searchText = searchText.toLowerCase();
                return (
                    (row.Bed && row.Bed.toLowerCase().includes(searchText)) ||
                    (row.Ward && row.Ward.toLowerCase().includes(searchText)) ||
                    (row.Id && row.Id.toLowerCase().includes(searchText)) ||
                    (row.Name && row.Name.toLowerCase().includes(searchText)) ||
                    (row.Age && row.Age.toString().includes(searchText)) ||
                    (row.Gender && row.Gender.toLowerCase().includes(searchText)) ||
                    (row["Admission Time"] && row["Admission Time"].toLowerCase().includes(searchText)) ||
                    (row["Disposition By"] && row["Disposition By"].toLowerCase().includes(searchText)) ||
                    (row["Disposition Time"] && row["Disposition Time"].toLowerCase().includes(searchText)) ||
                    (row["ADT Notes"] && row["ADT Notes"].toLowerCase().includes(searchText))
                );
            };
            
            var getTableDetails = function () {
                var params = {
                    q: "emrapi.sqlGet.wardsListDetails",
                    v: "full",
                    location_name: $scope.ward.ward.name
                };

                return queryService.getResponseFromQuery(params).then(function (response) {
                    $scope.tableDetails = Bahmni.ADT.WardDetails.create(response.data, $rootScope.diagnosisStatus);
                    $scope.tableHeadings = $scope.tableDetails.length > 0 ? Object.keys($scope.tableDetails[0]) : [];
                });
            };
            spinner.forPromise(getTableDetails());
        }]);
