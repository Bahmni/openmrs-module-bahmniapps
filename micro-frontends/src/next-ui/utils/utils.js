import moment from "moment";
import { defaultDateTimeFormat } from "../constants";

export const formatDate = (value, format = defaultDateTimeFormat) => {
  return value ? moment(value).format(format) : value;
};
