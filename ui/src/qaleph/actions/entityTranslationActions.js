import { endpoint } from 'src/app/api';
import asyncActionCreator from 'actions/asyncActionCreator';

export const fetchEntityTranslation = asyncActionCreator((entityId) => async () => {
   console.log('fetchEntityTranslation entityId: ', entityId);

    /*

 curl -X POST "https://demo.qurator.ai/pub/srv-summarization-2/models/airKlizz/distilbart-12-6-multi-combine-wiki-news/summarize?text=something&max_length=400&min_length=150&length_penalty=2&num_beams=4" -H  "accept: application/json"

  */

  const path = entityId ? `entities/${entityId}/annotations` : undefined;

  const response = await endpoint.get(path);

  return response.data;
}, { name: 'FETCH_ENTITY_TRANSLATION' });

