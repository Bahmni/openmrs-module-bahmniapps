'use strict';

Bahmni.ConceptSet.ConceptSetGroupValidationHandler = function(conceptSetSections){
    var validations = [];

    this.add = function(validation) {
        validations.push(validation);
    };

    this.validate = function() {
        var allconceptSetSectionsValid = true;
        validations.forEach(function(validation){
            var isValid = validation();
            allconceptSetSectionsValid = allconceptSetSectionsValid && isValid;
        });
        if(!allconceptSetSectionsValid) {
            conceptSetSections.filter(_.property('isLoaded')).forEach(function(conceptSetSection){ conceptSetSection.show(); });
        }
        return {allow: allconceptSetSectionsValid};
    };
};