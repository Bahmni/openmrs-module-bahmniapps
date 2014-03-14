Bahmni.DocumentUpload.Visit = function () {

    this.startDatetime = "";
    this.stopDatetime = "";
    this.visitType = null;
    this.changed = false;
    this.savedImages = [];
    this.images = [];
    this.encounters = [];
    var androidDateFormat = "yyyy-mm-dd";

    this.initSavedImages = function () {
        this.savedImages = [];
        this.images = [];

        var savedImages = this.savedImages;
        this.encounters.forEach(function (encounter) {
            encounter.obs && encounter.obs.forEach(function (observation) {
                observation.groupMembers && observation.groupMembers.forEach(function (member) {
                    if (member.concept.name.name == 'Document') {
                        var conceptName = observation.concept.name.name;
                        savedImages.push({"encodedValue": member.value, "obsUuid": observation.uuid, concept: {uuid: observation.concept.uuid, editableName: conceptName, name: conceptName}});
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
        var endDateTime = this.stopDatetime ? this.parseDate(this.stopDatetime) : this.startDate();
        return endDateTime.setHours(23,59,59,000);
    };

    this.parseDate = function (date) {
        if(date instanceof Date) return date;
        var dateFormat = (date && date.indexOf('-') !== -1) ? androidDateFormat : Bahmni.Common.Constants.dateFormat;
        return  moment(date, dateFormat.toUpperCase()).toDate();
    };

    this.addImage = function (image) {
        var alreadyPresent = this.images.filter(function (img) {
            return img.encodedValue === image;
        });
        if (alreadyPresent.length == 0) {
            this.images.unshift({"encodedValue": image, "new": true});
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
