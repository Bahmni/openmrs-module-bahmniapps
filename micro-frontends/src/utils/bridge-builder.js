import { react2angular } from "react2angular";
/**
 * Creates a new instance of React2AngularBridgeBuilder. This helper utility creates angular wrapper components
 * for you with sensible defaults
 * 
 * @constructor
 * @param {Object} options - The options object.
 * @param {string} options.moduleName - The name of the Angular module to add the components to
 * @param {string} options.componentPrefix - The prefix to use for Angular component names.
 */
export function React2AngularBridgeBuilder({ moduleName, componentPrefix }) {
  this.moduleName = moduleName;
  this.componentPrefix = componentPrefix;
}

// The primary 2 apis
React2AngularBridgeBuilder.prototype.createComponent = createComponent;
React2AngularBridgeBuilder.prototype.createComponentWithTranslationForwarding =
  createComponentWithTranslationForwarding;

// Additional private stuff
React2AngularBridgeBuilder.prototype.__createAngularNames =
  __createAngularNames;

/** 
 * Simple private(ish) function which creates the names required for an angular component wrapper 
 * Given a component prefix of 'mfePrefix' and a component name of 'MyComponent', this function will create
 * the following names:
 * 
 * {
 *   remoteComponentName: 'mfePrefixMyComponentRemote'
 *   componentName: 'mfePrefixMyComponent'
 *   templateNameForRemote: 'mfe-prefix-my-component-remote'
 * }
*/
function __createAngularNames(reactComponentName) {
  const base = capitaliseFirst(reactComponentName);
  const remoteComponentName = `${this.componentPrefix}${base}Remote`;

  return {
    remoteComponentName,
    componentName: `${this.componentPrefix}${base}`,
    templateNameForRemote: camelCaseToHyphenatedLowerCase(remoteComponentName),
  };
}

/**
 * 
 * Registers the given component with angular and creates an intermediatary wrapper component which forwards
 * the translation function as 'tx' to the react component.
 * 
 * Given a name of 'MyComponent' and a prefix of 'mfePrefix', this function will create the following components:
 * 1/2. mfePrefixMyComponentRemote - Core react component wrapped
 * 2/2. mfePrefixMyComponent - Angular component which forwards hostData, hostApi, and tx to the remote component
 * 
 * @param {string} name name of the component in PascalCase
 * @param {function} reactComponent the react component to wrap
 * @returns {object} { componentName: 'mfePrefixMyComponent' }
 */
function createComponentWithTranslationForwarding(name, reactComponent) {
  const { remoteComponentName, componentName, templateNameForRemote } =
    this.__createAngularNames(name);

  angular
    .module(this.moduleName)
    .component(remoteComponentName, react2angular(reactComponent));

  angular.module(this.moduleName).component(componentName, {
    controller: translationForwardingController,
    bindings: {
      hostData: "=",
      hostApi: "=",
    },
    template: `
      <${templateNameForRemote}
        host-data="hostData"
        host-api="hostApi"
        tx="tx"
        app-service="appService"
      ></${templateNameForRemote}>
    `,
  });

  return {
    componentName,
  };
}


/**
 * Registers the give react component with the angular module wrapping it with react2angular
 * 
 * Given a name of 'MyComponent' and a prefix of 'mfePrefix', this function will create the following components:
 * 1/1. mfePrefixMyComponent - Angular component which wraps the react component
 * 
 * @param {string} name name of the component
 * @param {function} reactComponent the react component to wrap
 * @returns {object} { componentName: 'mfePrefixMyComponent' }
 */
function createComponent(name, reactComponent) {
  const { componentName } = this.__createAngularNames(name);

  angular
    .module(this.moduleName)
    .component(componentName, react2angular(reactComponent));

  return { componentName };
}

/**
 * A controller which forwards hostData & hostApi, but along with that, forwards the translation
 * function as tx
 */
function translationForwardingController($scope, $translate, appService) {
  const vm = this;
  $scope.hostData = vm.hostData;
  $scope.hostApi = vm.hostApi;
  $scope.tx = $translate.instant.bind($translate);
  $scope.appService = appService;
}

translationForwardingController.$inject = ["$scope", "$translate","appService"];

/** Utilities */
function camelCaseToHyphenatedLowerCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function capitaliseFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
