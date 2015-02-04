'use strict';

describe("User", function () {

    var User = Bahmni.Auth.User;

    describe("contract", function () {
        it("should save favourite obs templates as a string separated by '###'", function () {
            var user = new User({});
            user.toggleFavoriteObsTemplate("Gynaecology");
            user.toggleFavoriteObsTemplate("Diabetes");
            user.toggleFavoriteObsTemplate("Tuberculosis");
            
            var contract = user.toContract();
            expect(contract.userProperties.favouriteObsTemplates).toBe("Gynaecology###Diabetes###Tuberculosis");
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

});