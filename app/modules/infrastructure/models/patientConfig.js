var PatientConfig = (function () {
    var autocompleteConfig = {
        map: {
            'caste': {
                'src': 'getCasteList',
                'responseMap': 'getDataResults'
            }
        },

        configure: function(attributes) {
            var self = this;
            attributes.forEach(function(attr) {
                if(self.map[attr.name] != null) {
                    attr.autocompleteConfig = self.map[attr.name];
                }
            });
        }
    }

    function PatientConfig(personAttributeTypes) {
        this.personAttributeTypes = personAttributeTypes;
    }

    PatientConfig.prototype = {
        get: function (attributeUuid) {
            return this.personAttributeTypes.filter(function (item) {
                return item.uuid === attributeUuid
            })[0];
        },

        customAttributeRows: function () {
            //Avoiding multiple calls from angular code. Side effect of the way angular does dirty check. [Shruti/ Sush]
            if (this.attributeRows === undefined) {
                var attributes = this.personAttributeTypes.filter(function (item) {
                    return item.name != "healthCenter" && item.name != "givenNameLocal" && item.name != "familyNameLocal";
                });

                autocompleteConfig.configure(attributes);
                this.attributeRows = this.splitAsRows(attributes);
            }
            return this.attributeRows;

        },

        splitAsRows: function (attributes) {
            var attributeRows = [];
            var row = [];
            for (var i in attributes) {
                row.push(attributes[i]);
                if (i != 0 && (i % 2) != 0) {
                    attributeRows.push(row);
                    row = [];
                }
            }
            if(row.length > 0) {
                attributeRows.push(row);
            }

            return attributeRows;
        },

        heathCentreAttribute: function () {
            return this.personAttributeTypes.filter(function (item) {
                return item.name == "healthCenter";
            })[0];
        },

        local: function () {
            var givenName = this.personAttributeTypes.filter(function (item) {
                return item.name == "givenNameLocal";
            })[0];
            var familyName = this.personAttributeTypes.filter(function (item) {
                return item.name == "familyNameLocal";
            })[0];

            if (givenName && familyName)
                return { "showNameField": true, "labelForNameField": givenName.description, "placeholderForGivenName": givenName.description, "placeholderForFamilyName": familyName.description};
            return {"showNameField": false}
        }

    };
    return PatientConfig;

})();
