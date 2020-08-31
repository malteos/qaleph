import React, { Component } from 'react';

import {showWarningToast} from "app/toast";
import {SectionLoading} from "components/common";
import {compose} from "redux";
import {withRouter} from "react-router";
import {injectIntl} from "react-intl";
import {connect} from "react-redux";
import {fetchEntitySummary} from "qaleph/actions/entitySummaryActions";

export class SummaryViewMode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            entitySummary: undefined,
        };
    }

    componentDidMount() {
        console.log('componentDidMount');
        // this.fetchIfNeeded();
        // const { entity } = this.props;

        this.fetchIfNeeded();

        // try {
        //     this.props.fetchEntitySummary(entity.id, 'foo bar');
        // } catch (e) {
        //     showWarningToast(e.message);
        // }
    }

    componentDidUpdate() {
        console.log('componentDidUpdate ---');
        this.fetchIfNeeded();
    }

    componentWillUnmount() {
        console.log('componentWillUnmount ###');
    }

    fetchIfNeeded() {
        const { entity, entitySummary } = this.props;

        console.log('fetchIfNeeded: ', entity);
        // console.log(JSON.stringify(entity.id === entityAnnotations.entity));
        //
        // console.log(entity.id);
        // console.log(entityAnnotations.entityId);
        //
        if (entitySummary.shouldLoad) {
            try {
                const bodyText = Object.fromEntries(entity.properties)['PlainText:bodyText'][0];

                if(bodyText) {
                    this.props.fetchEntitySummary(entity.id, bodyText);
                } else {
                    showWarningToast('Entity has no text that could be summarized.');
                }
            } catch (e) {
                showWarningToast(e.message);
            }
        } else {
            console.log('No fetch needed');
        }
    }

    render() {
        const { entitySummary } = this.props;

        if (entitySummary.isPending) {
            return <SectionLoading />;
        }

        return (
            <div className="DocumentViewMode">
                <pre>{entitySummary.summary}</pre>
                <hr />
                <small><i>Summary generated in {Math.round(entitySummary.inference_time)}s</i></small>
            </div>

        );
    }
}

const mapStateToProps = state => ({
    entitySummary: state.entitySummary,
});

export default compose(
    withRouter,
    injectIntl,
    connect(mapStateToProps, { fetchEntitySummary }),
)(SummaryViewMode);
