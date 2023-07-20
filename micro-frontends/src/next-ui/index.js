import { react2angular } from "react2angular";
import { PatientAlergiesControl } from "./patientAlergies/PatientAlergiesControl";

const moduleName = "bahmni.mfe.nextUi";
angular.module(moduleName, []);

angular
  .module(moduleName)
  .component("mfeNextUiPatientAlergiesControl", react2angular(PatientAlergiesControl));
