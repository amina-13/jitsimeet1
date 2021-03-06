import { redirectToStaticPage } from '../app/actions';
import { CONFERENCE_JOINED } from '../base/conference/actionTypes';
import {
    JitsiConferenceErrors,
    JitsiConferenceEvents
} from '../base/lib-jitsi-meet';
import { MiddlewareRegistry } from '../base/redux';

import { SET_DETAILS } from './actionTypes';
import { STATUSES } from './constants';
import logger from './logger';

/**
 * The redux middleware for jaas.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => async action => {
    switch (action.type) {
    case CONFERENCE_JOINED: {
        const { conference } = action;

        if (store.getState()['features/base/config'].iAmRecorder) {
            // We don't register anything on web if we are in iAmRecorder mode
            return;
        }

        conference.on(
            JitsiConferenceEvents.CONFERENCE_ERROR, (errorType, errorMsg) => {
                errorType === JitsiConferenceErrors.SETTINGS_ERROR && logger.error(errorMsg);
            });
        break;
    }

    case SET_DETAILS: {
        const { status } = action.payload;

        if (status === STATUSES.BLOCKED) {
            store.dispatch(redirectToStaticPage('/static/planLimit.html'));
        }
        break;
    }
    }

    return next(action);
});
