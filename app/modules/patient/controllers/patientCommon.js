'use strict';

angular.module('registration.patientCommon', ['resources.autoCompleteService'])
    .controller('PatientCommonController', ['$scope', 'autoCompleteService',
        function ($scope, autoCompleteService) {

            $scope.setCasteAsLastName = function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient.caste = $scope.patient.familyName;
                }
            }

            $scope.getAutoCompleteList = function (key, query) {
                var result = autoCompleteService.getAutoCompleteList(key, query);
                return result;
            }

            $scope.$watch('patient.familyName', function () {
                if ($scope.patient.sameAsLastName) {
                    $scope.patient.caste = $scope.patient.familyName;
                }
            });

            $scope.$watch('patient.caste', function () {
                if ($scope.patient.sameAsLastName && ($scope.patient.familyName != $scope.patient.caste)) {
                    $scope.patient.sameAsLastName = false;
                }
            });
        }])

    .directive('nonBlank', function () {
        return function ($scope, element, attrs) {
            var addNonBlankAttrs = function () {
                element.attr({'required': 'required', "pattern": '^.*[^\\s]+.*'});
            }

            var removeNonBlankAttrs = function () {
                element.removeAttr('required').removeAttr('pattern');
            };

            if (!attrs.nonBlank) return addNonBlankAttrs(element);

            $scope.$watch(attrs.nonBlank, function (value) {
                return value ? addNonBlankAttrs() : removeNonBlankAttrs();
            });
        }
    })

    .directive('datepicker', function ($parse) {
        return function ($scope, element, attrs) {
            var ngModel = $parse(attrs.ngModel);
            $(function () {
                var today = new Date();
                element.datepicker({
                    changeYear: true,
                    changeMonth: true,
                    maxDate: today,
                    minDate: "-120y",
                    yearRange: 'c-120:c',
                    dateFormat: 'dd-mm-yy',
                    onSelect: function (dateText) {
                        $scope.$apply(function (scope) {
                            ngModel.assign(scope, dateText);
                            $scope.$eval(attrs.ngChange);
                        });
                    }
                });
            });
        }
    })

    .directive('myAutocomplete', function () {
        return function (scope, element, attrs) {
            element.autocomplete({
                autofocus: true,
                minLength: 3,
                source: function (request, response) {
                    scope.getAutoCompleteList(element[0].id, request.term).success(function (data) {
                        response(data.resultList.results)
                    });
                },
                select: function (event, ui) {
                    scope.$apply(function (scope) {
                        scope.patient[element[0].id] = ui.item.value;
                        scope.$eval(attrs.ngChange);
                    });
                    return true;
                },
                search: function (event) {
                    var searchTerm = $.trim(element.val());
                    if (searchTerm.length < 3) {
                        event.preventDefault();
                    }
                }
            });
        }
    })

    .directive('capturePhoto', function factory($parse, $window) {
        var directiveDefinitionObject = {
            templateUrl: 'modules/patient/views/photo.html',
            restrict: 'A',
            scope: true,
            compile: function compile() {
                return {
                    post: function postLink(scope, iElement, iAttrs) {
                        var activeStream,
                            dialogElement = iElement.find(".photoCaptureDialog"),
                            video = dialogElement.find("video")[0],
                            canvas = dialogElement.find("canvas")[0],
                            confirmImageButton = dialogElement.find(".confirmImage"),
                            streaming = false,
                            width = 200,
                            height = 0;

                        scope.launchPhotoCapturePopup = function () {
                            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

                            if (navigator.getUserMedia) {
                                navigator.getUserMedia(
                                    {video: true, audio: false},
                                    function (localMediaStream) {
                                        video.src = $window.URL.createObjectURL(localMediaStream);
                                        activeStream = localMediaStream;
                                        dialogElement.dialog('open');
                                    },
                                    function () {
                                        alert("Could not get access to web camera. Please allow access to web camera");
                                    }
                                );
                            } else {
                                alert('Photo capture is not supported in your browser. Please use chrome');
                            }
                        };

                        video.addEventListener('canplay', function(){
                            if (!streaming) {
                                height = video.videoHeight / (video.videoWidth/width);
                                video.setAttribute('width', width);
                                video.setAttribute('height', height);
                                canvas.setAttribute('width', width);
                                canvas.setAttribute('height', height);
                                streaming = true;
                            }
                        }, false);

                        scope.confirmImage = function () {
                            var dataURL = canvas.toDataURL("image/jpeg");
                            var image = dataURL;
                            var ngModel = $parse(iAttrs.ngModel);
                            ngModel.assign(scope, image);
                            dialogElement.dialog('close');
                        };

                        scope.clickImage = function () {
                            canvas.width = width;
                            canvas.height = height;
                            var patientImage = canvas.getContext('2d');
                            patientImage.drawImage(video, 0, 0, width, height);
                            confirmImageButton.prop('disabled', false);
                            confirmImageButton.focus();
                        };

                        dialogElement.dialog({autoOpen: false, height: 300, width: 500,
                             close: function(){
                                 if (activeStream) {
                                    activeStream.stop();
                                 }
                             }
                        });

                        iElement.bind("$destroy", function() {
                            dialogElement.dialog("destroy");
                        });
                    }
                }
            }
        };
        return directiveDefinitionObject;
    });
