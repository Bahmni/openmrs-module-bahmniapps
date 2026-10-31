import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { FormattedMessage, useIntl } from "react-intl";
import "./labResultNotifications.scss";
import { I18nProvider } from "../../Components/i18n/I18nProvider";
import {
  fetchLabResults,
  fetchReadState,
  formatReceivedAt,
  getClinicalDashboardUrl,
  initialReadState,
  isUnread,
  markAllRead,
  markRead,
  saveReadState,
} from "../../utils/labResultNotifications/LabResultNotificationUtils";

export const POLL_INTERVAL_MS = 5 * 60 * 1000;

function LabResultNotificationsBell({ userUuid }) {
  const intl = useIntl();
  const [results, setResults] = useState([]);
  const [readState, setReadState] = useState(null);
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ top: 0, right: 0 });
  const containerRef = useRef(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const [rows, savedState] = await Promise.all([
        fetchLabResults(),
        fetchReadState(userUuid),
      ]);
      let state = savedState;
      if (!state) {
        state = initialReadState(rows);
        await saveReadState(userUuid, state);
      }
      if (mountedRef.current) {
        setResults(rows);
        setReadState(state);
      }
    } catch (e) {
      console.error(e);
    }
  }, [userUuid]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    // The home header clips overflow, so the panel is fixed-positioned under the bell instead of absolute
    const placePanel = () => {
      if (containerRef.current) {
        const bounds = containerRef.current.getBoundingClientRect();
        setPanelPosition({
          top: bounds.bottom,
          right: Math.max(document.documentElement.clientWidth - bounds.right, 0),
        });
      }
    };
    placePanel();
    window.addEventListener("resize", placePanel);
    window.addEventListener("scroll", placePanel, true);
    const closeOnOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("resize", placePanel);
      window.removeEventListener("scroll", placePanel, true);
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const unreadCount = results.filter((result) => isUnread(result, readState)).length;

  const updateReadState = async (state) => {
    setReadState(state);
    try {
      await saveReadState(userUuid, state);
    } catch (e) {
      console.error(e);
    }
  };

  const openResult = async (event, result) => {
    event.preventDefault();
    if (readState) {
      await updateReadState(markRead(readState, result, results));
    }
    window.location.assign(getClinicalDashboardUrl(result.patient_uuid));
  };

  const bellLabel = intl.formatMessage({
    id: "LAB_RESULT_NOTIFICATIONS_BELL_LABEL",
    defaultMessage: "Lab results",
  });

  return (
    <div className="lab-result-notifications" ref={containerRef}>
      <button
        type="button"
        className="lab-result-notifications-bell"
        aria-label={bellLabel}
        title={bellLabel}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <i className="fa fa-bell fa-white small" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="lab-result-notifications-dot" data-testid="lab-result-notifications-dot" />
        )}
      </button>
      {open && (
        <div className="lab-result-notifications-panel" style={panelPosition}>
          <div className="lab-result-notifications-header">
            <span className="lab-result-notifications-title">
              {unreadCount > 0 ? (
                intl.formatMessage(
                  {
                    id: "LAB_RESULT_NOTIFICATIONS_NEW_COUNT",
                    defaultMessage:
                      "{count, plural, one {# new result} other {# new results}}",
                  },
                  { count: unreadCount }
                )
              ) : (
                <FormattedMessage id="LAB_RESULT_NOTIFICATIONS_HEADING" defaultMessage="Lab results" />
              )}
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="lab-result-notifications-mark-all"
                onClick={() => updateReadState(markAllRead(readState, results))}
              >
                <FormattedMessage
                  id="LAB_RESULT_NOTIFICATIONS_MARK_ALL_READ"
                  defaultMessage="Mark all as read"
                />
              </button>
            )}
          </div>
          {results.length === 0 ? (
            <p className="lab-result-notifications-empty">
              <FormattedMessage
                id="LAB_RESULT_NOTIFICATIONS_EMPTY"
                defaultMessage="No results in the last 30 days"
              />
            </p>
          ) : (
            <ul className="lab-result-notifications-list">
              {results.map((result) => (
                <li
                  key={result.order_uuid}
                  className={
                    isUnread(result, readState)
                      ? "lab-result-notifications-item unread"
                      : "lab-result-notifications-item"
                  }
                >
                  <a
                    href={getClinicalDashboardUrl(result.patient_uuid)}
                    onClick={(event) => openResult(event, result)}
                  >
                    <span className="lab-result-notifications-patient">
                      {result.patient_name} ({result.identifier})
                    </span>
                    <span className="lab-result-notifications-test">
                      {result.test_name}
                      {result.lab_order_number ? ` · ${result.lab_order_number}` : ""}
                    </span>
                    <span className="lab-result-notifications-date">
                      {formatReceivedAt(result.received_at)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

LabResultNotificationsBell.propTypes = {
  userUuid: PropTypes.string.isRequired,
};

/** NOTE: react2angular may omit props at start — keep PropTypes so the bridge mounts. */
export function LabResultNotifications(props) {
  const userUuid = props.hostData && props.hostData.userUuid;
  if (!userUuid) {
    return null;
  }
  return (
    <I18nProvider>
      <LabResultNotificationsBell userUuid={userUuid} />
    </I18nProvider>
  );
}

LabResultNotifications.propTypes = {
  hostData: PropTypes.shape({
    userUuid: PropTypes.string,
  }),
  hostApi: PropTypes.object,
  tx: PropTypes.func,
  appService: PropTypes.object,
};
