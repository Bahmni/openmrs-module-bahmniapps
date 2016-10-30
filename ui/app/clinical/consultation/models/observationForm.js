'use strict';

Bahmni.ObservationForm = function (formUuid, formName, observations) {
    var self = this;

    var init = function () {
        self.formUuid = formUuid;
        self.formName = formName;
        self.observations = [];
        _.each(observations, function (observation) {
            var observationFormUuid = observation.formNamespace ? observation.formNamespace.split("/")[0] : null;
            if (observationFormUuid && observationFormUuid === formUuid) {
                self.observations.push(observation);
            }
        });
        self.isOpen = self.observations.length > 0 ? true : false;
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
