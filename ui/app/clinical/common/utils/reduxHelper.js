'use strict';

Bahmni.Clinical.Consultation.ObsReducer = function (state, action) {
  var actionTypes = Bahmni.CLinical.Constants.actionTypes;
  var actualState = state || {};
  switch(action.type) {
    case actionTypes.observationAdded:
      return Object.assign({}, actualState, { observations: action.observations });
    default:
      return state;
  }
};
Bahmni.Clinical.Consultation.ObsReducer()