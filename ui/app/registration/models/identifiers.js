/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.registration')
    .factory('identifiers', ['$rootScope', 'preferences', function ($rootScope, preferences) {
        var create = function () {
            var identifiers = [];
            _.each($rootScope.patientConfiguration.identifierTypes, function (identifierType) {
                var identifier = new Bahmni.Registration.Identifier(identifierType);
                if (identifier.isPrimary()) {
                    identifier.selectedIdentifierSource = _.find(identifier.identifierType.identifierSources, {prefix: preferences.identifierPrefix});
                    identifier.hasOldIdentifier = preferences.hasOldIdentifier;
                }
                identifier.selectedIdentifierSource = identifier.selectedIdentifierSource || identifier.identifierType.identifierSources[0];
                identifiers.push(identifier);
            });
            return {
                primaryIdentifier: getPrimaryIdentifier(identifiers),
                extraIdentifiers: getExtraIdentifiers(identifiers)
            };
        };

        var mapIdentifiers = function (identifiers) {
            var mappedIdentifiers = [];
            _.each($rootScope.patientConfiguration.identifierTypes, function (identifierType) {
                var mappedIdentifier = new Bahmni.Registration.Identifier(identifierType).map(identifiers);
                mappedIdentifiers.push(mappedIdentifier);
            });

            return {
                primaryIdentifier: getPrimaryIdentifier(mappedIdentifiers),
                extraIdentifiers: getExtraIdentifiers(mappedIdentifiers)
            };
        };

        var getPrimaryIdentifier = function (identifiers) {
            return _.find(identifiers, {identifierType: {primary: true}});
        };

        var getExtraIdentifiers = function (identifiers) {
            return _.filter(identifiers, {identifierType: {primary: false}});
        };

        return {
            create: create,
            mapIdentifiers: mapIdentifiers
        };
    }]);
