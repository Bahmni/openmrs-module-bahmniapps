'use strict';

angular.module('bahmni.admin')
    .controller('CSVUploadController', ['$scope', 'FileUploader', 'appService', 'adminImportService', 'spinner',
        function ($scope, FileUploader, appService, adminImportService, spinner) {
            var adminCSVExtension = appService.getAppDescriptor().getExtensionById("bahmni.admin.csv");
            var patientMatchingAlgorithm = adminCSVExtension.extensionParams.patientMatchingAlgorithm || "";
            var urlMap = {
                "concept": {name: "Concept", url: Bahmni.Common.Constants.conceptImportUrl},
                "conceptset": {name: "Concept Set", url: Bahmni.Common.Constants.conceptSetImportUrl},
                "program": {name: "Program", url: Bahmni.Common.Constants.programImportUrl},
                "patient": {name: "Patient", url: Bahmni.Common.Constants.patientImportUrl},
                "encounter": {name: "Encounter", url: Bahmni.Common.Constants.encounterImportUrl},
                "form2encounter": {name: "Form2 Encounter (With Validations)", url: Bahmni.Common.Constants.form2encounterImportUrl},
                "drug": {name: "Drug", url: Bahmni.Common.Constants.drugImportUrl},
                "labResults": {name: "Lab Results", url: Bahmni.Common.Constants.labResultsImportUrl},
                "referenceterms": {name: "Reference Terms", url: Bahmni.Common.Constants.referenceTermsImportUrl},
                "updateReferenceTerms": {
                    name: "Add new Reference Terms to Existing Concepts",
                    url: Bahmni.Common.Constants.updateReferenceTermsImportUrl
                },
                "relationship": {name: "Relationship Information", url: Bahmni.Common.Constants.relationshipImportUrl}
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
            var init = function () {
                var configUrlMap = adminCSVExtension.urlMap;
                if (!_.isEmpty(configUrlMap)) {
                    urlMap = configUrlMap;
                }
                $scope.urlMaps = urlMap;
            };
            $scope.option = {selected: "encounter"};
            $scope.uploader = new FileUploader(fileUploaderOptions);
            $scope.uploader.onBeforeUploadItem = function (item) {
                item.url = urlMap[$scope.option.selected].url;
            };
            $scope.uploader.onCompleteAll = $scope.loadImportedItems;
            $scope.loadImportedItems();
            init();
        }]);
