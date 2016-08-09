'use strict';


Bahmni.ObservationForm = function (formUuid, formName ) {
    
    var self = this;

    var init = function () {
        self.formUuid = formUuid;
        self.formName = formName;
        self.isOpen = false;
    };

    self.toggleDisplay = function() {
        if(self.isOpen) {
            hide();
        } else {
            show();
        }
        console.log(self.isOpen);
    };

    function hide() {
        self.isOpen = false;
    }

    function show() {
        self.isOpen = true;
    }

    init();
};
