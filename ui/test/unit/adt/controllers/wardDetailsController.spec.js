'use strict';

describe("Store Controller", function() {
    var  wardService, createController, scope;
    var bedService;
    var wardsList = [{
        occupiedBeds: 3,
        totalBeds: 5,
        ward: {name: "first ward", childLocations: [{display: "Physical space for  first ward"}]}
    }, {
        occupiedBeds: 4,
        totalBeds: 15,
        ward: {name: "second ward", childLocations: [{display: "Physical space for second ward"}]}
    }];

    beforeEach(function() {
        module('bahmni.adt');

        module(function($provide) {
            $provide.value('wardService', {
                getWardsList: function() {
                    return {
                        success: function(callback) {
                            return callback([{
                            occupiedBeds: 3,
                            totalBeds: 5,
                            ward: {name: "first ward", childLocations: [{display: "Physical space for  first ward"}]}
                        }, {
                            occupiedBeds: 4,
                            totalBeds: 15,
                            ward: {name: "second ward", childLocations: [{display: "Physical space for second ward"}]}
                        }]);}
                    };
                }
            });
            return null;
        });

        module(function($provide) {
            $provide.value('bedService', {});
        });

    });

    beforeEach(function() {
        inject(function($controller, $rootScope, _WardService_, bedService) {
            scope = $rootScope.$new();
            wardService = _WardService_;
            bedService = bedService;
            createController = function() {
                return $controller("WardDetailsController", {
                    $scope: scope
                });
            };
        });
    });

    it("should call the ward service to retrieve the ward list", function() {
        var callback = spyOn(wardService, 'getWardsList').and.callThrough();
        createController();
        expect(wardService.getWardsList).toHaveBeenCalled();
    });
});



