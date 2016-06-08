'use strict';

describe('chromeEncryptionService tests', function(){
    var chromeEncryptionService;

    beforeEach(function () {
        module('bahmni.common.offline');
    });

    beforeEach(inject(['chromeEncryptionService', function (chromeEncryptionServiceInjected) {
        chromeEncryptionService = chromeEncryptionServiceInjected
    }]));

    it("should encrypt and decrypt patient json data", function(){
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var patientString = readFixtures('patient.json');
        var encryptedData = chromeEncryptionService.encrypt(patientString);
        var decryptedData = chromeEncryptionService.decrypt(encryptedData);

        expect(JSON.parse(patientString).patient.uuid).toBe(decryptedData.patient.uuid);
    });
});