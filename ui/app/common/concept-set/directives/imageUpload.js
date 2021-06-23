'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('imageUpload', ['visitDocumentService', 'messagingService', 'spinner', '$translate', function (visitDocumentService, messagingService, spinner, $translate) {
        var link = function (scope, element) {
            element.bind("change", function () {
                var file = element[0].files[0];
                var reader = new FileReader();
                reader.onload = function (event) {
                    var image = event.target.result;
                    var fileType = scope.fileType || visitDocumentService.getFileType(file.type);
                    if (fileType !== "not_supported") {
                        spinner.forPromise(visitDocumentService.saveFile(image, scope.patientUuid, undefined, file.name, fileType).then(function (response) {
                            scope.url = response.data.url;
                            element.val(null);
                            if (fileType !== "video") {
                                scope.observation.conceptUIConfig.required = false;
                                cloneNew(scope.observation, scope.rootObservation);
                            }
                        }));
                    } else {
                        messagingService.showMessage("error", $translate.instant("FILE_TYPE_NOT_SUPPORTED_MESSAGE"));
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                    }
                };
                reader.readAsDataURL(file);
            });

            var cloneNew = function (observation, parentObservation) {
                var newObs = observation.cloneNew();
                newObs.scrollToElement = true;
                var index = parentObservation.groupMembers.indexOf(observation);
                parentObservation.groupMembers.splice(index + 1, 0, newObs);
                messagingService.showMessage("info", $translate.instant("NEW_KEY") + " " + observation.label + " " + $translate.instant("SECTION_ADDED_KEY"));
                scope.$root.$broadcast("event:addMore", newObs);
            };
        };
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                url: "=ngModel",
                patientUuid: "=",
                fileType: "=",
                observation: "=",
                rootObservation: "="
            },
            link: link
        };
    }]);
