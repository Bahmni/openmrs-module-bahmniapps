'use strict';

angular.module('registration.photoCapture', [])
    .directive('capturePhoto', function factory($parse, $window) {
        var directiveDefinitionObject = {
            templateUrl: 'modules/photo-capture/views/photo.html',
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
                            streaming = false;
                         var context = canvas.getContext("2d");
                         var pixelRatio = window.devicePixelRatio;
                         context.scale(pixelRatio, pixelRatio);

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

                        scope.confirmImage = function () {
                            var dataURL = canvas.toDataURL("image/jpeg");
                            var image = dataURL;
                            var ngModel = $parse(iAttrs.ngModel);
                            ngModel.assign(scope, image);
                            dialogElement.dialog('close');
                        };

                        video.addEventListener('canplay', function(){
                            if (!streaming) {
                                canvas.style.height = canvas.style.width = video.clientHeight + "px";
                                streaming = true;
                            }
                        }, false);

                        scope.clickImage = function () {
                            var sourceX = 0;
                            var sourceY = 0;
                            var destX = 0;
                            var destY = 0;

                            if (canvas.width > canvas.height) {
                                var stretchRatio = ( video.videoWidth / canvas.width );
                                var sourceWidth = video.videoWidth;
                                var sourceHeight = Math.floor(canvas.height * stretchRatio);
                                sourceY = Math.floor((video.videoHeight - sourceHeight)/2);
                            } else {
                                var stretchRatio = ( video.videoHeight / canvas.height );
                                var sourceWidth = Math.floor(canvas.width * stretchRatio);
                                var sourceHeight = video.videoHeight;
                                sourceX = Math.floor((video.videoWidth - sourceWidth)/2);
                            }
                            var destWidth = Math.floor(canvas.width / pixelRatio);
                            var destHeight = Math.floor(canvas.height / pixelRatio);

                            context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
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
