import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { UPDATE } from './DraftAction';

const restoreContentState = () => {
    const contentState = window.localStorage.getItem('contentState');
    if (!contentState) return null;
    return EditorState.createWithContent(convertFromRaw(JSON.parse(contentState)));
};

const saveContentState = (contentState) => {
    window.localStorage.setItem('contentState', JSON.stringify(convertToRaw(contentState)));
};

export const init = { editorState: restoreContentState() || EditorState.createEmpty() };

export default function (state = init, action) {
    switch (action.type) {
    case UPDATE.type: {
        const { editorState } = action.payload;
        const contentState = editorState.getCurrentContent();
        saveContentState(contentState);
        return { editorState: EditorState.createWithContent(contentState) };
    }
    default:
        return state;
    }
}
