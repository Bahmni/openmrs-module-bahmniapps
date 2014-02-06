Bahmni.Opd.DocumentUpload.Visit = function () {

    this.startDatetime = "";
    this.stopDatetime = "";
    this.visitType = null;
    this.changed = false;
    this.savedImages = [];
    this.images = [];
    this.encounters = [];

    this.initSavedImages = function () {
        this.savedImages = [];
        this.images = [];

        var savedImages = this.savedImages;
        this.encounters.forEach(function (encounter) {
            encounter.obs && encounter.obs.forEach(function (observation) {
                observation.groupMembers && observation.groupMembers.forEach(function (member) {
                    if (member.concept.name.name == 'Document') {
                        savedImages.push({"encodedValue": member.value, "obsUuid": observation.uuid, concept: {uuid: observation.concept.uuid, name: observation.concept.name.name}});
                    }
                });
            });
        });
    };

    this.isNew = function () {
        return this.uuid == null;
    };

    this.startDate = function () {
        return this.parseDate(this.startDatetime);
    };
    this.endDate = function () {
        return this.stopDatetime ? this.parseDate(this.stopDatetime) : this.startDate();
    };

    this.parseDate = function (date) {
        return this.uuid ? date : moment(date, Bahmni.Common.Constants.dateFormat.toUpperCase()).toDate();
    };

    this.addImage = function (image) {
        var alreadyPresent = this.images.filter(function (img) {
            return img.encodedValue === image;
        });
        if (alreadyPresent.length == 0) {
            this.images.push({"encodedValue": image, "new": true});
        }
        this.markAsUpdated();
    };

    this.markAsUpdated = function () {
        var savedImagesChanged = this.savedImages.some(function(image) { return image.changed; });
        this.changed = savedImagesChanged || (this.images && this.images.length > 0);
    };

    this.removeNewAddedImage = function (image) {
        var i = this.images.indexOf(image);
        this.images.splice(i, 1);
        this.markAsUpdated();
    };

    this.toggleVoidingOfImage = function (image) {
        image.voided = !image.voided;
        image.changed = true;
        this.markAsUpdated();
    };
};
