'use strict';

angular.module('bahmni.ipd')
    .controller('RoomController', ['$scope', '$rootScope', '$state', '$translate', 'appService', 'printer',
        function ($scope, $rootScope, $state, $translate, appService, printer) {
            var init = function () {
                $scope.defaultTags = ['AVAILABLE', 'OCCUPIED'];
                var appDescriptor = appService.getAppDescriptor();
                $rootScope.bedTagsColorConfig = appDescriptor.getConfigValue("colorForTags") || [];
                $rootScope.currentView = $rootScope.currentView || "Grid";
                $scope.showPrintIcon = appDescriptor.getConfigValue("wardListPrintEnabled") || false;
                $scope.currentView = $rootScope.currentView;

                if ($rootScope.bedDetails) {
                    $scope.oldBedNumber = $rootScope.bedDetails.bedNumber;
                    _.some($scope.room.beds, function (row) {
                        var selectedBed = _.filter(row, function (bed) {
                            return bed.bed.bedId === $rootScope.bedDetails.bedId;
                        });
                        if (selectedBed.length) {
                            $scope.selectedBed = selectedBed[0].bed;
                            return true;
                        }
                    });
                    $rootScope.selectedBedInfo.bed = $scope.selectedBed;
                    if ($state.current.name !== "bedManagement.patient") {
                        $scope.oldBedNumber = undefined;
                    }
                }
            };

            $scope.toggleWardView = function () {
                $rootScope.currentView = ($rootScope.currentView === "Grid") ? "List" : "Grid";
                $scope.currentView = $rootScope.currentView;
            };

            $scope.printWardList = function () {
                var printTemplateUrl = appService.getAppDescriptor()
                  .getConfigValue('wardListPrintViewTemplateUrl') || 'views/wardListPrint.html';
                var configuredTableHeader = appService.getAppDescriptor()
                  .getConfigValue('wardListPrintAttributes');
                if (configuredTableHeader && configuredTableHeader.length > 0) {
                    $scope.tableHeader = configuredTableHeader;
                }
                printer.print(printTemplateUrl, {
                    wardName: $scope.room.name,
                    date: moment().format('DD-MMM-YYYY'),
                    totalBeds: $scope.room.totalBeds,
                    occupiedBeds: $scope.room.totalBeds - $scope.room.availableBeds,
                    tableData: $scope.tableData,
                    tableHeader: $scope.tableHeader,
                    isEmptyRow: $scope.isEmptyRow
                });
            };

            $scope.isEmptyRow = function (row) {
                for (var i = 0; i < $scope.tableHeader.length; i++) {
                    var header = $scope.tableHeader[i];
                    if (row[header]) {
                        return false;
                    }
                }
                return true;
            };

            $scope.$on("event:getTableData", function (event, data) {
                $scope.tableData = data.tableData;
                $scope.tableHeader = data.tableHeader;
            });

            $scope.getTagName = function (tag) {
                if (tag === 'AVAILABLE') {
                    return $translate.instant("KEY_AVAILABLE");
                }
                else if (tag === 'OCCUPIED') {
                    return $translate.instant("KEY_OCCUPIED");
                }
            };

            init();
        }]);
