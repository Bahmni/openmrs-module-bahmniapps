Bahmni.Auth.User = function (user) {

    angular.extend(this, user);

    this.userProperties = user.userProperties || {};
    this.favouriteObsTemplates = this.userProperties.favouriteObsTemplates ? this.userProperties.favouriteObsTemplates.split("###") : [];
    this.recentlyViewedPatients = this.userProperties.recentlyViewedPatients ? JSON.parse(this.userProperties.recentlyViewedPatients) : [];

    this.toContract = function () {
        var user = angular.copy(this);
        user.userProperties.favouriteObsTemplates = this.favouriteObsTemplates.join("###");
        user.userProperties.recentlyViewedPatients = JSON.stringify(this.recentlyViewedPatients);
        delete user.favouriteObsTemplates;
        delete user.recentlyViewedPatients;
        return user;
    };

    this.addToRecentlyViewed = function(patient, maxPatients) {
        if(!_.any(this.recentlyViewedPatients, {'uuid': patient.uuid})) {
            if(_.size(this.recentlyViewedPatients)> maxPatients){
                this.recentlyViewedPatients = _.first(this.recentlyViewedPatients, maxPatients);
            }
            this.recentlyViewedPatients.unshift({uuid: patient.uuid, name: patient.name});
        }
    };

    this.isFavouriteObsTemplate = function (conceptName) {
        return _.contains(this.favouriteObsTemplates, conceptName);
    };

    this.toggleFavoriteObsTemplate = function (conceptName) {
        if (this.isFavouriteObsTemplate(conceptName)) {
            this.favouriteObsTemplates = _.without(this.favouriteObsTemplates, conceptName);
        } else {
            this.favouriteObsTemplates.push(conceptName);
        }
    }
};

