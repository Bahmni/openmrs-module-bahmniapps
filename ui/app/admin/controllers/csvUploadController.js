'use strict';

angular.module('bahmni.admin')
    .controller('CSVUploadController', ['$scope', '$rootScope', 'FileUploader', 'appService', 'adminImportService', 'spinner',
        function ($scope, $rootScope, FileUploader, appService, adminImportService, spinner) {
            var adminCSVExtension = appService.getAppDescriptor().getExtensionById("bahmni.admin.csv");
            var patientMatchingAlgorithm = adminCSVExtension.extensionParams.patientMatchingAlgorithm || "";
            var urlMap = {
                "program": Bahmni.Common.Constants.programImportUrl,
                "encounter": Bahmni.Common.Constants.encounterImportUrl,
                "concept": Bahmni.Common.Constants.conceptImportUrl,
                "conceptset": Bahmni.Common.Constants.conceptSetImportUrl,
                "patient": Bahmni.Common.Constants.patientImportUrl,
                "drug": Bahmni.Common.Constants.drugImportUrl,
                "labResults": Bahmni.Common.Constants.labResultsImportUrl,
                "referenceterms": Bahmni.Common.Constants.referenceTermsImportUrl
            };
            var fileUploaderOptions = {
                removeAfterUpload: true,
                formData: [
                    {patientMatchingAlgorithm: patientMatchingAlgorithm}
                ]
            };

            $scope.loadImportedItems = function () {
                spinner.forPromise(adminImportService.getAllStatus().then(function (response) {
                    $scope.importedItems = response.data.map(function (item) {
                        return new Bahmni.Admin.ImportedItem(item);
                    });
                }));
            };

            $scope.option = "encounter";
            $scope.uploader = new FileUploader(fileUploaderOptions);
            $scope.uploader.onBeforeUploadItem = function (item) {
                item.url = urlMap[$scope.option];
            };
            $scope.uploader.onCompleteAll = $scope.loadImportedItems;

            $scope.loadImportedItems();
        }]);