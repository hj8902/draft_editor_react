import React from 'react';
import ClassNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

import Styles from './draft.scss';

const cx = ClassNames.bind(Styles);

class PreviewComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editorState: this.props.editorState };
    }

    componentWillReceiveProps(nextProps) {
        const { editorState } = nextProps;
        this.setState({ editorState });
    }

    render() {
        const { editorState } = this.state;
        const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        return (
            <div className={cx('preview', 'clearfix')}>
                <h4 className={cx('header')}>Preview</h4>
                <div className={cx('box')} dangerouslySetInnerHTML={{ __html: html }} />
            </div>
        );
    }
}

export { PreviewComponent };

// container part
// for mappping props to redux data
const mapStateToProps = state => ({ editorState: state.draft.editorState });

// in component, disptch after triggering props
const mapDispatchToProps = dispatch => ({});

// connect component with data layer
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(PreviewComponent);
