'use strict';

describe("User", function () {

    var User = Bahmni.Auth.User;

    describe("contract", function () {
        it("should save favourite obs templates as a string separated by '###' and recently viewed patients as  json", function () {
            var user = new User({});
            user.toggleFavoriteObsTemplate("Gynaecology");
            user.toggleFavoriteObsTemplate("Diabetes");
            user.toggleFavoriteObsTemplate("Tuberculosis");
            user.addToRecentlyViewed({uuid: 'abc', name: 'patient'}, 5);

            var contract = user.toContract();
            expect(contract.userProperties.favouriteObsTemplates).toBe("Gynaecology###Diabetes###Tuberculosis");
            expect(contract.userProperties.recentlyViewedPatients).toBe('[{"uuid":"abc","name":"patient"}]');
        });

    });

    describe("obs template", function () {

        it("should return true when obsTemplate is marked as favourite", function () {
            expect(new User({"userProperties": { "favouriteObsTemplates": "Gynaecology"}}).isFavouriteObsTemplate("Gynaecology")).toBe(true);
            expect(new User({}).isFavouriteObsTemplate("Gynaecology")).toBe(false);
            expect(new User({"userProperties": { "favouriteObsTemplates": "Gynaecology"}}).isFavouriteObsTemplate("Disliked Obs Template")).toBe(false);
        });

        it("should toggle obsTemplate as favourite", function () {
            var user = new User({"userProperties": { "favouriteObsTemplates": "Gynaecology"}});
            user.toggleFavoriteObsTemplate("Gynaecology");
            expect(user.isFavouriteObsTemplate("Gynaecology")).toBe(false);

            var user2 = new User({});
            user2.toggleFavoriteObsTemplate("Gynaecology");
            expect(user2.isFavouriteObsTemplate("Gynaecology")).toBe(true);
            user2.toggleFavoriteObsTemplate("Gynaecology");
            expect(user2.isFavouriteObsTemplate("Gynaecology")).toBe(false);

        });
    });

    describe("favorite wards", function(){
        it("should return true when ward is marked as a favorite", function(){
            expect(new User({"userProperties": { "favouriteWards": "General Ward"}}).isFavouriteWard("General Ward")).toBe(true);
            expect(new User({}).isFavouriteWard("General Ward")).toBe(false);
            expect(new User({"userProperties": { "favouriteWards": "General Ward"}}).isFavouriteWard("Emergency Ward")).toBe(false);
        });

        it("should toggle ward as favourite", function () {
            var user = new User({"userProperties": { "favouriteWards": "General Ward"}});
            user.toggleFavoriteWard("General Ward");
            expect(user.isFavouriteWard("General Ward")).toBe(false);

            var user2 = new User({});
            user2.toggleFavoriteWard("General Ward");
            expect(user2.isFavouriteWard("General Ward")).toBe(true);
            user2.toggleFavoriteWard("General Ward");
            expect(user2.isFavouriteWard("General Ward")).toBe(false);
        });
    });

    describe("recently viewed patients", function(){
       it("should add patient to recently viewed list", function(){
           var user = new User({"userProperties": { "recentlyViewedPatients": '[{"uuid": "1234", "name": "patient1", "identifier": "GAN2001"}]'}});
           user.addToRecentlyViewed({uuid: '5678', name: 'patient2', identifier: 'GAN2002'}, 5);
           expect(user.recentlyViewedPatients).toEqual([{uuid: '5678', name: 'patient2', identifier: 'GAN2002'}, {uuid: '1234', name: 'patient1', identifier: 'GAN2001'}]);
       });

       it("should not add patient if patient is already in recently viewed list", function(){
           var user = new User({"userProperties": { "recentlyViewedPatients": '[{"uuid": "1234", "name": "patient1", "identifier": "GAN2001"}]'}});
           user.addToRecentlyViewed({uuid: '1234', name: 'patient1' , identifier: 'GAN2001'}, 5);
           expect(user.recentlyViewedPatients).toEqual([{uuid: '1234', name: 'patient1', identifier: 'GAN2001'}]);
       });

       it("should replace existing patient in recently viewed list if it has reached max limit", function(){
           var user = new User({"userProperties": { "recentlyViewedPatients": '[{"uuid": "5678", "name": "patient2", "identifier": "GAN2002"},{"uuid": "1234", "name": "patient1", "identifier": "GAN2001"}]'}});
           user.addToRecentlyViewed({uuid: '9999', name: 'patient3', identifier: 'GAN2003'}, 2);
           expect(user.recentlyViewedPatients).toEqual([{uuid: '9999', name: 'patient3', identifier: 'GAN2003'},{uuid: '5678', name: 'patient2',identifier: 'GAN2002'}]);
       });
    });

});
