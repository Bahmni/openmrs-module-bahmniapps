'use strict';

angular.module('bahmni.admin')
    .controller('CSVUploadController', ['$scope', '$rootScope', 'FileUploader', 'appService', 'adminImportService', 'spinner',
        function ($scope, $rootScope, FileUploader, appService, adminImportService, spinner) {
            var adminCSVExtension = appService.getAppDescriptor().getExtensionById("bahmni.admin.csv");
            var patientMatchingAlgorithm = adminCSVExtension.extensionParams.patientMatchingAlgorithm || "";
            var fileUploaderOptions = {
                url: Bahmni.Common.Constants.encounterImportUrl,
                removeAfterUpload: true,
                formData: [
                    {patientMatchingAlgorithm: patientMatchingAlgorithm}
                ]
            };

            $scope.loadImportedItems = function() {
                spinner.forPromise(adminImportService.getAllStatus().then(function(response){
                    $scope.importedItems = response.data.map(function(item) { return new Bahmni.Admin.ImportedItem(item); });
                }));
            }

            $scope.uploader = new FileUploader(fileUploaderOptions);
            $scope.uploader.onCompleteAll = $scope.loadImportedItems;
            $scope.loadImportedItems();
        }]);