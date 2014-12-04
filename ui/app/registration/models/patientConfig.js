'use strict';

Bahmni.Registration.PatientConfig = (function () {
    var autocompleteConfig = {
        map: {
            'caste': {
                'src': 'getAutoCompleteList',
                'responseMap': 'getDataResults'
            }
        },

        configure: function (attributes) {
            var self = this;
            attributes.forEach(function (attr) {
                if (self.map[attr.name] !== null) {
                    attr.autocompleteConfig = self.map[attr.name];
                }
            });
        }
    }

    function PatientConfig(patientAttributeTypes, identifierSources, additionalPatientInformation ) {
        this.personAttributeTypes = patientAttributeTypes;
        this.identifierSources = identifierSources;
        var additionalAttributes = [];
        //Avoiding multiple calls from angular code. Side effect of the way angular does dirty check. [Shruti/ Sush]
        if ( !this.attributeRows && this.personAttributeTypes) {
            var attributes = this.personAttributeTypes.filter(function (item) {
                var find = _.find(additionalPatientInformation, function (attribute) {
                        if(attribute.name === item.name){
                            if(attribute.display){
                                additionalAttributes.push(item);
                            }
                            return true;
                        }
                        return false;
                    }
                );
                return item.name !== "healthCenter" && item.name !== "givenNameLocal" && item.name !== "middleNameLocal" && item.name !== "familyNameLocal" && (find ? false : true);
            });
            autocompleteConfig.configure(attributes);
            this.attributeRows = this.splitAsRows(attributes);
            this.additionalAttributesTypes = additionalAttributes;
        }
    }

    PatientConfig.prototype = {
        get: function (attributeUuid) {
            return this.personAttributeTypes.filter(function (item) {
                return item.uuid === attributeUuid
            })[0];
        },

        customAttributeRows: function () {
            return this.attributeRows;
        },

        additionalAttributes : function(){
            return this.additionalAttributesTypes;
        },

        splitAsRows: function (attributes) {
            var attributeRows = [];
            var row = [];
            for (var i in attributes) {
                row.push(attributes[i]);
                if (i !== 0 && (i % 2) !== 0) {
                    attributeRows.push(row);
                    row = [];
                }
            }
            if (row.length > 0) {
                attributeRows.push(row);
            }

            return attributeRows;
        },

        heathCentreAttribute: function () {
            return this.personAttributeTypes.filter(function (item) {
                return item.name === "healthCenter";
            })[0];
        },

        local: function () {
            var givenName = this.personAttributeTypes.filter(function (item) {
                return item.name === "givenNameLocal";
            })[0];
            var middleName = this.personAttributeTypes.filter(function (item) {
                return item.name === "middleNameLocal";
            })[0];
            var familyName = this.personAttributeTypes.filter(function (item) {
                return item.name === "familyNameLocal";
            })[0];

            if (givenName && middleName && familyName) {
                return { "showNameField": true, "labelForNameField": givenName.description, "placeholderForGivenName": givenName.description, "placeholderForMiddleName": middleName.description, "placeholderForFamilyName": familyName.description};
            }
            return {"showNameField": false}
        }

    };
    return PatientConfig;

})();
