'use strict';

angular.module('opd.document')
    .controller('DocumentController', ['$scope', 'visitService', 'spinner', 'visitDocumentService',
        function ($scope, visitService, spinner, visitDocumentService) {
            $scope.visitTypes = [];
            var init = function () {
                return visitService.getVisitType().then(function (response) {
                    $scope.visitTypes = response.data.results;
                });
            };
            spinner.forPromise(init());
            $scope.images = [];

            var parseDate = function (dateString) {
                return moment(dateString, Bahmni.Common.Constants.dateFormat.toUpperCase()).toDate();
            }

            $scope.save = function () {
                var visitDocument = {};
                visitDocument.patientUuid = $scope.patient.uuid;
                visitDocument.visitTypeUuid = $scope.visitType.uuid;
                visitDocument.visitStartDate = parseDate($scope.startDate);
                visitDocument.visitEndDate = $scope.endDate ? parseDate($scope.endDate) : visitDocument.visitStartDate;
                visitDocument.encounterTypeUuid = $scope.encounterConfig.getOpdConsultationEncounterTypeUuid();
                visitDocument.encounterDateTime = visitDocument.visitStartDate;
                visitDocument.documents = [
                    {testUuid: "f14f2f84-699a-11e3-af88-005056821db0", image: $scope.images[0].replace("data:image/jpeg;base64", "")}
                ];
                visitDocumentService.save(visitDocument);
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
                        scope.images.push(event.target.result);
                        scope.$apply();
                    };
                    reader.readAsDataURL(file);
                });
            }
        }
    });
