import keyMirror from './KeyMirror';

const makeAsyncActions = prefix => keyMirror(prefix, {
    INDEX: null,
    REQUEST: null,
    SUCCESS: null,
    FAIL: null,
});

const makeActionCreator = type => payload => ({ type, payload });

const makeAsyncActionCreator = (actions) => {
    const actionCreator = makeActionCreator(actions.INDEX);
    actionCreator.request = makeActionCreator(actions.REQUEST);
    actionCreator.success = makeActionCreator(actions.SUCCESS);
    actionCreator.fail = makeActionCreator(actions.FAIL);
    return actionCreator;
};

export default { makeActionCreator, makeAsyncActions, makeAsyncActionCreator };
