import React, { useState } from 'react';
import {HTMLSelect, FormGroup, Icon, Button} from "@blueprintjs/core";
import { endpoint } from 'app/api';

import './TranslationViewMode.scss';
import {SectionLoading} from "components/common";
import {showWarningToast} from "app/toast";

const LANGUAGE_MAPPING = {
  "eng": "en",
  "deu": "de",
};
const DEFAULT_LANGUAGE = "en";

const AVAILABLE_TRANSLATIONS = {
  "en": ["de", "es"],
  "de": ["en"],
  "es": ["en"]
};

function TranslationViewMode(props) {
  const { entity } = props;


  function getEntityLanguage(entity) {
    const languages = entity.getProperty('detectedLanguage');

    if(languages && languages.length > 0 && LANGUAGE_MAPPING.hasOwnProperty(languages[0])) {
      return LANGUAGE_MAPPING[languages[0]];
    } else {
      return DEFAULT_LANGUAGE;
    }
  }

  function getAvailableTranslations(language) {
    if(AVAILABLE_TRANSLATIONS.hasOwnProperty(language)) {
      return AVAILABLE_TRANSLATIONS[language];
    } else {
      return AVAILABLE_TRANSLATIONS[DEFAULT_LANGUAGE];
    }
  }

  const [originalLanguage, setOriginalLanguage] = useState(getEntityLanguage(entity));
  const [targetLanguage, setTargetLanguage] = useState(getAvailableTranslations(originalLanguage)[0]);
  const [translation, setTranslation] = useState(undefined);
  const [loading, setLoading] = useState(false);

  function translate(text, originalLang, targetLang) {
    /*
    curl -XPOST "https://qurator:dd17f230-a879-48cf-9220-55b4fcd4b941@demo.qurator.ai/pub/srv-translation/translate?orig_lang=en&targ_lang=de" --data-raw "This is my test" --header "Content-Type: text/plain" --header 'Accept: text/plain'
    */


    setLoading(true);

    const path = `qurator_proxy/srv-translation/translate?orig_lang=${originalLang}&targ_lang=${targetLang}`;

    endpoint.post(path, text, {
      headers: { 'Content-Type': 'text/plain', 'Accept': 'text/plain' }
    }).then((response) => {
      setTranslation(response.data);
      setLoading(false);
    })
    .catch(e => showWarningToast(e.message));

  }

  console.log(entity);
  return (
    <div className="DocumentViewMode">
      <FormGroup label="Select language:">
          <HTMLSelect
              options={Object.keys(AVAILABLE_TRANSLATIONS)}
              value={originalLanguage}
              onChange={(event => setOriginalLanguage(event.currentTarget.value))}
              disabled={loading}
          />
          &nbsp;
          <Icon icon="arrow-right" />
          &nbsp;
          <HTMLSelect
              options={getAvailableTranslations(originalLanguage)}
              value={targetLanguage}
              onChange={(event => setTargetLanguage(event.currentTarget.value))}
              disabled={loading}
          />
          &nbsp;
          <Button
              text="Translate"
              intent="primary"
              disabled={loading}
              onClick={(event) => {
                event.stopPropagation();
                const bodyText = Object.fromEntries(entity.properties)['PlainText:bodyText'][0];

                translate(bodyText, originalLanguage, targetLanguage);
              }}
          />
      </FormGroup>
      <hr />
      {loading ?
          (
            <SectionLoading />
          ) :
          (
              <>
              {translation ?
                  (
                      <div className="outer">
                        <div className="inner TextViewer">
                          <pre className="bp3-code-block">{translation}</pre>
                        </div>
                      </div>
                  ) :
                  (<pre>No translation available.</pre>)}
              </>
      )}
    </div>
  );
}


export default TranslationViewMode;
