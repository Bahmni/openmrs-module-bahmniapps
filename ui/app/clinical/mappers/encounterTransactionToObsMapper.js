'use strict';

Bahmni.Clinical.EncounterTransactionToObsMapper = function () {

    this.map = function (encounterTransactions, invalidEncounterTypes) {
        var allObs,
            validObservation = function (observation) {
                if (observation.voided) return false;
                if (!isObservationAgroup(observation)) return true;
                return isObservationAgroup(observation) && observation.groupMembers.some(validObservation);
            },
            setProvider = function (provider) {
                var setProviderToObservation = function (observation) {
                    observation.provider = provider;
                    angular.forEach(observation.groupMembers, setProviderToObservation);
                };
                return setProviderToObservation;
            },
            setProviderToObservations = function (observations, provider) {
                var setProviderFunction = setProvider(provider);
                angular.forEach(observations, function (observation) {
                    setProviderFunction(observation);
                });
            },
            flatten = function (transactions, item) {
                return transactions.reduce(function (result, transaction) {
                    setProviderToObservations(transaction[item], transaction.providers[0]);
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
            },
            removeInvalidEncounterTypes = function (encounterTransaction) {
                return invalidEncounterTypes.indexOf(encounterTransaction.encounterTypeUuid) === -1;
            };

        encounterTransactions = encounterTransactions.filter(removeInvalidEncounterTypes);
        allObs = flatten(encounterTransactions, 'observations').filter(validObservation);
        allObs.forEach(removeInvalidGroupMembers);
        return allObs;
    };
};