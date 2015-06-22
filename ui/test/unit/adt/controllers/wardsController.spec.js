'use strict';

describe("WardsController", function () {
    var wardService, createController, scope, bedService, userService, rootScope;
    var wardsList = [{
        occupiedBeds: 3,
        totalBeds: 5,
        ward: {name: "first ward", childLocations: [{display: "Physical space for  first ward"}]}
    }, {
        occupiedBeds: 4,
        totalBeds: 15,
        ward: {name: "second ward", childLocations: [{display: "Physical space for second ward"}]}
    }];

    beforeEach(function () {
        module('bahmni.adt');

        module(function ($provide) {
            $provide.value('wardService', {
                getWardsList: function () {
                    return {
                        success: function (callback) {
                            return callback([{
                                occupiedBeds: 3,
                                totalBeds: 5,
                                ward: {
                                    name: "first ward",
                                    childLocations: [{display: "Physical space for  first ward"}]
                                }
                            }, {
                                occupiedBeds: 4,
                                totalBeds: 15,
                                ward: {
                                    name: "second ward",
                                    childLocations: [{display: "Physical space for second ward"}]
                                }
                            }]);
                        }
                    };
                }
            });

            return null;
        });

        module(function ($provide) {
            $provide.value('bedService', {});
            $provide.value('userService', {})
        });

    });

    beforeEach(function () {
        inject(function ($controller, $rootScope, _WardService_, bedService, userService) {
            scope = $rootScope.$new();
            rootScope = {
                currentUser: {
                    isFavouriteWard: function (wardName) {
                        return "General Ward" === wardName;
                    }
                }
            };
            wardService = _WardService_;
            bedService = bedService;
            userService = userService;
            createController = function () {
                return $controller("WardsController", {
                    $scope: scope,
                    $rootScope: rootScope
                });
            };
        });
    });

    it("should call the ward service to retrieve the ward list", function () {
        var callback = spyOn(wardService, 'getWardsList').and.callThrough();
        createController();
        expect(wardService.getWardsList).toHaveBeenCalled();
    });

});



