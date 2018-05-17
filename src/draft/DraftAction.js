import Helper from '../libs/ActionHelper';

const UPDATE_PREFIX = 'app/draft/UPDATE';
const UPDATE_ACTION = Helper.makeActionCreator(UPDATE_PREFIX);

export const UPDATE = { type: UPDATE_PREFIX, action: UPDATE_ACTION };

export default { UPDATE };
