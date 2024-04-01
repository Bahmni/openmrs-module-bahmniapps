'use strict';

angular.module('bahmni.common.domain')
    .service('visitDocumentService', ['$http', 'auditLogService', 'configurations', '$q', 'messagingService', '$translate', function ($http, auditLogService, configurations, $q, messagingService, $translate) {
        var removeVoidedDocuments = function (documents) {
            documents.forEach(function (document) {
                if (document.voided && document.image) {
                    var url = Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument?filename=" + document.image;
                    $http.delete(url, {withCredentials: true});
                }
            });
        };

        this.save = function (visitDocument) {
            var url = Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument";
            var isNewVisit = !visitDocument.visitUuid;
            removeVoidedDocuments(visitDocument.documents);
            var visitTypeName = configurations.encounterConfig().getVisitTypeByUuid(visitDocument.visitTypeUuid)['name'];
            var encounterTypeName = configurations.encounterConfig().getEncounterTypeByUuid(visitDocument.encounterTypeUuid)['name'];
            return $http.post(url, visitDocument).then(function (response) {
                var promise = isNewVisit ? auditLogService.log(visitDocument.patientUuid, "OPEN_VISIT",
                    {visitUuid: response.data.visitUuid, visitType: visitTypeName}, encounterTypeName) : $q.when();
                return promise.then(function () {
                    return auditLogService.log(visitDocument.patientUuid, "EDIT_ENCOUNTER",
                        {
                            encounterUuid: response.data.encounterUuid,
                            encounterType: encounterTypeName
                        }, encounterTypeName).then(function () {
                            return response;
                        }
                    );
                });
            });
        };

        this.saveFile = function (file, patientUuid, encounterTypeName, fileName, fileType) {
            var searchStr = ";base64";
            var format = file.split(searchStr)[0].split("/")[1];
            if (fileType === "video") {
                format = _.last(_.split(fileName, "."));
            }
            var url = Bahmni.Common.Constants.RESTWS_V1 + "/bahmnicore/visitDocument/uploadDocument";
            return $http.post(url, {
                content: file.substring(file.indexOf(searchStr) + searchStr.length, file.length),
                format: format,
                patientUuid: patientUuid,
                encounterTypeName: encounterTypeName,
                fileType: fileType || "file",
                fileName: fileName.substring(0, fileName.lastIndexOf('.'))
            }, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            }).then(function (response) {
                return response;
            }, function (error) {
                if (error.status === 413) {
                    if (!isNaN(error.data.maxDocumentSizeMB)) {
                        var maxAllowedSize = roundToNearestHalf(error.data.maxDocumentSizeMB * 0.70);
                        messagingService.showMessage("error", $translate.instant("FILE_SIZE_LIMIT_EXCEEDED_MESSAGE", { maxAllowedSize: maxAllowedSize }));
                    } else {
                        messagingService.showMessage("error", $translate.instant("SIZE_LIMIT_EXCEEDED_MESSAGE"));
                    }
                }
                return $q.reject(error);
            });
        };

        var roundToNearestHalf = function (value) {
            var floorValue = Math.floor(value);
            if ((value - floorValue) < 0.5) {
                return floorValue;
            }
            return floorValue + 0.5;
        };

        this.getFileType = function (fileType) {
            var pdfType = "pdf";
            var imageType = "image";
            if (fileType.indexOf(pdfType) !== -1) {
                return pdfType;
            }
            if (fileType.indexOf(imageType) !== -1) {
                return imageType;
            }
            return "not_supported";
        };
    }]);
