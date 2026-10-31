import axios from "axios";
import moment from "moment";
import {
  BAHMNI_SQL_URL,
  LAB_RESULT_NOTIFICATIONS_SQL_PROPERTY,
  USER_URL,
  defaultDateTimeFormat,
} from "../../constants";

/** User property holding this user's read state, as JSON: { cutoff, read: { orderUuid: receivedAt } } */
export const READ_STATE_PROPERTY = "labResultNotifications";

/**
 * Timestamps (received_at, cutoff, read values) are all "YYYY-MM-DD HH:mm:ss" strings in the
 * database server's time, so they compare correctly as plain strings and never touch the browser clock.
 */
export const fetchLabResults = async () => {
  const response = await axios.get(BAHMNI_SQL_URL, {
    params: { q: LAB_RESULT_NOTIFICATIONS_SQL_PROPERTY },
    withCredentials: true,
  });
  return Array.isArray(response.data) ? response.data : [];
};

export const parseReadState = (value) => {
  if (!value) {
    return null;
  }
  try {
    const state = JSON.parse(value);
    if (typeof state.cutoff !== "string") {
      return null;
    }
    return { cutoff: state.cutoff, read: state.read || {} };
  } catch (e) {
    return null;
  }
};

/** First load for this user: everything received so far counts as read */
export const initialReadState = (results = []) => ({
  cutoff: results.reduce(
    (latest, result) => (result.received_at > latest ? result.received_at : latest),
    ""
  ),
  read: {},
});

/** Unread when it arrived after the cutoff and after the user last read that order */
export const isUnread = (result, state) => {
  if (!state || result.received_at <= state.cutoff) {
    return false;
  }
  const readAt = state.read[result.order_uuid];
  return !readAt || result.received_at > readAt;
};

/** Keeps read entries only for orders still in the list, so the property cannot grow without bound */
const pruneRead = (read, results) =>
  results.reduce((kept, result) => {
    if (read[result.order_uuid]) {
      kept[result.order_uuid] = read[result.order_uuid];
    }
    return kept;
  }, {});

export const markRead = (state, result, results) => ({
  cutoff: state.cutoff,
  read: pruneRead(
    { ...state.read, [result.order_uuid]: result.received_at },
    results
  ),
});

export const markAllRead = (state, results) => ({
  cutoff: state.cutoff,
  read: results.reduce(
    (read, result) => ({ ...read, [result.order_uuid]: result.received_at }),
    {}
  ),
});

const userUrl = (userUuid) => USER_URL.replace("{userUuid}", userUuid);

export const fetchUserProperties = async (userUuid) => {
  const response = await axios.get(userUrl(userUuid), {
    params: { v: "custom:(uuid,userProperties)" },
    withCredentials: true,
  });
  return (response.data && response.data.userProperties) || {};
};

export const fetchReadState = async (userUuid) =>
  parseReadState((await fetchUserProperties(userUuid))[READ_STATE_PROPERTY]);

/**
 * OpenMRS replaces the whole userProperties map on save, so re-read the latest map
 * and change only our property to avoid wiping preferences saved elsewhere.
 */
export const saveReadState = async (userUuid, state) => {
  const userProperties = await fetchUserProperties(userUuid);
  await axios.post(
    userUrl(userUuid),
    {
      userProperties: {
        ...userProperties,
        [READ_STATE_PROPERTY]: JSON.stringify(state),
      },
    },
    { withCredentials: true }
  );
};

export const getClinicalDashboardUrl = (patientUuid) =>
  `/bahmni/clinical/index.html#/default/patient/${patientUuid}/dashboard`;

export const formatReceivedAt = (receivedAt) =>
  receivedAt
    ? moment(receivedAt, "YYYY-MM-DD HH:mm:ss").format(defaultDateTimeFormat)
    : "";
