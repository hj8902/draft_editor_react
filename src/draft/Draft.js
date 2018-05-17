import React from 'react';
import ClassNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CompositeDecorator, EditorState, ContentState, convertToRaw, convertFromRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { Segment } from 'semantic-ui-react';

import AddImage from './AddImage';
import SaveButton from './SaveButton';
import Preview from './Preview';

import { UPDATE } from './DraftAction';
import { deleteImages } from './DraftAPI';

import Styles from './draft.scss';

const cx = ClassNames.bind(Styles);

class DraftComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editorState: this.props.editorState, focusKey: null };
        this.onEditorStateChange = this.onEditorStateChange.bind(this);
        this.compareAddedImages = this.compareAddedImages.bind(this);
    }

    onEditorStateChange(editorState, clear = false) {
        const selectionState = editorState.getSelection();
        if (!clear) this.compareAddedImages(editorState);
        this.props.update(editorState);
        this.setState({ editorState, focusKey: selectionState.getFocusKey() });
    }

    compareAddedImages(changedEditorState) {
        const { editorState } = this.state;
        const contentState = convertToRaw(editorState.getCurrentContent());
        const changedContentState = convertToRaw(changedEditorState.getCurrentContent());

        const entityMap = contentState.entityMap;
        const changedEntityMap = changedContentState.entityMap;

        const entityKeys = Object.keys(entityMap);
        const changedEntityKeys = Object.keys(changedEntityMap);

        const deletedKeys = entityKeys.filter(key => changedEntityKeys.indexOf(key) < 0);

        // First, let the before state compares with the new state.
        // Then, If there are removed images, request to server with image ids.
        if (deletedKeys.length > 0) {
            const deletedTempIds = deletedKeys
                .map(key => entityMap[key].data)
                .filter(data => data.temp)
                .map(data => data.temp.id);
            if (deletedTempIds.length > 0) deleteImages(deletedTempIds);
        }
    }

    render() {
        const { editorState, focusKey } = this.state;
        return (
            <div>
                <Segment basic clearing className={cx('no-padding')}>
                    <div className={cx('left')} ><AddImage onEditorStateChange={this.onEditorStateChange} focusKey={focusKey} /></div>
                    <div className={cx('right')} ><SaveButton onEditorStateChange={this.onEditorStateChange}/></div>
                </Segment>
                <Editor
                    editorState={editorState}
                    onEditorStateChange={this.onEditorStateChange}
                    toolbar={
                        {
                            options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'image', 'history'],
                            inline: {
                                inDropdown: false,
                                className: undefined,
                                component: undefined,
                                dropdownClassName: undefined,
                                options: ['bold', 'italic', 'underline', 'strikethrough'],
                            },
                            blockType: {
                                inDropdown: true,
                                options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
                                className: undefined,
                                component: undefined,
                                dropdownClassName: undefined,
                            },
                            fontSize: {
                                options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
                                className: undefined,
                                component: undefined,
                                dropdownClassName: undefined,
                            },
                            fontFamily: {
                                options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
                                className: undefined,
                                component: undefined,
                                dropdownClassName: undefined,
                            },
                            list: {
                                inDropdown: false,
                                className: undefined,
                                component: undefined,
                                dropdownClassName: undefined,
                                options: ['unordered', 'ordered'],
                            },
                            image: {
                                className: undefined,
                                component: undefined,
                                popupClassName: undefined,
                                urlEnabled: true,
                                uploadEnabled: true,
                                alignmentEnabled: true,
                                previewImage: true,
                                inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
                                alt: { present: false, mandatory: false },
                                defaultSize: {
                                    height: 'auto',
                                    width: 'auto',
                                },
                            },
                            history: {
                                inDropdown: false,
                                className: undefined,
                                component: undefined,
                                dropdownClassName: undefined,
                                options: ['undo', 'redo'],
                            },
                        }
                    }/>
                <Preview />
            </div>
        );
    }
}

export { DraftComponent };

// container part
// for mappping props to redux data
const mapStateToProps = state => ({ editorState: state.draft.editorState });

// in component, disptch after triggering props
const mapDispatchToProps = dispatch => ({
    update: editorState => dispatch(UPDATE.action({ editorState })),
});

// connect component with data layer
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DraftComponent);
