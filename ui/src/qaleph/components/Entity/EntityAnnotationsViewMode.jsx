import React, { Component } from 'react';

import { compose } from 'redux';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

import { fetchEntityAnnotations, fetchUpdatedAnnotations
} from 'qaleph/actions/entityAnnotationsActions';
import AnnotationForm from "qaleph/components/Annotations/AnnotationForm";
import {showSuccessToast, showWarningToast} from "app/toast";
import queryString from "query-string";
import {SectionLoading} from "../../../components/common";


export class EntityAnnotationsViewMode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            entityAnnotations: {},
        };

        this.createNewItemFromQuery = this.createNewItemFromQuery.bind(this);
        this.onAnnotationsChange = this.onAnnotationsChange.bind(this);
        this.handleAccept = this.handleAccept.bind(this);
        this.handleReject = this.handleReject.bind(this);
        this.handleUndo = this.handleUndo.bind(this);
        this.handleSkip = this.handleSkip.bind(this);
        this.handleBrowse = this.handleBrowse.bind(this);

    }

    componentDidMount() {
        console.log('componentDidMount');
        // this.fetchIfNeeded();
        const { entity } = this.props;

        try {
            this.props.fetchEntityAnnotations(entity.id);
        } catch (e) {
            showWarningToast(e.message);
        }
    }

    componentDidUpdate() {
        console.log('componentDidUpdate ---');
        this.fetchIfNeeded();
    }

    componentWillUnmount() {
        console.log('componentWillUnmount ###');
    }

    fetchIfNeeded() {
        const { entityAnnotations, entity } = this.props;

        console.log('fetchIfNeeded: ', JSON.stringify(entity.id), ' vs ', JSON.stringify(entityAnnotations.entityId));
        console.log(JSON.stringify(entity.id === entityAnnotations.entity));

        console.log(entity.id);
        console.log(entityAnnotations.entityId);

        if (entityAnnotations.shouldLoad) {
            try {
                this.props.fetchEntityAnnotations(entity.id);
            } catch (e) {
                showWarningToast(e.message);
            }
        } else {
            console.log('No fetch needed');
        }
    }

    createNewItemFromQuery(item) {
        console.log('createNewItemFromQuery ', item);

        // this.props.items;
        return item;
    }

    onAnnotationsChange(pageIndex, changedAnnotations) {

        // Update annotations for current page
        const { entityAnnotations } = this.props;

        console.log('onAnnotationsChange: ', pageIndex, changedAnnotations, entityAnnotations.pages);

        const newEntityAnnotations = {...entityAnnotations};

        newEntityAnnotations.pages[pageIndex].annotations = changedAnnotations;

        this.setState({entityAnnotations: newEntityAnnotations});
    }


    async handleAction(status) {
        const { entity, entityAnnotations } = this.props;

        try {
            const response = await this.props.fetchUpdatedAnnotations(entity.id, status, entityAnnotations);

            console.log('handleAccept response ', response);

            const newEntityAnnotations = {...entityAnnotations};
            newEntityAnnotations.shouldLoad = true;
            this.setState({entityAnnotations: undefined});

            const { history } = this.props;

            if(response.data.nextEntityId) {
                showSuccessToast('Annotations successfully saved');
                console.log('Redirect to: ', response.data.nextEntityId);

                history.push({
                    pathname: `/entities/${response.data.nextEntityId}`,
                    hash: queryString.stringify({mode: 'annotation'})
                });
            } else {
                showSuccessToast('No remaining documents left');

                const params = {
                    [`filter:collection_id`]: response.data.collectionId,
                    facet: 'properties.annotatedUserStatus',
                };
                const query = queryString.stringify(params);

                history.push({
                    pathname: '/search',
                    search: query,
                });
            }
        } catch (e) {
            showWarningToast(e.message);
        }

        console.log(status, ' ' + JSON.stringify(entityAnnotations));
    }

    async handleReject() {
        this.handleAction("rejected");
    }

    async handleAccept() {
        this.handleAction("accepted");
    }

    async handleSkip() {
        this.handleAction("skipped");
    }

    handleUndo(event) {
        const { entity, entityAnnotations } = this.props;

        alert('Undo');

        event.preventDefault();
    }

    handleBrowse() {
        // Navigate to remaining document collection
        const { entity, history } = this.props;

        const params = {
            [`filter:collection_id`]: entity.collection.id,
            facet: 'properties.annotatedUserStatus',
        };
        const query = queryString.stringify(params);

        history.push({
            pathname: '/search',
            search: query,
        });
    }


    render() {
        const { entityAnnotations } = this.props;

        console.log('render(): props  ', this.props);
        console.log('render(): entityAnnotations ', entityAnnotations);

        if (entityAnnotations.isPending) {
            return <SectionLoading />;
        }

        return (
            <div className="DocumentViewMode">
                {entityAnnotations && entityAnnotations.pages && entityAnnotations.labelClasses && (
                    <AnnotationForm
                        pages={entityAnnotations.pages}
                        labelClasses={entityAnnotations.labelClasses}
                        status={entityAnnotations.status}
                        onAnnotationsChange={this.onAnnotationsChange}
                        handleAccept={this.handleAccept}
                        handleReject={this.handleReject}
                        handleUndo={this.handleUndo}
                        handleSkip={this.handleSkip}
                        handleBrowse={this.handleBrowse}
                    />
                )}
                {/*<pre>{JSON.stringify(entityAnnotations)}</pre>*/}
            </div>

        );
    }
}

const mapStateToProps = state => ({
    entityAnnotations: state.entityAnnotations,
});

export default compose(
    withRouter,
    injectIntl,
    connect(mapStateToProps, { fetchEntityAnnotations, fetchUpdatedAnnotations }),
)(EntityAnnotationsViewMode);
