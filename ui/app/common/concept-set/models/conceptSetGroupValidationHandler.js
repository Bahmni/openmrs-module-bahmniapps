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
