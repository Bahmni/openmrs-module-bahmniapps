'use strict';
describe("Identifiers", function () {
    var identifiersFactory, preferencesMock, rootScope;
    beforeEach(module('bahmni.registration'));
    beforeEach(module('bahmni.common.models'));
    beforeEach(inject(['identifiers', 'preferences', '$rootScope', function (identifiers, preferences, $rootScope) {
        identifiersFactory = identifiers;
        preferencesMock = preferences;
        rootScope = $rootScope;
        rootScope.patientConfiguration = {
            identifierTypes: [
                {
                    primary: true,
                    uuid: 'primary-identifier-type-uuid',
                    identifierSources: [
                        {
                            prefix: 'GAN'
                        },
                        {
                            prefix: 'SEM'
                        }
                    ]
                },
                {
                    primary: false,
                    uuid: 'extra-identifier-type-uuid',
                    identifierSources: [
                        {
                            prefix: 'BAH'
                        },
                        {
                            prefix: 'SEM'
                        }
                    ]
                }
            ]
        };

    }]));

    describe('create identifiers', function () {
        it('should map identifierPrefix and hasOldIdentifier from preferences for primary identifier', function () {
            preferencesMock.identifierPrefix = 'SEM';
            preferencesMock.hasOldIdentifier = true;

            var identifiersDetails = identifiersFactory.create();

            expect(identifiersDetails.primaryIdentifier.selectedIdentifierSource).toEqual({
                prefix: 'SEM'
            });
            expect(identifiersDetails.primaryIdentifier.hasOldIdentifier).toBeTruthy();
        });

        it('should map first identifierPrefix found if it is not specified in preferences for primary identifier', function () {
            var identifiersDetails = identifiersFactory.create();

            expect(identifiersDetails.primaryIdentifier.selectedIdentifierSource).toEqual({
                prefix: 'GAN'
            });
        })

        it('should map first identifierPrefix found for extra identifiers', function () {
            var identifiersDetails = identifiersFactory.create();

            expect(identifiersDetails.extraIdentifiers[0].selectedIdentifierSource).toEqual({
                prefix: 'BAH'
            });
        })
    })
});
