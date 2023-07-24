import { react2angular } from "react2angular";
import { PatientAlergiesControl } from "./patientAlergies/PatientAlergiesControl";

const moduleName = "bahmni.mfe.nextUi";
angular.module(moduleName, []);

angular
  .module(moduleName)
  .component("mfeNextUiPatientAlergiesControlRemote", react2angular(PatientAlergiesControl));

function nextUIPatientAlergiesControlController ($scope, $translate) {
  const vm = this;
  $scope.hostData = vm.hostData;
  $scope.hostApi = vm.hostApi;
  $scope.translations = {
    ipdDemoKey: $translate.instant("DASHBOARD_TAB_IPD_DEMO_KEY"),
  };
}

nextUIPatientAlergiesControlController.$inject = ["$scope", "$translate"];

angular.module(moduleName).component("mfeNextUiPatientAlergiesControl", {
  controller: nextUIPatientAlergiesControlController,
  bindings: {
    hostData: "=",
    hostApi: "=",
  },
  template: `
    <mfe-next-ui-patient-alergies-control-remote
      host-data="hostData"
      host-api="hostApi"
      translations="translations"
    ></mfe-next-ui-patient-alergies-control-remote>
  `,
});