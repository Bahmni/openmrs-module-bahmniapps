import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { Modal } from "carbon-components-react";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "./bloodDrawReminder.scss";
import { I18nProvider } from "../../Components/i18n/I18nProvider";
import {
  buildConfig,
  fetchLastDrawDate,
  formatDate,
  getBloodDrawStatus,
  isDismissed,
  markDismissed,
} from "../../utils/BloodDrawReminder/BloodDrawReminderUtils";

/** Font Awesome 6 Free solid "fa-droplet" icon (https://fontawesome.com, CC BY 4.0).
 * Inlined because the app ships Font Awesome 4.3, which has no fa-droplet glyph. */
function DropletIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="fa-solid fa-droplet blood-draw-reminder-icon"
      data-testid="blood-draw-reminder-icon"
      viewBox="0 0 384 512"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M192 512C86 512 0 426 0 320C0 228.8 130.2 57.7 166.6 11.7C172.6 4.2 181.5 0 191.1 0h1.8c9.6 0 18.5 4.2 24.5 11.7C253.8 57.7 384 228.8 384 320c0 106-86 192-192 192zM96 336c0-8.8-7.2-16-16-16s-16 7.2-16 16c0 61.9 50.1 112 112 112c8.8 0 16-7.2 16-16s-7.2-16-16-16c-44.2 0-80-35.8-80-80z" />
    </svg>
  );
}

/** NOTE: for reasons known only to react2angular,
 * any functions passed in as props will be undefined at the start, even ones inside other objects
 * so you need to use the conditional operator like props.hostApi?.callback even though it is a mandatory prop
 */
export function BloodDrawReminder(props) {
  const { hostData } = props;
  const { patientUuid, config: reminderConfig } = hostData || {};
  const config = useMemo(() => buildConfig(reminderConfig || {}), [reminderConfig]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!patientUuid || !config.enabled) {
      return undefined;
    }

    fetchLastDrawDate({ patientUuid, conceptName: config.conceptName })
      .then((lastDrawDate) => {
        const result = getBloodDrawStatus(lastDrawDate, config.intervalMonths);
        if (!cancelled && result && !isDismissed(patientUuid, result.lastDrawDate)) {
          setStatus(result);
        }
      })
      .catch((e) => {
        console.error(e);
      });

    return () => {
      cancelled = true;
    };
  }, [patientUuid, config.enabled, config.conceptName, config.intervalMonths]);

  if (!status) {
    return null;
  }

  const close = () => {
    markDismissed(patientUuid, status.lastDrawDate);
    setStatus(null);
  };

  return (
    <I18nProvider>
      <Modal
        open
        size="sm"
        className="next-ui blood-draw-reminder"
        modalHeading={
          <span className="blood-draw-reminder-heading">
            <DropletIcon />
            <FormattedMessage id={"BLOOD_DRAW_REMINDER_HEADING"} defaultMessage={"Blood Draw Due"} />
          </span>
        }
        primaryButtonText={<FormattedMessage id={"BLOOD_DRAW_REMINDER_OK"} defaultMessage={"OK"} />}
        onRequestSubmit={close}
        onRequestClose={close}
      >
        <p className="blood-draw-reminder-message">
          <FormattedMessage
            id={"BLOOD_DRAW_REMINDER_MESSAGE"}
            defaultMessage={"This patient is due for a blood draw. Blood should be drawn every {months} months."}
            values={{ months: config.intervalMonths }}
          />
        </p>
        <dl className="blood-draw-reminder-details">
          <dt>
            <FormattedMessage id={"BLOOD_DRAW_REMINDER_LAST_DRAWN"} defaultMessage={"Last drawn"} />
          </dt>
          <dd data-testid="blood-draw-last-drawn">{formatDate(status.lastDrawDate)}</dd>
          <dt>
            <FormattedMessage id={"BLOOD_DRAW_REMINDER_DUE_DATE"} defaultMessage={"Due date"} />
          </dt>
          <dd data-testid="blood-draw-due-date">
            {formatDate(status.dueDate)}
            {status.overdueDays > 0 && (
              <span className="blood-draw-reminder-overdue">
                {" "}
                <FormattedMessage
                  id={"BLOOD_DRAW_REMINDER_OVERDUE"}
                  defaultMessage={"({days, plural, one {# day} other {# days}} overdue)"}
                  values={{ days: status.overdueDays }}
                />
              </span>
            )}
          </dd>
        </dl>
      </Modal>
    </I18nProvider>
  );
}

BloodDrawReminder.propTypes = {
  hostData: PropTypes.shape({
    patientUuid: PropTypes.string,
    config: PropTypes.object,
  }).isRequired,
  tx: PropTypes.func,
};
