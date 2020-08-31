import React from 'react';

import './TranslationViewMode.scss';


function TranslationViewMode(props) {
  const { entity } = props;
  console.log(entity);
  return (
    <>
        <pre>{JSON.stringify(entity.getProperty('annotatedTopics'))}</pre>
    </>
  );
}


export default TranslationViewMode;
