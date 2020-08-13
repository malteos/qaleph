import React, { Component } from 'react';

import Screen from 'components/Screen/Screen';

export class DummyScreen extends Component {
  // componentDidMount() {
  //   this.fetchIfNeeded();
  // }
  //
  // componentDidUpdate() {
  //   this.fetchIfNeeded();
  // }
  //
  // fetchIfNeeded() {
  //   const { collection, statistics } = this.props;
  //   if (statistics.shouldLoad) {
  //     this.props.fetchCollectionStatistics(collection);
  //   }
  // }

  render() {
    // const { collection } = this.props;
    //
    // console.log(collection);

    return (
      <Screen
        className="DummyScreen"
        title="fooo"
        requireSession
      >
        <div className="Dashboard__title-container">
          <h5 className="Dashboard__title">Moin</h5>
          <p className="Dashboard__subheading">
            Hi
          </p>
        </div>
      </Screen>
    );
  }
}

export default DummyScreen;
