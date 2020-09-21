import { endpoint } from 'src/app/api';
import asyncActionCreator from 'actions/asyncActionCreator';

export const fetchEntityTranslation = asyncActionCreator((entityId) => async () => {
   console.log('fetchEntityTranslation entityId: ', entityId);

    /*
curl -XPOST "https://qurator:dd17f230-a879-48cf-9220-55b4fcd4b941@demo.qurator.ai/pub/srv-translation/translate?orig_lang=en&targ_lang=de" --data-raw "This is my test" --header "Content-Type: text/plain" --header 'Accept: text/plain'
  */

  // const path = entityId ? `entities/${entityId}/annotations` : undefined;
    const originalLanguage = "en";
    const targetLanguage = "de";

    const path = `qurator_proxy/srv-translation/translate?orig_lang=${originalLanguage}&targ_lang=${targetLanguage}`;

  const response = await endpoint.post(path, "This is my test");

  console.log('fetchEntityTranslation >> ', response);

  return response.data;
}, { name: 'FETCH_ENTITY_TRANSLATION' });

