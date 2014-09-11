Bahmni.DocumentUpload.Visit = function () {
    var DocumentImage = Bahmni.Common.DocumentImage;
    this.startDatetime = "";
    this.stopDatetime = "";
    this.visitType = null;
    this.uuid = null;
    this.changed = false;
    this.images = [];
    this.encounters = [];
    var androidDateFormat = "YYYY-MM-DD hh:mm:ss";

    this._sortSavedImages = function(savedImages) {
        var sortedSavedImages = [];
        var conceptUuids = [];
        savedImages.sort(function(image1,image2){
            return image1.id - image2.id;
        });
        return savedImages;
    };

    this.initSavedImages = function () {
        this.images = [];

        var savedImages = this.images;
        this.encounters.forEach(function (encounter) {
            encounter.obs && encounter.obs.forEach(function (observation) {
                observation.groupMembers && observation.groupMembers.forEach(function (member) {
                        var conceptName = observation.concept.name.name;
                        savedImages.push(new DocumentImage({
                            id:member.id,
                            encodedValue: Bahmni.Common.Constants.documentsPath + '/' + member.value,
                            obsUuid: observation.uuid,
                            obsDatetime: member.obsDatetime,
                            visitUuid: encounter.visit.uuid,
                            encounterUuid: encounter.uuid,
                            providerUuid: encounter.provider.uuid,
                            concept: {uuid: observation.concept.uuid, editableName: conceptName, name: conceptName}}));
                });
            });
        });
        this.images = this._sortSavedImages(savedImages);
    };

    this.isNew = function () {
        return this.uuid == null;
    };

    this.hasImages = function () {
        return this.images.length;
    };

    this.startDate = function () {
        if(!this.isNew()) return moment(this.startDatetime).toDate();
        return this.parseDate(this.startDatetime);
    };
    
    this.endDate = function () {
       return this.stopDatetime ? this.parseDate(this.stopDatetime) : undefined;
    };

    this.parseDate = function (date) {
        if(date instanceof Date) return date;
        var dateFormat = (date && date.indexOf('-') !== -1) ? androidDateFormat : Bahmni.Common.Constants.dateFormat;
        return  moment(date, dateFormat).toDate();
    };

    this.addImage = function (image) {
        var savedImage = null;
        var alreadyPresent = this.images.filter(function (img) {
            return img.encodedValue === image;
        });
        if (alreadyPresent.length == 0) {
            savedImage = new DocumentImage({"encodedValue": image, "new": true});
            this.images.push(savedImage);
        }
        this.markAsUpdated();
        return savedImage;
    };

    this.markAsUpdated = function () {
        this.changed = this.images.some(function(image) { return image.changed || !image.obsUuid || image.voided; });
    };
    
    this.isSaved = function(image){
        return image.obsUuid ? true : false;
    };
    
    this.removeImage = function(image){
       if(this.isSaved(image)){
           this.toggleVoidingOfImage(image);
       }else{
           this.removeNewAddedImage(image);
       }
    };

    this.removeNewAddedImage = function (image) {
        var i = this.images.indexOf(image);
        this.images.splice(i, 1);
        this.markAsUpdated();
    };

    this.toggleVoidingOfImage = function (image) {
        image.voided = !image.voided;
        this.markAsUpdated();
    };
};
