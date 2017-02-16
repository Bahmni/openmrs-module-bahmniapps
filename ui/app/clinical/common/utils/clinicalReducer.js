'use strict';

var Bahmni = Bahmni || {};
Bahmni.Reducers = Bahmni.Reducers || {};
Bahmni.Reducers.Medication = {
    prescription: function(state, action) {
        state = state || {};
        switch (action.type) {
            case 'ADD_PRESCRIPTION':
                return _.merge(state, action.data);
            case 'CLEAR_MEDICATION':
                return {};
            default:
                return state;
        }
    }
};
