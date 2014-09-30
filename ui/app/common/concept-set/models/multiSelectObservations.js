Bahmni.ConceptSet.MultiSelectObservations = function(conceptSetConfig) {
    var self = this;
    this.multiSelectObservationsMap = {};

    this.map = function(memberOfCollection) {
        memberOfCollection.forEach(function(member) {
            if(isMultiSelectable(member.concept, conceptSetConfig)) {
                add(member.concept, member, memberOfCollection);
            }
        });
        insertMultiSelectObsInExistingOrder(memberOfCollection);
    };

    var isMultiSelectable = function(concept, conceptSetConfig) {
        return conceptSetConfig[concept.name] && conceptSetConfig[concept.name].multiSelect;
    };

    var insertMultiSelectObsInExistingOrder = function(memberOfCollection) {
        getAll().forEach(function(multiObs){
            var index = _.findIndex(memberOfCollection, function(member){
                return member.concept.name === multiObs.concept.name;
            });
            memberOfCollection.splice(index, 0, multiObs);
        });
    };

    var add = function(concept, obs, memberOfCollection) {
        var concept_name = concept.name.name || concept.name;
        self.multiSelectObservationsMap[concept_name] = self.multiSelectObservationsMap[concept_name] ||  new Bahmni.ConceptSet.MultiSelectObservation(concept, memberOfCollection, conceptSetConfig);
        self.multiSelectObservationsMap[concept_name].add(obs);
    };

    var getAll = function() {
        return _.values(self.multiSelectObservationsMap);
    };
};


Bahmni.ConceptSet.MultiSelectObservation = function (concept, memberOfCollection, conceptSetConfig) {
    var self = this;
    this.label = concept.name;
    this.isMultiSelect = true;
    this.selectedObs = {};
    this.concept = concept;
    this.concept.answers = this.concept.answers || [];
    this.groupMembers = [];
    this.provider = "";
    this.observationDateTime = "";

    this.possibleAnswers = self.concept.answers.map(function(answer) {
        var cloned = _.cloneDeep(answer);
        if(answer.name.name) cloned.name = answer.name.name;
        return cloned;
    });

    this.getPossibleAnswers = function() {
        return this.possibleAnswers;
    };

    this.add = function(obs){
        if(obs.value) {
            self.selectedObs[obs.value.name] = obs;

            if (!this.provider && self.selectedObs[obs.value.name].provider) {
                self.provider = self.selectedObs[obs.value.name].provider.name;
            }
            var currentObservationDateTime = self.selectedObs[obs.value.name].observationDateTime;
            if (this.observationDateTime < currentObservationDateTime) {
                self.observationDateTime = currentObservationDateTime;
            }
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
        memberOfCollection.push(obs);
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
        return { concept: concept, units: concept.units, label: displayLabel, possibleAnswers: self.concept.answers, groupMembers: [], comment: null};
    }

    this.getValues = function(){
        var values = [];
        _.values(self.selectedObs).forEach(function(obs){
            values.push(obs.value.name);
        });
        return values.join(" , ");
    }
};
