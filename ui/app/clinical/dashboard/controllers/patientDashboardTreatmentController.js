'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$scope', '$stateParams', '$q', 'ngDialog', 'treatmentService', 'appService', 'treatmentConfig',
        function ($scope, $stateParams, $q, ngDialog, treatmentService, appService, treatmentConfig) {
            var treatmentConfigParams = $scope.dashboard.getSectionByType("treatment") || {};
            console.log('treatmentConfigParams - ', treatmentConfigParams);
            var patientUuidparams = {"patientUuid": $scope.patient.uuid};
            console.log('scope   value --- - ', $scope.patient);
            console.log('email value --- - ', $scope.patient.email);
            console.log("stateparams value-----", $stateParams);
            // console.log('treatmentServicedetail--- - ', treatmentService.getActiveDrugOrders($scope.patient.uuid,$scope.patient.date,));
            // $scope.visitTabConfig = visitConfig;
            console.log('$scope - ', $scope);
            console.log('$stateParams - ', $stateParams);
            console.log('treatmentService - ', treatmentService.getActiveDrugOrders($scope.patient.uuid, $stateParams.dateEnrolled, $stateParams.dateCompleted));
            $scope.dashboardConfig = {};
            $scope.expandedViewConfig = {};
            $scope.enableSendEmailButton = false;
            console.log('$scope.enableSendEmailButton value is..... - ', $scope.enableSendEmailButton);
            console.log("Inside controller on load enableSendEmailButton value is ..", $scope.enableSendEmailButton);
            if ($scope.patient.email != undefined) {
                console.log("inside email check..", $scope.patient.email.value);
                $scope.enableSendEmailButton = true;
            }

            // $scope.drugOrdersSection = drugOrdersSection;
            // $drugOrder = drugOrder;
            $scope.treatmentSections = treatmentService.getActiveDrugOrders($scope.patient.uuid, $stateParams.dateEnrolled, $stateParams.dateCompleted);
            console.log('$scope.treatmentSections ', $scope.treatmentSections);

            _.extend($scope.dashboardConfig, treatmentConfigParams.dashboardConfig || {}, patientUuidparams);
            _.extend($scope.expandedViewConfig, treatmentConfigParams.expandedViewConfig || {}, patientUuidparams);

            $scope.openSummaryDialog = function () {
                ngDialog.open({
                    template: 'dashboard/views/dashboardSections/treatmentSummary.html',
                    params: $scope.expandedViewConfig,
                    className: "ngdialog-theme-default ng-dialog-all-details-page",
                    scope: $scope
                });
            };
            var cleanUpListener = $scope.$on('ngDialog.closing', function () {
                $("body").removeClass('ngdialog-open');
            });

            var fetchMedicines = function () {
                var config = { "translationKey": "Treatments", "showFlowSheet": true, "showListView": true, "showOtherActive": false, "showDetailsButton": false, "showRoute": true, "showDrugForm": false, "showProvider": false, "numberOfVisits": 1 };
                console.log('config - ', config);
                var Constants = Bahmni.Clinical.Constants;
                $scope.params = config;
                var programConfig = appService.getAppDescriptor().getConfigValue("program") || {};
                var startDate = null, endDate = null, getEffectiveOrdersOnly = false;
                if (programConfig.showDetailsWithinDateRange) {
                    startDate = $stateParams.dateEnrolled;
                    endDate = $stateParams.dateCompleted;
                    if (startDate || endDate) {
                        $scope.params.showOtherActive = false;
                    }
                    getEffectiveOrdersOnly = true;
                }
                $scope.initializePrescriptions = $q.all([treatmentConfig(), treatmentService.getPrescribedAndActiveDrugOrders($scope.params.patientUuid, $scope.params.numberOfVisits,
                $scope.params.showOtherActive, $scope.params.visitUuids || [], startDate, endDate, getEffectiveOrdersOnly)])
                .then(function (results) {
                    var config = results[0];
                    var drugOrderResponse = results[1].data;
                    var createDrugOrderViewModel = function (drugOrder) {
                        return Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, config);
                    };
                    for (var key in drugOrderResponse) {
                        drugOrderResponse[key] = drugOrderResponse[key].map(createDrugOrderViewModel);
                    }
                    var groupedByVisit = _.groupBy(drugOrderResponse.visitDrugOrders, function (drugOrder) {
                        return drugOrder.visit.startDateTime;
                    });
                    var treatmentSections = [];
                    for (var key in groupedByVisit) {
                        var values = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments(groupedByVisit[key]);
                        treatmentSections.push({visitDate: key, drugOrders: values});
                    }
                    if (!_.isEmpty(drugOrderResponse[Constants.otherActiveDrugOrders])) {
                        var mergedOtherActiveDrugOrders = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments(drugOrderResponse[Constants.otherActiveDrugOrders]);
                        treatmentSections.push({
                            visitDate: Constants.otherActiveDrugOrders,
                            drugOrders: mergedOtherActiveDrugOrders
                        });
                    }
                    $scope.treatmentSections = treatmentSections;
                });
            };

            $scope.$on("$destroy", cleanUpListener);

            $scope.export = function () {
                // appService.getAppDescriptor().getConfigValue("enableSendEmailButton");
                console.log("11111 - inside export");
                fetchMedicines();
                html2canvas(document.getElementById('prescription-pdf'), {
                    onrendered: function (canvas) {
                        var data = canvas.toDataURL();
                        var docDefinition = {
                            content: [{ image: data, width: 500 }]
                        };
                        var document = pdfMake.createPdf(docDefinition).download('prescription.pdf');
                        console.log('document ', document);
                    }
                });
            };
            console.log('Exported - ', $scope.export);
        }]);
