import axios from "axios";
import { ENCOUNTER_BASE_URL } from "../../constants";
import { build } from "../FormDisplayControl/BuildFormView";
import { defaultDateFormat } from "../../constants";
import { formatDate } from "../../index";

var findByEncounterUuid = async (encounterUuid) => {
  const apiURL = ENCOUNTER_BASE_URL.replace("{encounterUuid}", encounterUuid);
  const params = {
    includeAll: false,
  };
  try {
    const response = await axios.get(apiURL, { params });
    if (response.status === 200) {
      return response.data;
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
  var encounter = await findByEncounterUuid(formMap.encounterUuid);
  var observationsForSelectedForm = [];
  encounter.observations.forEach(function (obs) {
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
  BOOLEAN: "Boolean",
};

export const formatDate = (value, format = "DD-MMM-YYYY") => {
  return value ? moment(value).format(format) : value;
};

export const getValue = (member) => {
  const { value = "", type, complexData = {}, valueAsString } = member;
  let finalValue = value?.shortName || value;
  switch (type) {
    case memberTypes.DATE:
      finalValue = formatDate(finalValue, "DD MMM YY");
      break;
    case memberTypes.DATETIME:
      finalValue = formatDate(finalValue, "DD MMM YY hh:mm a");
      break;
    case memberTypes.COMPLEX:
      finalValue = complexData?.display || finalValue;
      break;
    case memberTypes.BOOLEAN:
      finalValue = valueAsString;
      break;
  }
  return finalValue;
};
