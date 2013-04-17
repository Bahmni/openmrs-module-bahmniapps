'use strict';

angular.module('registration.photoCapture', [])
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
