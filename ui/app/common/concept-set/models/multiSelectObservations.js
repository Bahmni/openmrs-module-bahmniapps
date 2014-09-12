Bahmni.ConceptSet.MultiSelectObservations = function(conceptSetConfig) {
    var self = this;
    this.multiSelectObservationsMap = {};

    this.map = function(mappedGroupMembers, obs) {
        mappedGroupMembers.forEach(function(member) {
            if(isMultiSelectable(member.concept, conceptSetConfig)) {
                add(member.concept, member, obs);
            }
        });
        insertMultiSelectObsInExistingOrder(obs);
    };

    var isMultiSelectable = function(concept, conceptSetConfig) {
        return concept.answers && concept.answers.length > 0 && conceptSetConfig[concept.name] && conceptSetConfig[concept.name].multiSelect;
    };

    var insertMultiSelectObsInExistingOrder = function(obs) {
        getAll().forEach(function(multiObs){
            var index = _.findIndex(obs.groupMembers, function(member){
                return member.concept.name === multiObs.concept.name;
            });
            obs.groupMembers.splice(index, 0, multiObs);
        });
    };

    var add = function(concept, obs, parentObs) {
        var concept_name = concept.name.name;
        self.multiSelectObservationsMap[concept_name] = self.multiSelectObservationsMap[concept_name] ||  new Bahmni.ConceptSet.MultiSelectObservation(concept, parentObs, conceptSetConfig);
        self.multiSelectObservationsMap[concept_name].add(obs);
    };

    var getAll = function() {
        return _.values(self.multiSelectObservationsMap);
    };
};


Bahmni.ConceptSet.MultiSelectObservation = function (concept, parentObs, conceptSetConfig) {
    var self = this;
    this.label = concept.name;
    this.isMultiSelect = true;
    this.selectedObs = {};
    this.concept = concept;

    this.possibleAnswers = concept.answers.map(function(answer) {
        var cloned = _.cloneDeep(answer);
        if(answer.name.name) cloned.name = answer.name.name;
        return cloned;
    });

    this.add = function(obs){
        if(obs.value) {
            self.selectedObs[obs.value.name] = obs;
        }
        obs.hidden = true;
    };

    this.hasValueOf = function (answer) {
        return self.selectedObs[answer.name] && !self.selectedObs[answer.name].voided;
    };

    this.toggleSelection = function(answer) {
        self.hasValueOf(answer) ? unselectAnswer(answer): selectAnswer(answer);
    };

    this.isFormElement = function(){
        return true;
    };

    this.getControlType = function(){
        return "buttonselect";
    };

    this.atLeastOneValueSet = function() {
        return true;
    };

    this.isValid = function(a,b) {
        return true;
    };

    this.canHaveComment = function() {
        return false;
    };

    var createObsFrom = function(answer) {
        var obs = newObservation(concept, answer, conceptSetConfig)
        parentObs.groupMembers.push(obs);
        return obs;
    };

    var selectAnswer =  function(answer) {
        var obs = self.selectedObs[answer.name];
        if (obs) {
            obs.value = answer;
            obs.voided = false;
        } else {
            obs = createObsFrom((answer));
            self.add(obs);
        }
    };

    var unselectAnswer = function unselectAnswer(answer) {
        var obs = self.selectedObs[answer.name];
        if(obs) {
            obs.value = null;
            obs.voided = true;
        }
    };


    var newObservation = function (concept, value, conceptSetConfig) {
        var observation = buildObservation(concept);
        return new Bahmni.ConceptSet.Observation(observation, {value: value}, conceptSetConfig, []);
    };

    var buildObservation = function(concept) {
        var conceptName = _.find(concept.names, {conceptNameType: "SHORT"}) || _.find(concept.names, {conceptNameType: "FULLY_SPECIFIED"});
        var displayLabel = conceptName ? conceptName.name : concept.shortName || concept.name.name;
        return { concept: concept, units: concept.units, label: displayLabel, possibleAnswers: concept.answers, groupMembers: [], comment: null};
    }
};
