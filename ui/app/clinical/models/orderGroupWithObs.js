Bahmni.Clinical.OrderGroupWithObs = function () {
};

Bahmni.Clinical.OrderGroupWithObs.prototype.create = function (encounterTransactions, orderListHandle, filter, groupingParameter) {
    var orderGroup,
        setProviderToObservation = function (provider) {
            var setProvider = function (observation) {
                observation.provider = provider;
                angular.forEach(observation.groupMembers, setProvider);
            };
            return setProvider;
        },
        makeCommentsAsAdditionalObs = function (observation) {
            angular.forEach(observation.groupMembers, makeCommentsAsAdditionalObs);
            if (observation.groupMembers) {
                var additionalObs = [];
                var testObservation = [];
                angular.forEach(observation.groupMembers, function (obs) {
                    if (obs.concept.name === Bahmni.Clinical.Constants.commentConceptName) {
                        additionalObs.push(obs);
                    }
                    else {
                        testObservation.push(obs);
                    }
                })
                observation.groupMembers = testObservation;
                if (observation.groupMembers[0] && additionalObs.length > 0) {
                    observation.groupMembers[0].additionalObs = additionalObs;
                }
            }
        },
        getObservationForOrderIfExist = function (observations, testOrder, obs, provider) {
            angular.forEach(observations, function (observation) {
                if (testOrder.uuid === observation.orderUuid) {
                    setProviderToObservation(provider)(observation);
                    makeCommentsAsAdditionalObs(observation);
                    obs.push(observation);
                } else if (observation.orderUuid == null && observation.groupMembers.length > 0) {
                    getObservationForOrderIfExist(observation.groupMembers, testOrder, obs, provider);
                }
            });
        },
        mapTestOrderWithObs = function (encounterTransactions, testOrder) {
            var obs = [];
            angular.forEach(encounterTransactions, function (encounterTransaction) {
                var provider = encounterTransaction.providers[0];
                getObservationForOrderIfExist(encounterTransaction.observations, testOrder, obs, provider);
            });
            testOrder.obs = obs;
        };


    orderGroup = new Bahmni.Clinical.OrderGroup().create(encounterTransactions, orderListHandle, filter, groupingParameter);
    orderGroup.forEach(function (orders) {
        orders.orders.forEach(function (order) {
            mapTestOrderWithObs(encounterTransactions, order);
        });
    });

    return orderGroup;
};
