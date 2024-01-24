import moment from "moment";
import { defaultDateTimeFormat } from "../constants";
import { differenceInYears } from "date-fns";

export const formatDate = (value, format = defaultDateTimeFormat) => {
  return value ? moment(value).format(format) : value;
};

export const formatArrayDateToDefaultDateFormat = (dateTimeArray) => {
  const dateTimeMoment = moment(dateTimeArray);
  dateTimeMoment.month(dateTimeArray[1] - 1);
  return formatDate(dateTimeMoment, "DD/MM/YYYY");
};

export const calculateAgeFromEpochDOB = (epochDateOfBirth) => {
  const dateOfBirth = new Date(epochDateOfBirth);
  const currentDate = new Date();
  const ageInYears = differenceInYears(currentDate, dateOfBirth);
  return ageInYears;
};