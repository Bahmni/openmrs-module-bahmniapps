/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

Bahmni.ConceptSet.ConceptSetGroupValidationHandler = function (conceptSetSections) {
    var validations = [];

    this.add = function (validation) {
        validations.push(validation);
    };

    this.validate = function () {
        var errorMessage = "";
        var allConceptSetSectionsValid = true;

        validations.forEach(function (validation) {
            var validationReturn = validation();
            if (_.isEmpty(errorMessage)) {
                errorMessage = validationReturn["errorMessage"];
            }
            allConceptSetSectionsValid = allConceptSetSectionsValid && validationReturn["allow"];
        });

        if (!allConceptSetSectionsValid) {
            conceptSetSections.filter(_.property('isLoaded')).forEach(function (conceptSetSection) { conceptSetSection.show(); });
        }
        return {allow: allConceptSetSectionsValid, errorMessage: errorMessage};
    };
};
