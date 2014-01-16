'use strict';

angular.module('opd.document')
    .controller('DocumentController', ['$scope', 'visitService', 'spinner', 'visitDocumentService','$rootScope',
        function ($scope, visitService, spinner, visitDocumentService, $rootScope) {
            $scope.visitTypes = [];
            var init = function () {
                return visitService.getVisitType().then(function (response) {
                    $scope.visitTypes = response.data.results;
                });
            };
            spinner.forPromise(init());
            $scope.images = [];

            var parseDate = function (dateString) {
                return moment(moment(dateString, Bahmni.Common.Constants.dateFormat.toUpperCase()).toDate()).format("YYYY-MM-DDTHH:mm:ss");
            }

            $scope.save = function () {
                if($scope.images.length == 0) {
                    $rootScope.server_error = "0 documents to upload";
                    return;
                }
                var visitDocument = {};
                visitDocument.patientUuid = $scope.patient.uuid;
                visitDocument.visitTypeUuid = $scope.visitType.uuid;
                visitDocument.visitStartDate = parseDate($scope.startDate);
                visitDocument.visitEndDate = $scope.endDate ? parseDate($scope.endDate) : visitDocument.visitStartDate;
                visitDocument.encounterTypeUuid = $scope.encounterConfig.getRadiologyEncounterTypeUuid();
                visitDocument.encounterDateTime = visitDocument.visitStartDate;
                visitDocument.documents = [];
                $scope.images.forEach(function (image) {
                    visitDocument.documents.push({testUuid: "f14f2f84-699a-11e3-af88-005056821db0", image: image.replace(/data:image\/.*;base64/, "")})
                })
                visitDocumentService.save(visitDocument).success(function () {
                    $scope.success = true;
                });
            }
        }])
    .directive('fileUpload', function () {
        return{
            restrict: 'A',
            link: function (scope, element) {
                element.bind("change", function () {
                    var file = element[0].files[0],
                        reader = new FileReader();
                    reader.onload = function (event) {
                        var image = event.target.result;
                        var alreadyPresent = scope.images.filter(function (img) {
                            return img === image;
                        })
                        if (alreadyPresent.length == 0) {
                            scope.images.push(image);
                            scope.$apply();
                        }
                    };
                    reader.readAsDataURL(file);
                });
            }
        }
    });