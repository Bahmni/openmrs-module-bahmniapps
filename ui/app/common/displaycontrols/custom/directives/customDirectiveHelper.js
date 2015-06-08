'use strict';

/**
 * CustomDirectiveHelper is an object that exists to supply utilities to the custom directive
 */

function CustomDirectiveHelper(scope,$http,observationsService,$compile,elem){
    var self = this; // this silliness is because the execution context is lost inside the angular promises
    self.scope=scope;
    self.$http=$http;
    self.observationsService=observationsService;
    self.$compile=$compile;
    self.elem=elem;

    /**
     * getObservationsAndCompileTemplate waits for the observations promise to succeed and then compiles the template using those observations
     */
    var getObservationsAndCompileTemplate = function() {
	var observationsPromise = observationsService.getObservations(self.scope.patient.uuid,self.scope.config.conceptNames,"latest",self.scope.visitUuid);
	observationsPromise.then(obsSuccessFunction,obsFailureFunction);
    };

    /**
     * obs successFunction and failureFunction for the observationsPromise
     */
    var obsSuccessFunction = function (data){
	var observations=data.data;
	self.scope.observations = observations;
	compileTemplate();
    };
    var obsFailureFunction = function(data){
	var observations=[];
	self.scope.observations = observations;
	compileTemplate();
    };

    /**
     * success and failure functions for the templatePromise
     * When the template promise succeeds, it will get the required observations and compile the template
     */
    this.templateSuccessFn = function(data){
	self.scope.template = data.data;
	getObservationsAndCompileTemplate();
    };
    
    this.templateFailureFn = function(data){
	elem.append("Failed to load custom template.");
    };

    /**
     * compileTemplate compiles the html string scope.template. It assumes that scope.observations has already been set to the desired observations
     */
    var compileTemplate = function(){
	var compileFn = self.$compile(self.scope.template);
	var content = compileFn(self.scope);
	elem.append(content);
    };

}

/**
 * loadScopeAndCompileTemplate loads the scope with the requested objects and compiles the template using the updated scope
 */
CustomDirectiveHelper.prototype.loadScopeAndCompileTemplate = function(){
    var templateUrl = "../../bahmni_config/openmrs/customHTMLTemplates/" + this.scope.templateurl;
    var templatePromise = this.$http.get(templateUrl);
    templatePromise.then(this.templateSuccessFn, this.templateFailureFn);
};