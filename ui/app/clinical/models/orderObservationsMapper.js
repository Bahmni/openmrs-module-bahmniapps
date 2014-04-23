Bahmni.Clinical.OrderObservationsMapper = function () {
};

Bahmni.Clinical.OrderObservationsMapper.prototype.createOrderGroup = function (encounterTransactions, ordersName, filter, groupingParameter) {
    var orderGroup = new Bahmni.Clinical.OrderGroup();
    var orders = orderGroup.flatten(encounterTransactions, ordersName, filter);
    var observations = Bahmni.Common.Util.ArrayUtil.flatten(encounterTransactions, 'observations');
    this.map(observations, orders);
    return orderGroup.group(orders, groupingParameter);
};

Bahmni.Clinical.OrderObservationsMapper.prototype.map = function (observations, orders) {
    var makeCommentsAsAdditionalObs = function (observation) {
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
        getObservationForOrderIfExist = function (observations, testOrder, obs) {
            angular.forEach(observations, function (observation) {
                if (testOrder.uuid === observation.orderUuid) {
                    makeCommentsAsAdditionalObs(observation);
                    obs.push(observation);
                } else if (observation.orderUuid == null && observation.groupMembers.length > 0) {
                    getObservationForOrderIfExist(observation.groupMembers, testOrder, obs);
                }
            });
        },
        mapTestOrderWithObs = function (observations, testOrder) {
            var obs = [];
            getObservationForOrderIfExist(observations, testOrder, obs);
            testOrder.obs = obs;
        };

    orders.forEach(function (order) { mapTestOrderWithObs(observations, order); });
};
