import React from 'react';

import './TranslationInfoMode.scss';


function TranslationInfoMode(props) {
  const { entity } = props;
  console.log(entity);
  return (
    <ul>
      <li>
        Hi
      </li>
      <li>
        <pre>{JSON.stringify(entity.getProperty('annotatedTopics'))}</pre>
      </li>
    </ul>
  );
}


export default TranslationInfoMode;
