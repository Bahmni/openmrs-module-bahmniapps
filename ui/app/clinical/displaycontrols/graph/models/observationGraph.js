'use strict';

(function () {
    Bahmni = Bahmni || {};
    Bahmni.Clinical = Bahmni.Clinical || {};
    Bahmni.Clinical.ObservationGraph = function (model) {
        angular.extend(this, model);
    };

    var fixCaseMismatchIssues = function (config, observations) {
        var conceptNamesFromConfig = config.yAxisConcepts.slice(0);
        conceptNamesFromConfig.push(config.xAxisConcept);
        _.each(observations, function (obs) {
            obs.concept.name = _.find(conceptNamesFromConfig, function (configConceptName) {
                return configConceptName.toLowerCase() === obs.concept.name.toLowerCase();
            });
        });
    };

    var createObservationPoint = function (config, obs, xAxisValues) {
        var observation = {};
        observation[config.xAxisConcept] = xAxisValues;
        observation[obs.concept.name] = obs.value;
        return observation;
    };

    var findMatchingLine = function (lines, obs) {
        return _(lines).find(function (line) {
            return line.name === obs.concept.name;
        });
    };

    Bahmni.Clinical.ObservationGraph.create = function (allObservations, person, config, referenceLines) {
        fixCaseMismatchIssues(config, allObservations);

        var yAxisObservations = _.filter(allObservations, function (obs) {
            return obs.concept.name !== config.xAxisConcept;
        });

        var xAxisObservations = _.filter(allObservations, function (obs) {
            return obs.concept.name === config.xAxisConcept;
        });

        var lines = _(yAxisObservations).uniqBy(function (item) {
            return item.concept.name + item.concept.units;
        }).map(function (item) {
            return new Bahmni.Clinical.ObservationGraphLine({
                name: item.concept.name,
                units: item.concept.units,
                values: []
            });
        }).value();

        _.forEach(yAxisObservations, function (yAxisObs) {
            var xValue;
            if (config.displayForObservationDateTime()) {
                config.type = "timeseries";
                xValue = Bahmni.Common.Util.DateUtil.parseDatetime(yAxisObs.observationDateTime).toDate();
            } else if (config.displayForAge()) {
                xValue = Bahmni.Common.Util.AgeUtil.differenceInMonths(person.birthdate, yAxisObs.observationDateTime);
            } else {
                config.type = "indexed";
                var matchingObservation = _.find(xAxisObservations, function (xObs) {
                    return yAxisObs.observationDateTime === xObs.observationDateTime;
                });
                xValue = matchingObservation ? matchingObservation.value : undefined;
            }

            if (xValue !== undefined) {
                var line = findMatchingLine(lines, yAxisObs);
                var observationPoint = createObservationPoint(config, yAxisObs, xValue);
                line.addPoint(observationPoint);
            }
        });

        if (referenceLines !== undefined) {
            lines = lines.concat(referenceLines);
            var referenceLinesYAxisConcepts = _.map(referenceLines, 'name');
            config.yAxisConcepts = config.yAxisConcepts.concat(referenceLinesYAxisConcepts);
        }

        return new Bahmni.Clinical.ObservationGraph(lines);
    };
})();

