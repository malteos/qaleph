import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { Button, ButtonGroup, Intent, Position, Tooltip } from '@blueprintjs/core';
import { selectSession } from 'selectors';

import EntitySetCreateDialog from 'dialogs/EntitySetCreateDialog/EntitySetCreateDialog';

const messages = defineMessages({
  list_create: {
    id: 'list.create.button',
    defaultMessage: 'New list',
  },
  diagram_create: {
    id: 'diagram.create.button',
    defaultMessage: 'New diagram',
  },
  list_login: {
    id: 'list.create.login',
    defaultMessage: 'You must log in to create a list',
  },
  diagram_login: {
    id: 'diagram.create.login',
    defaultMessage: 'You must log in to create a diagram',
  },
});

class EntitySetCreateMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      importEnabled: false,
    };
    this.toggleDialog = this.toggleDialog.bind(this);
  }

  toggleDialog = (importEnabled) => this.setState(({ isOpen }) => (
    { isOpen: !isOpen, importEnabled }
  ));

  render() {
    const { type, collection, intl, session } = this.props;
    const { isOpen, importEnabled } = this.state;
    const canAdd = session?.loggedIn;
    const canImportDiagram = type === 'diagram';
    const icon = type === 'diagram' ? 'send-to-graph' : 'add-to-artifact';

    const buttonContent = (
      <ButtonGroup>
        <Button onClick={() => this.toggleDialog(false)} icon={icon} intent={Intent.PRIMARY} disabled={!canAdd}>
          {intl.formatMessage(messages[`${type}_create`])}
        </Button>
        {canImportDiagram && (
          <Button onClick={() => this.toggleDialog(true)} icon="import" disabled={!canAdd}>
            <FormattedMessage id="diagram.import.button" defaultMessage="Import diagram" />
          </Button>
        )}
      </ButtonGroup>
    );

    return (
      <>
        {canAdd && buttonContent}
        {!canAdd && (
          <Tooltip
            content={intl.formatMessage(messages[`${type}_login`])}
            position={Position.BOTTOM}
          >
            {buttonContent}
          </Tooltip>
        )}
        <EntitySetCreateDialog
          importEnabled={importEnabled}
          isOpen={isOpen}
          toggleDialog={this.toggleDialog}
          entitySet={{ collection, type }}
          canChangeCollection={!collection}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  session: selectSession(state),
});

export default compose(
  connect(mapStateToProps),
  injectIntl,
)(EntitySetCreateMenu);
