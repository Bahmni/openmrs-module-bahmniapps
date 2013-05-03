var defaults = {
    registration_fees_newPatient : 10,
    registration_fees_oldPatient : 5,
    centerId: 'GAN',
    maxAutocompleteResults : 20,
    registration_fees: function(isNew) {
        return isNew? this.registration_fees_newPatient: this.registration_fees_oldPatient;
    }
}
