import axios from "axios";
import { ENCOUNTER_BASE_URL } from "../../constants";
import { build } from "../FormDisplayControl/BuildFormView";
import { defaultDateFormat } from "../../constants";
import { formatDate } from "../../utils/utils";

var findByEncounterUuid = async (encounterUuid) => {
  const apiURL = ENCOUNTER_BASE_URL.replace("{encounterUuid}", encounterUuid);
  const params = {
    includeAll: false,
  };
  try {
    const response = await axios.get(apiURL, { params });
    if (response.status === 200) {
      return response.data.observations;
    }
    return [];
  } catch (error) {
    console.error("error -> ", error);
  }
};

var getFormNameAndVersion = function (path) {
  var formNameAndVersion = path.split("/")[0].split(".");
  return {
    formName: formNameAndVersion[0],
    formVersion: formNameAndVersion[1],
  };
};

export const buildFormMap = async (formMap) => {
  var observations = await findByEncounterUuid(formMap.encounterUuid);
  var observationsForSelectedForm = [];
  observations.forEach(function (obs) {
    if (obs.formFieldPath) {
      var obsFormNameAndVersion = getFormNameAndVersion(obs.formFieldPath);
      if (obsFormNameAndVersion.formName === formMap.formName) {
        observationsForSelectedForm.push(obs);
      }
    }
  });
  return await build(
    [{ value: observationsForSelectedForm }],
    formMap.hasNoHierarchy
  );
};

export const subLabels = (subItem) => {
  let label = "";
  const { lowNormal, hiNormal } = subItem;
  if (lowNormal && hiNormal) {
    label = `(${lowNormal} - ${hiNormal})`;
  } else if (lowNormal && !hiNormal) {
    label = `(>${lowNormal})`;
  } else if (!lowNormal && hiNormal) {
    label = `(<${hiNormal})`;
  }
  return label;
};

export const isAbnormal = (interpretation) =>
  interpretation && interpretation.toUpperCase() === "ABNORMAL";

export const memberTypes = {
  DATE: "Date",
  DATETIME: "Datetime",
  COMPLEX: "Complex",
};

export const getValue = (member) => {
  const { value = "", type, complexData = {} } = member;
  let finalValue = value?.shortName || value;
  switch (type) {
    case memberTypes.DATE:
      finalValue = formatDate(finalValue, defaultDateFormat);
      break;
    case memberTypes.DATETIME:
      finalValue = formatDate(finalValue);
      break;
    case memberTypes.COMPLEX:
      finalValue = complexData?.display || finalValue;
      break;
  }
  return finalValue;
};
