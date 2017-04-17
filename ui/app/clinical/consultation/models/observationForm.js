'use strict';

Bahmni.ObservationForm = function (formUuid, user, formName, formVersion, observations) {
    var self = this;

    var init = function () {
        self.formUuid = formUuid;
        self.formVersion = formVersion;
        self.formName = formName;
        self.label = formName;
        self.conceptName = formName;
        self.collapseInnerSections = {value: false};
        self.alwaysShow = user.isFavouriteObsTemplate(self.conceptName);
        self.observations = [];
        _.each(observations, function (observation) {
            var observationFormField = observation.formFieldPath ? (observation.formFieldPath.split("/")[0]).split('.') : null;
            if (observationFormField && observationFormField[0] === formName && observationFormField[1] === formVersion) {
                self.observations.push(observation);
            }
        });
        self.isOpen = self.observations.length > 0;
        self.id = "concept-set-" + formUuid;
    };

    self.toggleDisplay = function () {
        if (self.isOpen) {
            hide();
        } else {
            show();
        }
    };

    function hide () {
        self.isOpen = false;
    }

    function show () {
        self.isOpen = true;
    }

    // parameters added to show in observation page :: START
    self.clone = function () {
        var clonedObservationFormSection = new Bahmni.ObservationForm(self.formUuid, user, self.formName, self.formVersion, []);
        clonedObservationFormSection.isOpen = true;
        return clonedObservationFormSection;
    };

    self.isAvailable = function (context) {
        return true;
    };

    self.show = function () {
        self.isOpen = true;
        self.isLoaded = true;
    };

    self.toggle = function () {
        self.added = !self.added;
        if (self.added) {
            self.show();
        }
    };

    self.hasSomeValue = function () {
        var observations = self.getObservationsForConceptSection();
        return _.some(observations, function (observation) {
            return atLeastOneValueSet(observation);
        });
    };

    self.getObservationsForConceptSection = function () {
        return self.observations.filter(function (observation) {
            return observation.formFieldPath.split('.')[0] === self.formName;
        });
    };

    var atLeastOneValueSet = function (observation) {
        if (observation.groupMembers && observation.groupMembers.length > 0) {
            return observation.groupMembers.some(function (groupMember) {
                return atLeastOneValueSet(groupMember);
            });
        } else {
            return !(_.isUndefined(observation.value) || observation.value === "");
        }
    };

    self.isDefault = function () {
        return false;
    };

    Object.defineProperty(self, "isAdded", {
        get: function () {
            if (self.hasSomeValue()) {
                self.added = true;
            }
            return self.added;
        },
        set: function (value) {
            self.added = value;
        }
    });

    self.maximizeInnerSections = function (event) {
        event.stopPropagation();
        self.collapseInnerSections = {value: false};
    };

    self.minimizeInnerSections = function (event) {
        event.stopPropagation();
        self.collapseInnerSections = {value: true};
    };

    // parameters added to show in observation page :: END

    init();
};
