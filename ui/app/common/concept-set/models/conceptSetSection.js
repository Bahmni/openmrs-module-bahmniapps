Bahmni.ConceptSet.ConceptSetSection = function (extensions, observations, conceptSet) {
    var self = this;

    var init = function () {
        self.observations = observations;
        self.options = extensions.extensionParams || {};
        self.conceptName = conceptSet.name ? conceptSet.name.name : self.options.conceptName;
        var conceptName = _.find(conceptSet.names, {conceptNameType: "SHORT"}) || _.find(conceptSet.names, {conceptNameType: "FULLY_SPECIFIED"});
        conceptName = conceptName ? conceptName.name : conceptName;
        self.label = conceptName || conceptSet.name || self.options.conceptName;
        self.isLoaded = self.isOpen;

    };

    var getShowIfFunction = function () {
        if (!self.showIfFunction) {
            var showIfFunctionStrings = self.options.showIf || ["return true;"];
            self.showIfFunction = new Function("context", showIfFunctionStrings.join('\n'));
        }
        return self.showIfFunction;
    };

    var atLeastOneValueSet = function (observation) {
        if (observation.groupMembers && observation.groupMembers.length > 0) {
            return observation.groupMembers.some(function (groupMember) {
                return atLeastOneValueSet(groupMember);
            })
        } else {
            return observation.value;
        }
    };

    self.isAvailable = function (context) {
        return getShowIfFunction()(context || {});
    };

    self.toggle = function () {
        if (self.isOpen) {
            self.hide();
        } else {
            self.show();
        }
    };

    self.show = function () {
        self.isOpen = true;
        self.isLoaded = true;
    };

    self.hide = function () {
        self.isOpen = false;
    };

    self.getObservationsForConceptSection = function () {
        return self.observations.filter(function (observation) {
            return observation.concept.name === self.conceptName;
        });
    };
    self.hasSomeValue = function () {
        var observations = self.getObservationsForConceptSection();
        return _.some(observations, function (observation) {
            return atLeastOneValueSet(observation);
        })
    };

    self.toggle = function () {
        self.added = !self.added;
        if (self.added) {
            self.show();
        }
    };

    self.canToggle = function () {
        return !self.hasSomeValue();
    };

    Object.defineProperty(self, "isOpen", {
        get: function () {
            if (self.open === undefined) {
                self.open = self.hasSomeValue();
            }
            return self.open;
        },
        set: function (value) {
            self.open = value;
        }
    });

    Object.defineProperty(self, "isAdded", {
        get: function () {
            if (self.added === undefined) {
                if (self.options.default) {
                    self.added = true;
                }
                else {
                    self.added = self.hasSomeValue();
                }
            }
            return self.added;
        },
        set: function (value) {
            self.added = value;
        }
    });

    init();
};

