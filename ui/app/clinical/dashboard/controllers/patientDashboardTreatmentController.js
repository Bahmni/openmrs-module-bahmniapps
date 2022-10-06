'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$scope', 'ngDialog',
        function ($scope, ngDialog) {
            var treatmentConfigParams = $scope.dashboard.getSectionByType("treatment") || {};
            console.log('treatmentConfigParams - ', treatmentConfigParams);
            var patientUuidparams = {"patientUuid": $scope.patient.uuid};

            // $scope.visitTabConfig = visitConfig;
            $scope.dashboardConfig = {};
            $scope.expandedViewConfig = {};
            // $scope.drugOrdersSection = drugOrdersSection;
            // $drugOrder = drugOrder;

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

            $scope.$on("$destroy", cleanUpListener);

            $scope.export = function () {
                console.log("11111 - inside export");
                html2canvas(document.getElementById('prescription-pdf'), {
                    onrendered: function (canvas) {
                        var data = canvas.toDataURL();
                        var docDefinition = {
                            content: [{ image: data, width: 500 }]
                        };
                        var document = pdfMake.createPdf(docDefinition).getStream();
                        console.log('document ', document);
                    }
                });
            };
            console.log('Exported - ', $scope.export);
        }]);
