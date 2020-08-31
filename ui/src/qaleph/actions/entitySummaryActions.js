import { endpoint } from 'src/app/api';
import asyncActionCreator from 'actions/asyncActionCreator';


/*
curl -X POST "https://demo.qurator.ai/pub/srv-summarization-2/models/airKlizz/distilbart-12-6-multi-combine-wiki-news/summarize?text=something&max_length=400&min_length=150&length_penalty=2&num_beams=4" -H  "accept: application/json"

curl 'https://qurator:dd17f230-a879-48cf-9220-55b4fcd4b941@demo.qurator.ai/pub/srv-summarization-2/models/airKlizz/distilbart-12-6-multi-combine-wiki-news/summarize'  --data-raw '{"text":"Please summarize this text.","max_length":400,"min_length":15,"length_penalty":2,"num_beams":4}'

curl 'https://localhost:8000/srv/summarization/models/airKlizz/distilbart-12-6-multi-combine-wiki-news/summarize'  --data-raw '{"text":"Please summarize this text.","max_length":400,"min_length":15,"length_penalty":2,"num_beams":4}'

https://demo.qurator.ai/pub/srv-summarization-2/models/airKlizz/distilbart-12-6-multi-combine-wiki-news/summarize?text=Please%20summarize%20this%20text.&max_length=400&min_length=150&length_penalty=2&num_beams=2


*/

export const fetchEntitySummary = asyncActionCreator((entityId, text) => async () => {
    console.log('fetchEntitySummary entityId: ', entityId);

    const modelName = 'airKlizz/distilbart-12-6-multi-combine-wiki-news';
    const path = `qurator_proxy/srv-summarization-2/models/${modelName}/summarize`;

    const response = await endpoint.post(path, {
        text: text,
        // Default settings
        max_length: 400,
        min_length: 15,
        length_penalty: 2,
        num_beams: 2,
    });

    console.log('fetchEntitySummary >> ', response.data);

    return {data: response.data};
}, { name: 'FETCH_ENTITY_SUMMARY' });

