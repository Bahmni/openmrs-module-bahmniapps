'use strict';

Bahmni.DocumentUpload.Visit = function () {
    var DocumentImage = Bahmni.Common.DocumentImage;
    this.startDatetime = "";
    this.stopDatetime = "";
    this.visitType = null;
    this.uuid = null;
    this.changed = false;
    this.files = [];
    var androidDateFormat = "YYYY-MM-DD hh:mm:ss";

    this._sortSavedFiles = function (savedFiles) {
        savedFiles.sort(function (file1, file2) {
            return file1.id - file2.id;
        });
        return savedFiles;
    };

    this.initSavedFiles = function (encounters) {
        this.files = [];
        var providerMapper = new Bahmni.Common.Domain.ProviderMapper();

        var savedFiles = this.files;
        encounters.forEach(function (encounter) {
            if (encounter.obs) {
                encounter.obs.forEach(function (observation) {
                    if (observation.groupMembers) {
                        observation.groupMembers.forEach(function (member) {
                            var conceptName = observation.concept.name.name;
                            savedFiles.push(new DocumentImage({
                                id: member.id,
                                encodedValue: Bahmni.Common.Constants.documentsPath + '/' + member.value,
                                obsUuid: observation.uuid,
                                obsDatetime: member.obsDatetime,
                                visitUuid: encounter.visit.uuid,
                                encounterUuid: encounter.uuid,
                                provider: providerMapper.map(encounter.provider),
                                concept: {uuid: observation.concept.uuid, editableName: conceptName, name: conceptName},
                                comment: member.comment
                            }));
                        });
                    }
                });
            }
        });
        this.files = this._sortSavedFiles(savedFiles);
        this.assignImageIndex();
    };

    this.assignImageIndex = function () {
        var imageIndex = this.getNoOfImages() - 1;
        this.files.map(function (file) {
            if (!(file.encodedValue.indexOf(".pdf") > 0)) {
                file.imageIndex = imageIndex;
                imageIndex--;
            }
            return file;
        });
    };

    this.getNoOfImages = function () {
        var imageFiles = _.filter(this.files, function (file) {
            return !(file.encodedValue.indexOf(".pdf") > 0);
        });
        return imageFiles.length;
    };

    this.isNew = function () {
        return this.uuid === null;
    };

    this.hasFiles = function () {
        return this.files.length > 0;
    };

    this.startDate = function () {
        if (!this.isNew()) {
            return moment(this.startDatetime).toDate();
        }
        return this.parseDate(this.startDatetime);
    };

    this.endDate = function () {
        return this.stopDatetime ? this.parseDate(this.stopDatetime) : undefined;
    };

    this.parseDate = function (date) {
        if (date instanceof Date) {
            return date;
        }
        var dateFormat = (date && date.indexOf('-') !== -1) ? androidDateFormat : Bahmni.Common.Constants.dateFormat;
        return moment(date, dateFormat).toDate();
    };

    this.addFile = function (file) {
        var savedImage = null;
        var alreadyPresent = this.files.filter(function (img) {
            return img.encodedValue === file;
        });
        if (alreadyPresent.length === 0) {
            savedImage = new DocumentImage({"encodedValue": file, "new": true});
            this.files.push(savedImage);
        }
        this.assignImageIndex();
        this.markAsUpdated();
        return savedImage;
    };

    this.markAsUpdated = function () {
        this.changed = this.files.some(function (file) { return file.changed || !file.obsUuid || file.voided; });
    };

    this.isSaved = function (file) {
        return file.obsUuid ? true : false;
    };

    this.removeFile = function (file) {
        if (this.isSaved(file)) {
            this.toggleVoidingOfFile(file);
        } else {
            this.removeNewAddedFile(file);
        }
    };

    this.removeNewAddedFile = function (file) {
        var i = this.files.indexOf(file);
        this.files.splice(i, 1);
        this.assignImageIndex();
        this.markAsUpdated();
    };

    this.toggleVoidingOfFile = function (file) {
        file.voided = !file.voided;
        this.markAsUpdated();
    };

    this.hasErrors = function () {
        var imageHasError = _.find(this.files, function (file) {
            return !file.voided && (!file.concept || !file.concept.editableName || !file.concept.uuid);
        });

        return imageHasError ? true : false;
    };

    this.hasVisitType = function () {
        return this.visitType && this.visitType.uuid ? true : false;
    };
};
