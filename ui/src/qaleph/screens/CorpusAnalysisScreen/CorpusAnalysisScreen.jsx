import React, { Component } from 'react';

import Screen from 'components/Screen/Screen';
import {
  fetchCorpusAnalysis,
} from 'qaleph/actions/corpusAnalysisActions';
import { compose } from 'redux';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import {
  selectCorpusAnalysis
} from 'qaleph/selectors';
import moment from 'moment';

import { AreaChart } from 'recharts';
import { Area } from 'recharts';
import { XAxis } from 'recharts';
import { YAxis } from 'recharts';
import { CartesianGrid } from 'recharts';
import { Tooltip } from 'recharts';
import { Button } from '@blueprintjs/core';
import { Classes } from '@blueprintjs/core';
import { ControlGroup } from '@blueprintjs/core';
import { FormGroup } from '@blueprintjs/core';
import { MenuItem } from '@blueprintjs/core';

import { MultiSelect as BlueprintMultiSelect } from '@blueprintjs/select/lib/esm/components/select/multiSelect';
import ResponsiveContainer from 'recharts/lib/component/ResponsiveContainer';
import Legend from 'recharts/lib/component/Legend';
import Dashboard from 'components/Dashboard/Dashboard';

const colors = ["#2965CC", "#29A634", "#D99E0B", "#D13913", "#8F398F", "#00B3A4", "#DB2C6F", "#9BBF30", "#96622D", "#7157D9"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload) {

    return (
      <div className="recharts-default-tooltip">
        <p className="label"><b>{moment(payload[0].value).format('YYYY-MM-DD')}:</b></p>
        <ul>
        {payload.map((p, index) => (
          <li key={index}>{p.name}: {p.value}</li>
        ))}
        </ul>
        {/*<p>{payload[0].name}</p>*/}
        {/*<p className="label"><b>{moment(payload[0].value).format('YYYY-MM-DD')}:</b> {payload[1].value} Documents ({label})</p>*/}
        {/*<p><pre>{JSON.stringify(payload)}</pre></p>*/}
      </div>
    );
  }
  return null;
};


export const renderCreateItemOption = (
  query,
  active,
  handleClick,
) => (
  <MenuItem
    icon="add"
    // text={`Create "${query}"`}
    text={query.toLowerCase()}
    active={active}
    onClick={handleClick}
    shouldDismissPopover={false}
  />
);

export function addCreatedFilmToArrays(
  items,
  createdItems,
  item,
) {
  console.log(items, createdItems, item);

  // return {
  //   createdItems: createdItems,
  //   // Add a created film to `items` so that the film can be deselected.
  //   items: [...items, film],
  // };
}

