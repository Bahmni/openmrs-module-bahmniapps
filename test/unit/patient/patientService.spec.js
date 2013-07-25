'use strict';

describe("patientService", function () {
    beforeEach(module('opd.patient'));

    var imageUrl = "imgUrl";
    var rootScope;
    beforeEach(inject(function($injector) {
        rootScope = $injector.get('$rootScope');
        rootScope.bahmniConfiguration = { patientImagesUrl: imageUrl }
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
