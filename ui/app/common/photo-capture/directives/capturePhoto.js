'use strict';

angular.module('bahmni.common.photoCapture')
    .directive('capturePhoto', ['appService', '$parse', '$window', '$translate', function factory (appService, $parse, $window, $translate) {
        var link = function (scope, iElement, iAttrs) {
            var captureDialogElement = iElement.find(".photoCaptureDialog"),
                captureVideo = captureDialogElement.find("video")[0],
                captureActiveStream,
                captureCanvas = captureDialogElement.find("canvas")[0],
                captureContext = captureCanvas.getContext("2d"),
                captureConfirmImageButton = captureDialogElement.find(".confirmImage"),
                uploadDialogElement = iElement.find(".photoUploadDialog"),
                uploadCanvas = uploadDialogElement.find("canvas")[0],
                uploadContext = uploadCanvas.getContext("2d"),
                uploadConfirmImageButton = uploadDialogElement.find(".confirmImage"),
                uploadField = iElement.find(".fileUpload")[0],
                dialogOpen = false,
                pixelRatio = window.devicePixelRatio,
                imageUploadSize = appService.getAppDescriptor().getConfigValue("imageUploadSize") || Bahmni.Common.Constants.defaultImageUploadSize;
            if (imageUploadSize > Bahmni.Common.Constants.maxImageUploadSize) {
                imageUploadSize = Bahmni.Common.Constants.maxImageUploadSize;
            }
            captureContext.scale(pixelRatio, pixelRatio);
            uploadContext.scale(pixelRatio, pixelRatio);

            var confirmImage = function (canvas, dialogElement) {
                var image = canvas.toDataURL("image/jpeg");
                var onConfirmationSuccess = function (image) {
                    var ngModel = $parse(iAttrs.ngModel);
                    ngModel.assign(scope, image);
                    dialogElement.dialog('close');
                };
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

            var drawImage = function (canvas, context, image, imageWidth, imageHeight) {
                var sourceX = 0;
                var sourceY = 0;
                var destX = 0;
                var destY = 0;
                var stretchRatio, sourceWidth, sourceHeight;
                if (canvas.width > canvas.height) {
                    stretchRatio = (imageWidth / canvas.width);
                    sourceWidth = imageWidth;
                    sourceHeight = Math.floor(canvas.height * stretchRatio);
                    sourceY = Math.floor((imageHeight - sourceHeight) / 2);
                } else {
                    stretchRatio = (imageHeight / canvas.height);
                    sourceWidth = Math.floor(canvas.width * stretchRatio);
                    sourceHeight = imageHeight;
                    sourceX = Math.floor((imageWidth - sourceWidth) / 2);
                }
                var destWidth = Math.floor(canvas.width / pixelRatio);
                var destHeight = Math.floor(canvas.height / pixelRatio);
                context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
            };

            scope.launchPhotoCapturePopup = function () {
                if (dialogOpen) {
                    alert("Please allow access to web camera and wait for photo capture dialog to be launched");
                    return;
                }
                dialogOpen = true;
                var navigatorUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                if (navigator.mediaDevices) {
                    navigator.mediaDevices.getUserMedia({video: true, audio: false})
                        .then(function (localMediaStream) {
                            captureVideo.srcObject = localMediaStream;
                            captureActiveStream = localMediaStream;
                            captureDialogElement.dialog('open');
                        }).catch(function (e) {
                            alert("Could not get access to web camera. Please allow access to web camera");
                        });
                } else if (navigatorUserMedia) {
                    navigatorUserMedia(
                        {video: true, audio: false},
                        function (localMediaStream) {
                            captureVideo.src = $window.URL.createObjectURL(localMediaStream);
                            captureActiveStream = localMediaStream;
                            captureDialogElement.dialog('open');
                        },
                        function () {
                            alert("Could not get access to web camera. Please allow access to web camera");
                        }
                    );
                } else {
                    alert('Photo capture is not supported in your browser. Please use chrome');
                }
            };

            scope.captureConfirmImage = function () {
                confirmImage(captureCanvas, captureDialogElement);
            };

            scope.captureClickImage = function () {
                drawImage(captureCanvas, captureContext, captureVideo, captureVideo.videoWidth, captureVideo.videoHeight);
                captureConfirmImageButton.prop('disabled', false);
                captureConfirmImageButton.focus();
            };

            captureDialogElement.dialog({
                autoOpen: false, height: 300, width: 500, modal: true, dialogClass: 'photo-capture-dialog',
                close: function () {
                    dialogOpen = false;
                    if (captureActiveStream) {
                        var captureActiveStreamTrack = captureActiveStream.getTracks();
                        if (captureActiveStreamTrack) {
                            captureActiveStreamTrack[0].stop();
                        }
                    }
                }
            });

            scope.uploadConfirmImage = function () {
                confirmImage(uploadCanvas, uploadDialogElement);
            };

            scope.launchPhotoUploadPopup = function () {
                if (dialogOpen) {
                    alert("Please wait for photo upload dialog to be launched");
                    return;
                }
                dialogOpen = true;
                uploadDialogElement.dialog('open');
            };

            scope.uploadImage = function () {
                if (this.files && this.files[0] && this.files[0].type) {
                    var fileType = this.files[0].type;
                    if (!fileType.startsWith('image/')) {
                        uploadConfirmImageButton.prop('disabled', true);
                        alert($translate.instant("FILE_UPLOAD_MUST_BE_IMAGE"));
                        return;
                    }
                } else {
                    uploadConfirmImageButton.prop('disabled', true);
                    alert($translate.instant("FILE_UPLOAD_MUST_BE_IMAGE"));
                    uploadContext.clearRect(0, 0, uploadCanvas.width, uploadCanvas.height);
                    return;
                }
                if (this.files[0] && this.files[0].size <= imageUploadSize) {
                    var fileReader = new FileReader();
                    fileReader.onload = function (e) {
                        var image = new Image();
                        image.onload = function () {
                            drawImage(uploadCanvas, uploadContext, image, image.width, image.height);
                        };
                        image.src = e.target.result;
                    };
                    fileReader.readAsDataURL(this.files[0]);
                    uploadConfirmImageButton.prop('disabled', false);
                    uploadConfirmImageButton.focus();
                } else {
                    uploadConfirmImageButton.prop('disabled', true);
                    var imageUploadSizeInKb = imageUploadSize / 1000;
                    var displayMessage = '';
                    if (imageUploadSizeInKb >= 1000) {
                        displayMessage = Math.floor(imageUploadSizeInKb / 1000) + "MB";
                    } else {
                        displayMessage = Math.floor(imageUploadSizeInKb) + "KB";
                    }
                    alert($translate.instant("FILE_UPLOAD_MUST_BE_LESS_THAN") + ' ' + displayMessage);
                    uploadField.value = "";
                    uploadContext.clearRect(0, 0, uploadCanvas.width, uploadCanvas.height);
                }
            };

            uploadDialogElement.dialog({
                autoOpen: false, height: 350, width: 350, modal: true, dialogClass: 'photo-upload-dialog',
                close: function () {
                    dialogOpen = false;
                }
            });

            iElement.bind("$destroy", function () {
                captureDialogElement.dialog("destroy");
                uploadDialogElement.dialog("destroy");
            });

            uploadField.addEventListener("change", scope.uploadImage, false);
        };

        return {
            templateUrl: '../common/photo-capture/views/photo.html',
            restrict: 'A',
            scope: true,
            link: link
        };
    }]);
