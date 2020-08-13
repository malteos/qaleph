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
    }

    componentDidMount() {
        console.log('componentDidMount');
        // this.fetchIfNeeded();
        const { entity } = this.props;
        this.props.fetchEntityAnnotations(entity.id);

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
            this.props.fetchEntityAnnotations(entity.id);
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

                history.push({
                    pathname: `/datasets/${response.data.collectionId}`,
                    hash: queryString.stringify({mode: 'documents'})
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


    render() {
        const { entityAnnotations } = this.props;

        console.log('render(): props  ', this.props);
        console.log('render(): entityAnnotations ', entityAnnotations);

        return (
            <div className="DocumentViewMode">
                <div className="outer">
                    <div className="inner TextViewer">
                        {entityAnnotations && entityAnnotations.pages && entityAnnotations.labelClasses && (
                            <AnnotationForm
                                pages={entityAnnotations.pages}
                                labelClasses={entityAnnotations.labelClasses}
                                onAnnotationsChange={this.onAnnotationsChange}
                                handleAccept={this.handleAccept}
                                handleReject={this.handleReject}
                                handleUndo={this.handleUndo}
                                handleSkip={this.handleSkip}
                            />
                        )}
                        {/*<pre>{JSON.stringify(entityAnnotations)}</pre>*/}
                    </div>
                </div>
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
