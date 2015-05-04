'use strict';

(function () {
    Bahmni = Bahmni || {};
    Bahmni.Clinical = Bahmni.Clinical || {};
    Bahmni.Clinical.ObservationGraph = function (model) {
        angular.extend(this, model);
    };

    var buildObservationGraphModel = function (config, obs, observationGraphModel, xAxisValues) {
        var observation = {};
        observation[config.xAxisConcept] = xAxisValues;
        observation[obs.concept.name] = obs.value;
        observation["units"] = obs.concept.units;
        observationGraphModel.push(observation);
    };

    var entryMatchingConcept = function (graphModel, obs) {
        return _(graphModel).find(function (item) {
            return item.name === obs.concept.name;
        }).values;
    };

    Bahmni.Clinical.ObservationGraph.create = function (observations, person, config) {
        if (observations.length == 0) return;

        var yAxisObservations = _.filter(observations, function (obs) {
            return obs.concept.name !== config.xAxisConcept;
        });

        var xAxisObservations = _.filter(observations, function (obs) {
            return obs.concept.name === config.xAxisConcept;
        });

        var observationGraphModel = _(observations).uniq(function (item) {
            return item.concept.name + item.concept.units;
        }).map(function (item) {
            return {name: item.concept.name, units: item.concept.units, values: []}
        }).value();

        var sortedObsGraphModel = [];
        _.each(config.yAxisConcepts, function(concept){
            _.each(observationGraphModel, function(item){
                if(concept === item.name){
                    sortedObsGraphModel.push(item);
                }
            })
        });

        if (config.displayForObservationDateTime()) {
            config.type = "timeseries";
            _.forEach(yAxisObservations, function (obs) {
                buildObservationGraphModel(config, obs, entryMatchingConcept(sortedObsGraphModel, obs),
                    Bahmni.Common.Util.DateUtil.parseDatetime(obs.observationDateTime).toDate());
            });
        } else if (config.displayForAge()) {
            config.unit = " (years)";
            _.forEach(yAxisObservations, function (obs) {
                var age = Bahmni.Common.Util.AgeUtil.fromBirthDateTillReferenceDate(person.birthdate, obs.observationDateTime);
                var ageValue = age.years + "." + age.months;
                buildObservationGraphModel(config, obs, entryMatchingConcept(sortedObsGraphModel, obs), ageValue);
            });
        } else {
            config.type = "indexed";
            _.each(yAxisObservations, function (yAxisObs) {
                _.each(xAxisObservations, function (xAxisObs) {
                    if (yAxisObs.observationDateTime === xAxisObs.observationDateTime) {
                        buildObservationGraphModel(config, yAxisObs, entryMatchingConcept(sortedObsGraphModel, yAxisObs), xAxisObs.value);
                    }
                })
            });
        }

        return new Bahmni.Clinical.ObservationGraph(sortedObsGraphModel);
    };
})();

