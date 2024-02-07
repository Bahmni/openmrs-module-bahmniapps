import moment from "moment";
import { defaultDateTimeFormat } from "../constants";

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
  const dob = moment(epochDateOfBirth);
  const now = moment();
  const years = now.diff(dob, 'years');
  dob.add(years, 'years');
  const days = now.diff(dob, 'days');
  return `${years} years ${days} days`;
};

export const parseDateArray = (dateArray) => {
  const dateString = dateArray.join('-');
  return moment(dateString, 'YYYY-MM-DD-HH-mm-ss');
};

