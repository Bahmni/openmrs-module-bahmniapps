import { React2AngularBridgeBuilder } from "../utils/bridge-builder";
import { PatientAlergiesControl } from "./Containers/patientAlergies/PatientAlergiesControl";
import { FormDisplayControl } from "./Containers/formDisplayControl/FormDisplayControl";
import { ProviderNotifications } from "./Containers/providerNotifications/ProviderNotifications";
import { OtNotesSavePopup, OtNotesDeletePopup } from "./Containers/otNotes/OtNotes";
import { PatientSearch } from "./Containers/patientSearch/PatientSearch";
import { CagRegister } from "./Containers/cagRegister/CagRegister";
import { LoginVersion } from "./Containers/loginVersion/LoginVersion";
import { LabOrderBarcode } from "./Containers/labOrderBarcode/LabOrderBarcode";

const MODULE_NAME = "bahmni.mfe.nextUi";

angular.module(MODULE_NAME, []);

const builder = new React2AngularBridgeBuilder({
  moduleName: MODULE_NAME,
  componentPrefix: "mfeNextUi",
});

builder.createComponentWithTranslationForwarding(
  "PatientAlergiesControl",
  PatientAlergiesControl
);

builder.createComponentWithTranslationForwarding(
  "FormDisplayControl",
  FormDisplayControl
);

builder.createComponentWithTranslationForwarding(
  "ProviderNotifications",
  ProviderNotifications
);

builder.createComponentWithTranslationForwarding(
    "OtNotesSavePopup",
    OtNotesSavePopup
);

builder.createComponentWithTranslationForwarding(
    "OtNotesDeletePopup",
    OtNotesDeletePopup
);

builder.createComponentWithTranslationForwarding(
  "PatientSearch",
  PatientSearch
);

builder.createComponentWithTranslationForwarding(
  "CagRegister",
  CagRegister
);

builder.createComponentWithTranslationForwarding(
  "LoginVersion",
  LoginVersion
);

builder.createComponentWithTranslationForwarding(
  "LabOrderBarcode",
  LabOrderBarcode
);
