import React from 'react';
import ClassNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Draft from '../draft/Draft';

// component part
class AppComponent extends React.Component {
    render() {
        return <Draft />;
    }
}


export { AppComponent };

// container part
// for mappping props to redux data
const mapStateToProps = state => ({});

// in component, disptch after triggering props
const mapDispatchToProps = dispatch => ({
});

// connect component with data layer
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(AppComponent);
