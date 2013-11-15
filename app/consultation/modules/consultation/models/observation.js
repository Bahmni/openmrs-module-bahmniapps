Bahmni.Opd.Consultation.Observation = function () {

    this.displayName = function () {
        if(this.valueObject)
            return this.valueObject.display;
        else 
            return this.value;
    };

};