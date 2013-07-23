'use strict';

describe("configurationService", function () {
    beforeEach(module('opd.infrastructure'));

    var configurationList = {"patientImagesUrl":"http://myserver/patient_images"};
    var $http,
        mockHttp = {
            get:jasmine.createSpy('Http get').andReturn({success:function (callBack) {
                return callBack(configurationList);
            }})
        };

    beforeEach(module(function ($provide) {
        $provide.value('$http', mockHttp);
    }));

    describe("init", function () {
        it('should set up patient image url', inject(['ConfigurationService', function (configurationService) {
            configurationService.init();

            expect(mockHttp.get).toHaveBeenCalled();
            expect(mockHttp.get.mostRecentCall.args[0]).toBe(constants.bahmniConfigurationUrl);
            expect(configurationService.getImageUrl()).toBe("http://myserver/patient_images");
        }])
        );
    });
});
