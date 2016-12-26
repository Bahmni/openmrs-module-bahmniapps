'use strict';

Bahmni.ObservationForm = function (formUuid, formName, formVersion, observations) {
    var self = this;

    var init = function () {
        self.formUuid = formUuid;
        self.formVersion = formVersion;
        self.formName = formName;
        self.observations = [];
        _.each(observations, function (observation) {
            var observationFormField = observation.formFieldPath ? (observation.formFieldPath.split("/")[0]).split('.') : null;
            if (observationFormField && observationFormField[0] === formName && observationFormField[1] === formVersion) {
                self.observations.push(observation);
            }
        });
        self.isOpen = self.observations.length > 0;
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

    init();
};
