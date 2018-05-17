import React from 'react';
import ClassNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Button } from 'semantic-ui-react';
import { escape } from 'lodash';

import { UPDATE } from './DraftAction';
import { post } from './DraftAPI';

class SaveButtonComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editorState: this.props.editorState };
        this.save = this.save.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const { editorState } = nextProps;
        this.setState({ editorState });
    }

    save() {
        const { editorState } = this.state;
        const contentState = convertToRaw(editorState.getCurrentContent());

        const entityMap = contentState.entityMap;
        const entityKeys = Object.keys(entityMap);
        const tempIds = entityKeys
            .map(key => entityMap[key].data)
            .filter(data => data.temp)
            .map(data => data.temp.id);

        const html = draftToHtml(contentState);
        const innerHtml = new Option(html).innerHTML;

        post(innerHtml, tempIds)
            .then(payload => this.props.onEditorStateChange(EditorState.createEmpty(), true));
    }

    render() {
        return <Button basic color="red" onClick={this.save}>save</Button>;
    }
}

export { SaveButtonComponent };

// container part
// for mappping props to redux data
const mapStateToProps = state => ({ editorState: state.draft.editorState });

// in component, disptch after triggering props
const mapDispatchToProps = dispatch => ({});

// connect component with data layer
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(SaveButtonComponent);
