import axios from "axios";
import moment from "moment";
import { BAHMNI_ORDERS_URL, ORDER_TYPE_URL, defaultDateFormat } from "../../constants";

export const DEFAULT_LAB_ORDER_BARCODE_CONFIG = {
  orderType: "Lab Order",
  conceptName: "eRegister Lab Order Number",
  numberOfVisits: 1,
  label: { width: "50mm", height: "25mm", showFacility: true },
};

export const buildConfig = (config = {}) => ({
  ...DEFAULT_LAB_ORDER_BARCODE_CONFIG,
  ...config,
  label: { ...DEFAULT_LAB_ORDER_BARCODE_CONFIG.label, ...(config.label || {}) },
});

export const fetchOrderTypeUuid = async (orderTypeName) => {
  const response = await axios.get(ORDER_TYPE_URL, {
    params: { v: "custom:(uuid,display)" },
    withCredentials: true,
  });
  const orderType = (response.data.results || []).find(
    (type) => type.display === orderTypeName
  );
  return orderType && orderType.uuid;
};

export const fetchOrdersWithObs = async ({
  patientUuid,
  orderTypeUuid,
  conceptName,
  numberOfVisits,
}) => {
  const response = await axios.get(BAHMNI_ORDERS_URL, {
    params: {
      patientUuid,
      orderTypeUuid,
      concept: conceptName,
      includeObs: true,
      numberOfVisits,
    },
    withCredentials: true,
  });
  return response.data || [];
};

const flattenObservations = (observations = []) =>
  observations.reduce(
    (all, obs) => all.concat(obs, flattenObservations(obs.groupMembers)),
    []
  );

const obsTime = (obs) =>
  new Date(obs.observationDateTime || obs.encounterDateTime || 0).getTime();

/** Returns the latest non-voided value of the given concept on an order, if any */
export const findLabOrderNumber = (order, conceptName) => {
  const matches = flattenObservations(order.bahmniObservations).filter(
    (obs) =>
      !obs.voided &&
      obs.concept &&
      obs.concept.name === conceptName &&
      obs.value !== null &&
      obs.value !== undefined &&
      String(obs.value).trim() !== ""
  );
  if (matches.length === 0) {
    return null;
  }
  const latest = matches.sort((a, b) => obsTime(b) - obsTime(a))[0];
  return String(latest.value).trim();
};

/** Maps bahmnicore orders to rows for orders that carry a lab order number, newest first */
export const toLabOrderRows = (orders = [], conceptName) =>
  orders
    .map((order) => ({
      orderUuid: order.orderUuid,
      labOrderNumber: findLabOrderNumber(order, conceptName),
      testName: order.concept
        ? order.concept.shortName || order.concept.name
        : order.conceptName,
      orderDate: order.orderDate,
    }))
    .filter((row) => row.labOrderNumber)
    .sort(
      (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    );

export const fetchLabOrderRows = async ({ patientUuid, config }) => {
  const orderTypeUuid = await fetchOrderTypeUuid(config.orderType);
  if (!orderTypeUuid) {
    return [];
  }
  const orders = await fetchOrdersWithObs({
    patientUuid,
    orderTypeUuid,
    conceptName: config.conceptName,
    numberOfVisits: config.numberOfVisits,
  });
  return toLabOrderRows(orders, config.conceptName);
};

/** Formats a patient name as "FAMILY, Given M." for specimen labels */
export const formatLabelName = (patient = {}) => {
  const family = (patient.familyName || "").toUpperCase();
  const given = patient.givenName || "";
  const middleInitial = patient.middleName
    ? ` ${patient.middleName.charAt(0).toUpperCase()}.`
    : "";
  const rest = `${given}${middleInitial}`.trim();
  if (!family) {
    return rest || patient.name || "";
  }
  return rest ? `${family}, ${rest}` : family;
};

export const formatLabelDate = (date) =>
  date ? moment(date).format(defaultDateFormat) : "";
