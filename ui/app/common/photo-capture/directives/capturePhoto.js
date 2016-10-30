'use strict';

angular.module('bahmni.common.photoCapture')
    .directive('capturePhoto', ['$parse', '$window', function factory ($parse, $window) {
        var link = function (scope, iElement, iAttrs) {
            var activeStream,
                dialogElement = iElement.find(".photoCaptureDialog"),
                video = dialogElement.find("video")[0],
                canvas = dialogElement.find("canvas")[0],
                confirmImageButton = dialogElement.find(".confirmImage"),
                dialogOpen = false;
            var context = canvas.getContext("2d");
            var pixelRatio = window.devicePixelRatio;
            context.scale(pixelRatio, pixelRatio);

            scope.launchPhotoCapturePopup = function () {
                if (dialogOpen) {
                    alert("Please allow access to web camera and wait for photo capture dialog to be launched");
                    return;
                }
                dialogOpen = true;
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

            var closeDialog = function () {
                dialogElement.dialog('close');
            };

            var onConfirmationSuccess = function (image) {
                var ngModel = $parse(iAttrs.ngModel);
                ngModel.assign(scope, image);
                closeDialog();
            };

            scope.confirmImage = function () {
                var image = canvas.toDataURL("image/jpeg");
                if (iAttrs.capturePhoto) {
                    var onConfirmationPromise = scope[iAttrs.capturePhoto](image);
                    onConfirmationPromise.then(function () {
                        onConfirmationSuccess(image);
                    }, function () {
                        alert("Failed to save image. Please try again later");
                    });
                } else {
                    onConfirmationSuccess(image);
                }
            };

            scope.clickImage = function () {
                var sourceX = 0;
                var sourceY = 0;
                var destX = 0;
                var destY = 0;
                var stretchRatio, sourceWidth, sourceHeight;
                if (canvas.width > canvas.height) {
                    stretchRatio = (video.videoWidth / canvas.width);
                    sourceWidth = video.videoWidth;
                    sourceHeight = Math.floor(canvas.height * stretchRatio);
                    sourceY = Math.floor((video.videoHeight - sourceHeight) / 2);
                } else {
                    stretchRatio = (video.videoHeight / canvas.height);
                    sourceWidth = Math.floor(canvas.width * stretchRatio);
                    sourceHeight = video.videoHeight;
                    sourceX = Math.floor((video.videoWidth - sourceWidth) / 2);
                }
                var destWidth = Math.floor(canvas.width / pixelRatio);
                var destHeight = Math.floor(canvas.height / pixelRatio);
                context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
                confirmImageButton.prop('disabled', false);
                confirmImageButton.focus();
            };

            dialogElement.dialog({autoOpen: false, height: 300, width: 500, modal: true,
                close: function () {
                    dialogOpen = false;
                    if (activeStream) {
                        var activeStreamTrack = activeStream.getTracks();
                        if (activeStreamTrack) {
                            activeStreamTrack[0].stop();
                        }
                    }
                }
            });

            iElement.bind("$destroy", function () {
                dialogElement.dialog("destroy");
            });
        };

        return {
            templateUrl: '../common/photo-capture/views/photo.html',
            restrict: 'A',
            scope: true,
            link: link
        };
    }]);
