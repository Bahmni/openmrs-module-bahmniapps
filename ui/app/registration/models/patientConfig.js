'use strict';

Bahmni.Registration.PatientConfig = (function () {
    function PatientConfig (patientAttributeTypes, identifierTypes, patientInformation) {
        this.attributeTypes = patientAttributeTypes;
        this.identifierTypes = identifierTypes;
        var patientAttributesSections = {};
        // Avoiding multiple calls from angular code. Side effect of the way angular does dirty check. [Shruti/ Sush]
        if (!this.attributeRows && this.attributeTypes) {
            if (!patientInformation) {
                this.attributeRows = this.splitAsRows(this.attributeTypes);
                return;
            }

            var hiddenAttributes = patientInformation["hidden"] && patientInformation["hidden"].attributes;
            delete patientInformation["hidden"];

            var otherInformationAttributes = this.attributeTypes.map(function (item) {
                item.keyPrefix = "PATIENT_ATTRIBUTE_";
                return item;
            }).filter(function (item) {
                return !isHiddenPatientAttribute(hiddenAttributes, item) &&
                    !isItemAMandatoryField(item) &&
                    !isAttributeInOtherSection(patientInformation, patientAttributesSections, item);
            });

            this.attributeRows = this.splitAsRows(otherInformationAttributes);
            this.patientAttributesSections = patientAttributesSections;
        }
    }

    function isHiddenPatientAttribute (hiddenAttributes, item) { // Ignore hidden fields from patientInformation configuration
        return hiddenAttributes && hiddenAttributes.indexOf(item.name) > -1;
    }

    function isAttributeInOtherSection (patientInformation, patientAttributesSections, item) {
        return _.find(patientInformation, function (section, key) {
            return _.find(section.attributes, function (attribute) {
                if (attribute === item.name) {
                    var sectionObject = patientAttributesSections[key];
                    if (!sectionObject) {
                        sectionObject = {
                            attributes: [],
                            title: section.title,
                            expanded: section.expanded,
                            translationKey: section.translationKey,
                            shortcutKey: section.shortcutKey,
                            order: section.order,
                            canShow: true
                        };
                    }
                    sectionObject.attributes.push(item);
                    patientAttributesSections[key] = sectionObject;
                    return true;
                }
                return false;
            });
        });
    }

    function isItemAMandatoryField (item) {
        var mandatoryPatientAttributes = ["healthCenter", "givenNameLocal", "middleNameLocal", "familyNameLocal"];
        return mandatoryPatientAttributes.indexOf(item.name) > -1;
    }

    PatientConfig.prototype = {
        get: function (attributeUuid) {
            return this.attributeTypes.filter(function (item) {
                return item.uuid === attributeUuid;
            })[0];
        },

        customAttributeRows: function () {
            return this.attributeRows;
        },

        getPatientAttributesSections: function () {
            return this.patientAttributesSections;
        },

        getOrderedPatientAttributesSections: function () {
            return _.sortBy(this.patientAttributesSections, 'order');
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
            return this.attributeTypes.filter(function (item) {
                return item.name === "healthCenter";
            })[0];
        },

        local: function () {
            var givenName = this.attributeTypes.filter(function (item) {
                return item.name === "givenNameLocal";
            })[0];
            var middleName = this.attributeTypes.filter(function (item) {
                return item.name === "middleNameLocal";
            })[0];
            var familyName = this.attributeTypes.filter(function (item) {
                return item.name === "familyNameLocal";
            })[0];

            if (givenName && middleName && familyName) {
                return { "showNameField": true, "labelForNameField": givenName.description, "placeholderForGivenName": givenName.description, "placeholderForMiddleName": middleName.description, "placeholderForFamilyName": familyName.description};
            }
            return {"showNameField": false};
        }

    };
    return PatientConfig;
})();
