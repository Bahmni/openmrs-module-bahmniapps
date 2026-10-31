import axios from "axios";
import moment from "moment";
import { BAHMNI_OBSERVATIONS_URL, defaultDateFormat } from "../../constants";

export const DEFAULT_BLOOD_DRAW_REMINDER_CONFIG = {
  enabled: true,
  conceptName: "CD4 Date Drawn",
  intervalMonths: 6,
};

export const buildConfig = (config = {}) => ({
  ...DEFAULT_BLOOD_DRAW_REMINDER_CONFIG,
  ...config,
});

/** Fetches the most recent value recorded for the "date drawn" concept, or null if none */
export const fetchLastDrawDate = async ({ patientUuid, conceptName }) => {
  const response = await axios.get(BAHMNI_OBSERVATIONS_URL, {
    params: { patientUuid, concept: conceptName, scope: "latest" },
    withCredentials: true,
  });
  const values = (response.data || [])
    .filter((obs) => !obs.voided && obs.value)
    .map((obs) => moment(obs.value))
    .filter((date) => date.isValid());
  if (values.length === 0) {
    return null;
  }
  return moment.max(values);
};

/**
 * Returns { lastDrawDate, dueDate, overdueDays } when the patient is due (or overdue),
 * otherwise null. Patients with no recorded draw date are not flagged.
 */
export const getBloodDrawStatus = (lastDrawDate, intervalMonths, today = moment()) => {
  if (!lastDrawDate) {
    return null;
  }
  const dueDate = moment(lastDrawDate).add(intervalMonths, "months").startOf("day");
  const now = moment(today).startOf("day");
  if (now.isBefore(dueDate)) {
    return null;
  }
  return {
    lastDrawDate: moment(lastDrawDate),
    dueDate,
    overdueDays: now.diff(dueDate, "days"),
  };
};

export const formatDate = (date) => moment(date).format(defaultDateFormat);

const dismissKey = (patientUuid, lastDrawDate) =>
  `bloodDrawReminderDismissed:${patientUuid}:${moment(lastDrawDate).format("YYYY-MM-DD")}`;

/** Dismissal lasts for the browser session and resets once a new draw date is recorded */
export const isDismissed = (patientUuid, lastDrawDate) => {
  try {
    return window.sessionStorage.getItem(dismissKey(patientUuid, lastDrawDate)) === "true";
  } catch (e) {
    return false;
  }
};

export const markDismissed = (patientUuid, lastDrawDate) => {
  try {
    window.sessionStorage.setItem(dismissKey(patientUuid, lastDrawDate), "true");
  } catch (e) {
    // sessionStorage unavailable; popup will simply show again next time
  }
};
