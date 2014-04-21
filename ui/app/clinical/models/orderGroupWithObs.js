Bahmni.Clinical.OrderGroupWithObs = function () {
};

Bahmni.Clinical.OrderGroupWithObs.prototype.create = function (encounterTransactions, orderListHandle, filter, allTestAndPanels, groupingParameter) {
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
        },
        filterFunction = function (aTestOrPanel, testOrder) {
            return aTestOrPanel.name.name == testOrder.concept.name;
        },
        sort = function (allTestsAndPanels, encountersWithTestOrders, filterFunction) {
            var indexOf = function (allTestAndPanels, order) {
                var indexCount = 0;
                allTestAndPanels.setMembers.every(function (aTestOrPanel) {
                    if (filterFunction(aTestOrPanel, order))
                        return false;
                    else {
                        indexCount++;
                        return true;
                    }
                });
                return indexCount;
            };

            encountersWithTestOrders.forEach(function (encounterWithTestOrders) {
                encounterWithTestOrders.orders.sort(function (firstElement, secondElement) {
                    var indexOfFirstElement = indexOf(allTestsAndPanels, firstElement);
                    var indexOfSecondElement = indexOf(allTestsAndPanels, secondElement);
                    return indexOfFirstElement - indexOfSecondElement;
                });
            });
            return encountersWithTestOrders;
        };

    orderGroup = new Bahmni.Clinical.OrderGroup().create(encounterTransactions, orderListHandle, filter, groupingParameter);
    orderGroup.forEach(function (orders) {
        orders.orders.forEach(function (order) {
            mapTestOrderWithObs(encounterTransactions, order);
        });
    });
    orderGroup = allTestAndPanels ? sort(allTestAndPanels, orderGroup, filterFunction) : orderGroup;

    return orderGroup;
};
