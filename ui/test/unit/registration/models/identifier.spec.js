'use strict';

describe("Identifier Model", function () {

    describe('generate', function () {
        it("should void the saved identifier when identifier text field is blanked out", function () {
            var identifierType = {uuid: 'identifier-type-uuid'};
            var identifier = {
                uuid: "some-uuid",
                voided: false,
                registrationNumber: "abcdef",
                identifierType: identifierType
            };
            var patientIdentifier = new Bahmni.Registration.Identifier(identifierType).map([identifier]);
            patientIdentifier.registrationNumber = "";

            patientIdentifier.generate();

            expect(patientIdentifier.voided).toBeTruthy();
        });

        it('should not void the identifier when identifier field is cleared and filled again', function () {
            var identifierType = {uuid: 'identifier-type-uuid'};
            var identifier = {
                uuid: "some-uuid",
                voided: false,
                registrationNumber: "abcdef",
                identifierType: identifierType
            };
            var patientIdentifier = new Bahmni.Registration.Identifier(identifierType).map([identifier]);

            patientIdentifier.registrationNumber = "";
            patientIdentifier.generate();
            expect(patientIdentifier.voided).toBeTruthy();

            patientIdentifier.registrationNumber = "abcd";
            patientIdentifier.generate();
            expect(patientIdentifier.voided).toBeFalsy();

        })
    });

    describe("clearRegistrationNumber", function () {
        it("should clear registrationNumber and identifier", function () {
            var identifierType = {uuid: 'identifier-type-uuid'};
            var patientIdentifier = new Bahmni.Registration.Identifier(identifierType);
            patientIdentifier.identifier = "GAN123";
            patientIdentifier.registrationNumber = "123";

            patientIdentifier.clearRegistrationNumber();

            expect(patientIdentifier.registrationNumber).toBe(null);
            expect(patientIdentifier.identifier).toBe(null);
        });
    });

    describe("isIdentifierRequired", function () {
        it('should return true if Enter ID is checked irrespective of whether identifier type is configured as required or not', function () {
            var identifier = new Bahmni.Registration.Identifier({
                required: false,
                identifierSources: []
            });
            identifier.hasOldIdentifier = true;
            expect(identifier.isIdentifierRequired()).toBeTruthy();
        });

        it('should return true if Enter Id is not checked and identifier type can not be auto generated ', function () {
            var identifier = new Bahmni.Registration.Identifier({
                required: true,
                identifierSources: []
            });
            identifier.hasOldIdentifier = false;

            expect(identifier.isIdentifierRequired()).toBeTruthy();
        });

        it('should return false if Enter Id is not checked but identifier type can be auto generated ', function () {
            var identifier = new Bahmni.Registration.Identifier({
                required: true,
                identifierSources: [{
                    name: 'Ganiyari',
                    prefix: 'GAN'
                }]
            });
            identifier.hasOldIdentifier = false;

            expect(identifier.isIdentifierRequired()).toBeFalsy();
        });
    });

    describe('hasIdentifierSources', function () {
        it("hasIdentifierSources, should return false if identifier sources are not present", function () {
            var identifierType = {identifierSources: []};
            var identifier = new Bahmni.Registration.Identifier(identifierType);
            expect(identifier.hasIdentifierSources()).toBeFalsy();
        });

        it("hasIdentifierSources, should return true if identifier sources are present", function () {
            var identifierType = {identifierSources: [{name: "ABC", prefix: ""}]};
            var identifier = new Bahmni.Registration.Identifier(identifierType);
            expect(identifier.hasIdentifierSources()).toBeTruthy();
        });
    });

    describe('hasIdentifierSourceWithEmptyPrefix', function () {

        it("should return true if there is only one identifier source with blank prefix", function () {
            var identifierType = {identifierSources: [{name: "ABC", prefix: ""}]};
            var identifier = new Bahmni.Registration.Identifier(identifierType);
            expect(identifier.hasIdentifierSourceWithEmptyPrefix()).toBeTruthy();
        });

        it("should return true if there is only one identifier source with null prefix", function () {
            var identifierType = {identifierSources: [{name: "ABC", prefix: null}]};
            var identifier = new Bahmni.Registration.Identifier(identifierType);
            expect(identifier.hasIdentifierSourceWithEmptyPrefix()).toBeTruthy();
        });

        it("should return false if there is only one identifier source without a blank prefix", function () {
            var identifierType = {identifierSources: [{name: "ABC", prefix: "prefix"}]};
            var identifier = new Bahmni.Registration.Identifier(identifierType);
            expect(identifier.hasIdentifierSourceWithEmptyPrefix()).toBeFalsy();
        });

    });


    describe('map', function () {
        it('should map identifiers for all identifier types and initialise empty identifier if it does not exit for an identifier type', function () {
            var savedIdentifiers = [{
                uuid: 'saved-identifier-uuid',
                identifierType: {
                    uuid: 'identifier-type-uuid'
                },
                identifier: 'abcdefghi'
            }];

            var mappedIdentifier = new Bahmni.Registration.Identifier({
                uuid: 'extra-identifier-type-uuid',
                primary: false
            }).map(savedIdentifiers);

            expect(mappedIdentifier).toEqual(jasmine.objectContaining({
                identifierType: {uuid: 'extra-identifier-type-uuid', primary: false},
                preferred: false,
                voided: false
            }));

        });

        it('should map identifier with saved values', function () {
            var savedIdentifiers = [{
                uuid: 'saved-identifier-uuid',
                identifierType: {
                    uuid: 'identifier-type-uuid'
                },
                identifier: 'abcdefghi',
                preferred: false,
                voided: false
            }];

            var mappedIdentifier = new Bahmni.Registration.Identifier({
                uuid: 'identifier-type-uuid',
                primary: true
            }).map(savedIdentifiers);

            expect(mappedIdentifier).toEqual(jasmine.objectContaining({
                identifierType: {
                    uuid: 'identifier-type-uuid',
                    primary: true
                },
                preferred: false,
                voided: false,
                registrationNumber: 'abcdefghi',
                identifier: 'abcdefghi',
                uuid: 'saved-identifier-uuid'
            }));

        })

    });
});