import React from 'react';
import ClassNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { Map, List, OrderedMap } from 'immutable';
import { cloneDeep, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { EditorState, ContentBlock, AtomicBlockUtils, genKey } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { Dimmer, Loader, Button, Icon, Modal, Input, Image } from 'semantic-ui-react';

import { uploadImage, deleteImage } from './DraftAPI';
import Styles from './draft.scss';

const cx = ClassNames.bind(Styles);

const insertAfterToOrderedMap = (map, focusKey, key, val) => {
    const [...keys] = map.keys();
    return OrderedMap().withMutations((r) => {
        keys.forEach((k) => {
            r.set(k, map.get(k));
            if (focusKey === k) r.set(key, val);
        });
    });
};

const createEmptyBlock = () => new ContentBlock({
    key: genKey(),
    type: 'unstyled',
    text: '',
    characterList: List(),
});

const isAtomic = type => type === 'atomic';

/**
 * Component for adding image as a file
 * Default plugin does not support to delete uploaded image.
 */
class AddImageComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editorState: props.editorState,
            open: false,
            loading: false,
            uploaded: null,
            focusKey: null,
        };

        this.nextState = this.nextState.bind(this);
        this.show = this.show.bind(this);
        this.close = this.close.bind(this);
        this.selectFile = this.selectFile.bind(this);
        this.stateForLoader = this.stateForLoader.bind(this);
        this.clean = this.clean.bind(this);
        this.load = this.load.bind(this);
        this.upload = this.upload.bind(this);
        this.delete = this.delete.bind(this);
        this.insert = this.insert.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const nextState = this.nextState();
        nextState.focusKey = nextProps.focusKey;
        nextState.editorState = nextProps.editorState;
        this.setState(nextState);
    }

    nextState() {
        const current = this.state;
        const next = cloneDeep({
            open: current.open,
            loading: current.loading,
            uploaded: current.uploaded,
            focusKey: current.focusKey,
        });

        next.editorState = EditorState.createWithContent(current.editorState.getCurrentContent());
        return next;
    }

    show() {
        const nextState = this.nextState();
        nextState.open = true;
        this.setState(nextState);
    }

    close() {
        const nextState = this.nextState();
        nextState.loading = false;
        nextState.open = false;
        nextState.uploaded = null;
        this.setState(nextState);
    }

    selectFile(e) {
        const files = e.target.files;
        if (isEmpty(files)) return;

        this.load();
        this.upload(files[0]);

        e.target.value = '';
    }

    load() {
        this.setState(this.stateForLoader(true));
    }

    stateForLoader(loading = false) {
        const nextState = this.nextState();
        nextState.loading = loading;
        return nextState;
    }

    upload(image) {
        uploadImage(image)
            .then((res) => {
                const { payload } = res;
                const nextState = this.stateForLoader();
                nextState.uploaded = payload.temp;
                this.setState(nextState);
            }).catch((error) => {
                this.setState(this.stateForLoader());
            });
    }

    clean() {
        const nextState = this.stateForLoader();
        nextState.uploaded = null;
        this.setState(nextState);
    }

    delete() {
        const { uploaded } = this.state;
        if (!uploaded) {
            this.close();
            return;
        }

        this.load();
        deleteImage(uploaded.id)
            .then(res => this.clean())
            .catch(error => this.clean());
    }

    insert() {
        const { uploaded, editorState, focusKey } = this.state;
        if (!uploaded) {
            this.close();
            return;
        }

        // Image type
        const urlType = 'IMAGE';
        // Image data
        // Width and Height are not implemented.
        // Temp is needed for deleting when it is not needed anymore.
        const data = {
            src: uploaded.link,
            width: 'auto',
            height: 'auto',
            temp: uploaded,
        };

        const contentState = editorState.getCurrentContent();
        const blockMap = contentState.getBlockMap();
        const blockMapJS = blockMap.toJS();
        const contentStateWithEntity = contentState.createEntity(urlType, 'MUTABLE', data);
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

        // After call insertAtomicBlock, blocks are out of order.
        // To avoit this problem, first, find new block and then add it to original edit state.
        const newEditorState = AtomicBlockUtils.insertAtomicBlock(
            editorState,
            entityKey,
            ' ',
        );

        const newContentState = newEditorState.getCurrentContent();
        const newBlockMap = newContentState.getBlockMap();
        const newBlockMapJS = newBlockMap.toJS();
        const newKeys = Object.keys(newBlockMapJS).filter(k => !blockMapJS[k]);
        const newAtomicBlockKey = newKeys.filter(k => isAtomic(newBlockMapJS[k].type))[0];
        const newAtomicBlock = newBlockMap.get(newAtomicBlockKey);

        let actualBlockMap = insertAfterToOrderedMap(blockMap, focusKey, newAtomicBlockKey, newAtomicBlock);
        const acutalBlockArray = actualBlockMap.toArray();
        const { [acutalBlockArray.length - 1]: lastBlock } = acutalBlockArray;

        // If last block is atomic, add empty block to edit state.
        if (isAtomic(lastBlock.toJS().type)) {
            const emptyBlock = createEmptyBlock();
            const emptyBlockJS = emptyBlock.toJS();
            actualBlockMap = actualBlockMap.set(emptyBlockJS.key, emptyBlock);
        }

        this.props.onEditorStateChange(
            EditorState.createWithContent(
                newContentState.set('blockMap', actualBlockMap),
            ),
        );

        // I guess that the above logic will add some tasks relate to state to call stack.
        // So, I make close method execute after the call stack is empty.
        setTimeout(this.close, 0);
    }

    render() {
        const { open, loading, uploaded } = this.state;
        return (
            <div>
                <Button basic
                    icon
                    labelPosition="left"
                    onClick={this.show}
                    className={cx('add-image', 'button')}>

                    <Icon name="file image outline" />
                    Add Image File
                </Button>
                <Modal size="mini" dimmer={false} open={open} onClose={this.close} className={cx('add-image', 'modal')}>
                    <Dimmer active={loading}>
                        <Loader />
                    </Dimmer>
                    <Modal.Header>Select Image</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            <Input
                                type="file"
                                placeholder="Select file..."
                                onChange={this.selectFile} />
                            { uploaded ?
                                <div className={cx('preview')} >
                                    <Image src={uploaded.link} size="medium" />
                                </div> : '' }
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="black" content="Delete" onClick={this.delete}></Button>
                        <Button positive icon="checkmark" labelPosition="right" content="Add" onClick={this.insert} />
                    </Modal.Actions>
                </Modal>
            </div>
        );
    }
}

export { AddImageComponent };

// container part
// for mappping props to redux data
const mapStateToProps = state => ({ editorState: state.draft.editorState });

// in component, disptch after triggering props
const mapDispatchToProps = dispatch => ({});

// connect component with data layer
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(AddImageComponent);

