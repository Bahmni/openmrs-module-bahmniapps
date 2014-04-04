'use strict';

Bahmni.Clinical.EncounterTransactionToObsMapper = function () {

    this.map = function (encounterTransactions) {
        var allObs,
            validObservation = function (observation) {
                if (observation.voided) return false;
                if (observation.value && !isObservationAgroup(observation)) return true;
                return isObservationAgroup(observation) && observation.groupMembers.some(validObservation);
            },
            setProvider = function (provider) {
                var setProviderToObservation = function(observation) {
                    observation.provider = provider;
                    angular.forEach(observation.groupMembers, setProviderToObservation);
                };
                return setProviderToObservation;
            },
            setProviderToObservations = function(observations, provider){
                var setProviderFunction = setProvider(provider);
                angular.forEach(observations, function(observation) {
                    setProviderFunction(observation);
                });
            },
            removeAbnormalObs = function(observation){
                observation.groupMembers.forEach(function(obsMember, index){
                  if(Bahmni.Common.Constants.abnormalObservationConceptName.indexOf(obsMember.concept.name)>=0){ // if setMember is isAbnormal
                    var concept = observation.groupMembers.filter(function(obs){ return obs.concept != obsMember.concept})[0]
                    concept.is_abnormal = obsMember.value; //abnormal now stored at concept level than isAbnormal
                    delete observation.groupMembers[index];
                    return;
                  }
                  else {
                       angular.forEach(obsMember.groupMembers, removeAbnormalObs);
                  }
                })
            },
            flatten = function (transactions, item) {
                return transactions.reduce(function (result, transaction) {
                    setProviderToObservations(transaction[item], transaction.providers[0]);
                    angular.forEach(transaction[item], removeAbnormalObs);
                    return result.concat(transaction[item]);
                }, []);
            },
            isObservationAgroup = function (observation) {
                return observation.groupMembers && observation.groupMembers.length > 0;
            },
            removeInvalidGroupMembers = function (observation) {
                angular.forEach(observation.groupMembers, removeInvalidGroupMembers);
                if (observation.groupMembers)
                    observation.groupMembers = observation.groupMembers.filter(validObservation);
            };

        allObs = flatten(encounterTransactions, 'observations').filter(validObservation);
        allObs.forEach(removeInvalidGroupMembers);
        return allObs;
    };
};