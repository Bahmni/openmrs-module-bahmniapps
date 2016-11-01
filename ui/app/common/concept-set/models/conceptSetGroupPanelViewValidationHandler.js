'use strict';

Bahmni.ConceptSet.ConceptSetGroupPanelViewValidationHandler = function (conceptSetSections) {
    this.add = function (validation) {
        var conceptSetPanel = getActiveConceptSet();
        if (conceptSetPanel.length == 1) {
            conceptSetPanel[0].validate = validation;
        }
    };

    var getActiveConceptSet = function () {
        return _.filter(conceptSetSections, function (conceptSet) {
            return conceptSet.klass === "active";
        });
    };

    this.validate = function () {
        var errorMessage = "";
        var allConceptSetSectionsValid = true;

        _.forEach(conceptSetSections, function (conceptSet) {
            if (conceptSet.validate && typeof conceptSet.validate == 'function') {
                var validationReturn = conceptSet.validate();
                conceptSet.isValid = validationReturn["allow"];
                conceptSet.errorMessage = validationReturn["errorMessage"];
                if (conceptSet.klass == 'active') {
                    errorMessage = validationReturn["errorMessage"];
                }
                allConceptSetSectionsValid = allConceptSetSectionsValid && validationReturn["allow"];
            }
        });
        if (!allConceptSetSectionsValid) {
            conceptSetSections.filter(_.property('isLoaded')).forEach(function (conceptSetSection) { conceptSetSection.show(); });
        }
        return {allow: allConceptSetSectionsValid, errorMessage: errorMessage};
    };
};
