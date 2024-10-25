import React from "react";
import moment from "moment";
import { defaultDateTimeFormat } from "../constants";
import { FormattedMessage } from "react-intl";

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

export const formatGender = (gender, intl) => {
  let formattedGender;

  if (gender === "M") {
    formattedGender = intl.formatMessage({id: "MALE",defaultMessage: "Male"});
  } else if (gender === "F") {
    formattedGender = intl.formatMessage({id: "FEMALE",defaultMessage: "Female"});
  } else {
    formattedGender = intl.formatMessage({id: "OTHER",defaultMessage: "Other"});
  }

  return formattedGender;
};

export const calculateAgeFromEpochDOB = (epochDateOfBirth) => {
  const dob = moment(epochDateOfBirth);
  const now = moment();

  const years = now.diff(dob, 'years');
  dob.add(years, 'years');

  const months = now.diff(dob, 'months');
  dob.add(months, 'months');

  const days = now.diff(dob, 'days');

  return `${years} years ${months} months ${days} days`;
};

export const parseDateArray = (dateArray) => {
  const dateString = dateArray.join('-');
  return moment(dateString, 'YYYY-MM-DD-HH-mm-ss');
};

