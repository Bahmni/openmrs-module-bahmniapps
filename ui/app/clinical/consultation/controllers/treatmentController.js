'use strict';

angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', 'clinicalAppConfigService', 'treatmentConfig', '$stateParams', 'appService',
        function ($scope, clinicalAppConfigService, treatmentConfig, $stateParams, appService) {
            $scope.enableNepaliCalendar = appService.getAppDescriptor().getConfigValue('enableNepaliCalendar');
            $scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue('displayNepaliDates');
            $scope.npToday = Bahmni.Common.Util.DateUtil.npToday();

            var init = function () {
                var drugOrderHistoryConfig = treatmentConfig.drugOrderHistoryConfig || {};
                $scope.drugOrderHistoryView = drugOrderHistoryConfig.view || 'default';
                $scope.tabConfigName = $stateParams.tabConfigName || 'default';

                var initializeTreatments = function () {
                    $scope.consultation.newlyAddedTabTreatments = $scope.consultation.newlyAddedTabTreatments || {};
                    $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName] = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName] || {
                        treatments: [],
                        orderSetTreatments: [],
                        newOrderSet: {}
                    };
                    $scope.treatments = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].treatments;
                    $scope.orderSetTreatments = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].orderSetTreatments;
                    $scope.newOrderSet = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].newOrderSet;
                };

                $scope.$watch('consultation.newlyAddedTabTreatments', initializeTreatments);

                $scope.enrollment = $stateParams.enrollment;
                $scope.treatmentConfig = treatmentConfig;
            };

            $scope.handleDateUpdate = function (treatment) {
                var treatmentStartDate = treatment.effectiveStartDate;
                treatment.effectiveStartDateNepali = convertAdToBs(treatmentStartDate);
            };

            $scope.handleOrderSetDateUpdate = function (newOrderSet) {
                var orderSetDate = newOrderSet.date;
                newOrderSet.nepaliDate = convertAdToBs(orderSetDate);
            };

            $scope.handleNepaliDateUpdate = function (treatment) {
                var nepaliDate = treatment.effectiveStartDateNepali;
                treatment.effectiveStartDate = convertBsToAd(nepaliDate);
            };

            $scope.handleOrderSetNepaliDateUpdate = function (newOrderSet) {
                var nepaliDate = newOrderSet.nepaliDate;
                newOrderSet.date = convertBsToAd(nepaliDate);
            };

            var convertBsToAd = function (nepaliDate) {
                if (nepaliDate) {
                    var dateStr = nepaliDate.split("-");
                    var dateAD = calendarFunctions.getAdDateByBsDate(calendarFunctions.getNumberByNepaliNumber(dateStr[0]), calendarFunctions.getNumberByNepaliNumber(dateStr[1]), calendarFunctions.getNumberByNepaliNumber(dateStr[2]));
                    var date = new Date(dateAD);
                    return date;
                }
                return '';
            };

            var convertAdToBs = function (date) {
                if (date) {
                    var nepaliDate = calendarFunctions.getBsDateByAdDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
                    return calendarFunctions.bsDateFormat("%y-%m-%d", nepaliDate.bsYear, nepaliDate.bsMonth, nepaliDate.bsDate);
                }
                return '';
            };

            init();
        }
    ]);
