Bahmni.DocumentUpload.DocumentImage = function(data){
    angular.extend(this, data);
}

Bahmni.DocumentUpload.DocumentImage.prototype = {
    getTitle: function() {
        var title = "";
        if(this.concept) {
            title = title + this.concept.name;
        }
        return title;
    }
}

