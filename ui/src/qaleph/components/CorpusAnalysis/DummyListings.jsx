import React, { PureComponent } from 'react';
// import c from 'classnames';
import { injectIntl } from 'react-intl';


export class DummyListings extends PureComponent {
  renderSkeleton() {
    // const { listType } = this.props;

    const skeletonItems = [...Array(5).keys()];

    console.log(skeletonItems);

    return (
      <div className="DummyListings settings-table">
        <ul>
          {skeletonItems.map((item, index) => (
            <li key={index} className="DummyListings__row">{ JSON.stringify(item) }</li>
          ))}
        </ul>
      </div>
    );
  }

  render() {
    const { corpusAnalysis } = this.props;

    console.log('dummy listing ', corpusAnalysis);
    console.log(corpusAnalysis.results);

    if (!corpusAnalysis.results && corpusAnalysis.isPending) {
      console.log('is pending...');

      return this.renderSkeleton();
    }
    const items = corpusAnalysis.results;


    return (
      <div className="DummyListings settings-table">
        <ul>
          {items.map((item, index) => (
            <li key={index} className="DummyListings__row">{ JSON.stringify(item) }</li>
          ))}
        </ul>
      </div>
    );
  }
}
export default injectIntl(DummyListings);