export class CorpusAnalysisScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedQueries: ["he", "this"],
    };

    this.itemRenderer = this.itemRenderer.bind(this);
    this.itemFilter = this.itemFilter.bind(this);
    this.onItemSelect = this.onItemSelect.bind(this);
    this.onRemoveTag = this.onRemoveTag.bind(this);
    this.tagRenderer = this.tagRenderer.bind(this);
    this.createNewItemFromQuery = this.createNewItemFromQuery.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.fetchIfNeeded();
  }

  componentDidUpdate() {
    this.fetchIfNeeded();
  }

  fetchIfNeeded() {
    const { corpusAnalysis } = this.props;
    const { selectedQueries } = this.state;

    if (corpusAnalysis.shouldLoad) {
      this.props.fetchCorpusAnalysis(selectedQueries);
    }
  }

  static getDerivedStateFromProps(nextProps) {
    return { codes: nextProps.codes || [], availableQueries: nextProps.availableQueries || [] };
  }

  tagRenderer(item) {
    // return <Name code={item} countries={this.props.countries} />;
    return JSON.stringify(item);
  }

  onRemoveTag(event, index) {
    const { selectedQueries } = this.state;
    selectedQueries.splice(index, 1);
    this.setState({ selectedQueries });
    // this.props.onChange(codes);
  }

  itemFilter(query, item) {
    if (!query.length || this.state.codes.indexOf(item) !== -1) {
      return false;
    }
    const label = this.props.countries.get(item).toLowerCase();
    return label.includes(query.toLowerCase());
  }

  createNewItemFromQuery(item) {
    console.log('createNewItemFromQuery ', item);

    // this.props.items;
    return item;
  }

  onItemSelect(item, event) {
    event.stopPropagation();
    // const { codes } = this.state;

    console.log('Select item: ', item);
    console.log('Props items: ', this.props.availableQueries);

    if(this.state.selectedQueries.length < colors.length - 1) {

      this.state.selectedQueries.push(item);
    } else {
      console.error('Cannot add more items.');
    }

    // this.setState({ codes });
    // this.props.onChange(codes);
  }

  itemRenderer(item, { modifiers, handleClick }) {
    if (modifiers.matchesPredicate) {
      return (
        <MenuItem
          key={item}
          className={modifiers.active ? Classes.ACTIVE : ''}
          onClick={handleClick}
          // text={this.props.countries.get(item)}
          text={JSON.stringify(item)}
        />
      );
    }
    return undefined;
  }

  async onSubmit(event) {
    const { selectedQueries } = this.state;
    // event.preventDefault();

    console.log('onSubmit ', selectedQueries);

    // this.setState({ newAlert: '' });
    // if (!newAlert.split().length) {
    //   return;
    // }
    // await this.props.addAlert({ query: newAlert });
    this.props.fetchCorpusAnalysis(selectedQueries);
  }

  render() {
    const { corpusAnalysis } = this.props;

    console.log('this.props  ', this.props);
    console.log('corpusAnalysis.results ', corpusAnalysis.results);
    console.log('corpusAnalysis.queries ', corpusAnalysis.queries);

    // console.log('this.props.query.state.q ', this.props.query.state.q);
    console.log('selected items: ', this.state.selectedQueries);

    const chartData = corpusAnalysis.results || [];

    const allKeys = [];

    // for (const item of this.state.selectedQueries){
    //   for (const dataItem of corpusAnalysis[item]) {
    //     allKeys.push(dataItem['key']);
    //   }
    // }

    // this.state.selectedQueries.map((item) => (
    //   corpusAnalysis[item].map((dataItem) => dataItem['key'])
    // ));
    console.log('allKeys ', allKeys);

    // const data = [
    //   {
    //     "time": 123,
    //   }
    // ];

    // Convert to chart data
    // {"key_as_string":"2020-03-22T00:00:00.000Z","key":1584835200000,"doc_count":2}
    const timeDataByQuery = {};

    for (const item of this.state.selectedQueries){
      timeDataByQuery[item] = [];

      // for (const idx in corpusAnalysis[item]) {
      //   // corpusAnalysis.results[key]['key']
      //   // doc_count
      //   timeDataByQuery[item].push({
      //     value: corpusAnalysis[item][idx]['doc_count'],
      //     time: corpusAnalysis[item][idx]['key'],
      //   })
      // }
    }

    console.log('timeData ', timeDataByQuery);

    return (
      <Screen
        className="CorpusAnalysisScreen"
        title="Corpus Analysis"
        requireSession
      >
        <Dashboard>
        <div className="Dashboard__title-container">
          <h5 className="Dashboard__title">Corpus Analysis</h5>
          <FormGroup
            helperText="Enter a list of keywords or concepts that should be analyzed"
            label="Query"
            labelFor="text-input"
            labelInfo="(required)"
            inline={true}
          >
            <ControlGroup>
              <BlueprintMultiSelect
                items={this.props.availableQueries}
                itemRenderer={(item, itemProps) => {
                  return (
                    <MenuItem
                      key={item}
                      text={item}
                      onClick={itemProps.handleClick}
                      active={itemProps.modifiers.active}
                    />
                  );
                }}
                tagInputProps={{
                  onRemove: this.onRemoveTag,
                }}
                // onItemSelect={() => {}}
                onItemSelect={this.onItemSelect}
                tagRenderer={(item) => item}
                createNewItemFromQuery={this.createNewItemFromQuery}
                createNewItemRenderer={renderCreateItemOption}
                selectedItems={this.state.selectedQueries}
              />
              <Button
                onClick={this.onSubmit}
                icon="search"
                text='Submit'
              />
            </ControlGroup>

          </FormGroup>

          <ResponsiveContainer width = '95%' height = {200} >
          <AreaChart
            width={500}
            height={400}
            data={chartData}
            dataKey = 'timestamp'
            margin={{
              top: 10, right: 30, left: 0, bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              domain = {['auto', 'auto']}
              dataKey="timestamp"
              name = 'Date'
              tickFormatter = {(ts) => moment(ts).format('YYYY-MM-DD')}
              type="number"
            />
            <YAxis dataKey = 'doc_count' name = 'Value' />
            {/*<Area type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8" />*/}
            {/*<Area*/}
            {/*  data = {timeData}*/}
            {/*  // lineJointType = 'monotoneX'*/}
            {/*  // lineType = 'joint'*/}
            {/*  name = 'Frequency'*/}
            {/*  type = 'monotone'*/}
            {/*  stroke="#8884d8"*/}
            {/*  fill="#8884d8"*/}
            {/*  fillOpacity={0.5}*/}
            {/*/>*/}
            <Area
              key={0}
              dataKey='doc_count'
              stroke = {colors[0]}
              fill = {colors[0]}
              fillOpacity={0.5}
              // lineJointType = 'monotoneX'
              // lineType = 'joint'
              name ='All documents'
            />

            {corpusAnalysis.queries && corpusAnalysis.queries.map((q, index) => (
              <Area
                key={index+1}
                dataKey={`doc_count__${q}`}
                // line = {{ stroke: colors[index+1] }}
                // lineJointType = 'monotoneX'
                // lineType = 'joint'
                stroke = {colors[index+1]}
                fill = {colors[index+1]}
                fillOpacity={0.5}
                name = {q}
              />
            ))}


          <Tooltip
            content={<CustomTooltip />}
          />
          <Legend />
          </AreaChart>
          </ResponsiveContainer>
          {/*{corpusAnalysis.queries && corpusAnalysis.queries.map((q, index) => (*/}
          {/*  <div key={index}>*/}
          {/*    <pre>{JSON.stringify(q)}</pre>*/}
          {/*  </div>*/}
          {/*))}*/}
          {/*<hr />*/}
          {/*<pre>{JSON.stringify(corpusAnalysis)}</pre>*/}
        </div>
        </Dashboard>
      </Screen>
    );
  }
}
const mapStateToProps = (state, ownProps) => {
  console.log('mapStateToProps state', state);

  return {
    corpusAnalysis: selectCorpusAnalysis(state),
    countries: ['Germany', 'United States'],
    availableQueries: ["A", "B", "C"],
    // query: query,
  };
};

export default compose(
  withRouter,
  injectIntl,
  connect(mapStateToProps, { fetchCorpusAnalysis }),
)(CorpusAnalysisScreen);
