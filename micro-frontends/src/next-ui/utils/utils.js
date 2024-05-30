import moment from "moment";
import { defaultDateTimeFormat } from "../constants";
import { differenceInYears } from "date-fns";

export const formatDate = (value, format = defaultDateTimeFormat) => {
    return value ? moment(value).format(format) : value;
};

export const formatArrayDateToDefaultDateFormat = (dateTimeArray) => {
  const year = dateTimeArray[0];
  const month = dateTimeArray[1];
  const day = dateTimeArray[2];

  const formattedDate = `${day}/${month}/${year}`;

  return formattedDate;
};

export const calculateAgeFromEpochDOB = (epochDateOfBirth) => {
  const dateOfBirth = new Date(epochDateOfBirth);
  const currentDate = new Date();
  const ageInYears = differenceInYears(currentDate, dateOfBirth);
  return ageInYears;
};
