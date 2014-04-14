Bahmni.Common.DocumentImage = function(data){
    angular.extend(this, data);
    this.title = this.getTitle();
};

Bahmni.Common.DocumentImage.prototype = {
    getTitle: function() {
        var titleComponents = [];
        if(this.concept) {
            titleComponents.push(this.concept.name);
        }        
        if(this.obsDatetime) {
            titleComponents.push(moment(this.obsDatetime).format(Bahmni.Common.Constants.dateDisplayFormat));
        }
        return titleComponents.join(', ');
    }
};



