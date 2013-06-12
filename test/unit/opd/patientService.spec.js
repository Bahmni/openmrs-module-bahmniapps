'use strict';

describe("patientService", function () {
    beforeEach(module('opd.patientService'));

    var imageUrl = "imgUrl";
    var configurationService = jasmine.createSpyObj('ConfigurationService', ['getImageUrl']);
    configurationService.getImageUrl.andReturn(imageUrl);

    beforeEach(module(function ($provide) {
        $provide.value('ConfigurationService', configurationService);
    }));

    describe("constructImgUrl", function () {
        it('should get image url for an identifier', inject(['PatientService', function (patientService) {
            var identifier = "GAN1233";
            var constructImageUrl = patientService.constructImageUrl(identifier);
            expect(constructImageUrl).toBe(imageUrl + "/" + identifier + ".jpeg");
        }])
        );
    });
});
