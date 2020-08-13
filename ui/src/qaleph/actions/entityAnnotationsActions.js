import { endpoint } from 'src/app/api';
import asyncActionCreator from 'actions/asyncActionCreator';

export const fetchEntityAnnotations = asyncActionCreator((entityId) => async () => {
   console.log('fetchEntityAnnotations entityId: ', entityId);

  const path = entityId ? `entities/${entityId}/annotations` : undefined;

  const response = await endpoint.get(path);

  return response.data;
}, { name: 'FETCH_ENTITY_ANNOTATIONS' });

export const fetchUpdatedAnnotations = asyncActionCreator((entityId, status, entityAnnotations) => async () => {
    const annotations = entityAnnotations.pages.map((page) => page.annotations);

    console.log('fetchUpdatedAnnotations entityId: ', entityId, annotations);

    const path = entityId ? `entities/${entityId}/annotations` : undefined;
    const data = {
        status: status,
        annotations: annotations,
        pagesCount: entityAnnotations.pages.length,
        labelClasses: entityAnnotations.labelClasses,
    };

    const response = await endpoint.post(path, data);

    // Update only with nextEntityId
    // const updatedEntityAnnotations = {...entityAnnotations};

    // console.log('fetchUpdatedAnnotations response: ', updatedEntityAnnotations);
    console.log('fetchUpdatedAnnotations response.data: ', response.data);

    // return updatedEntityAnnotations.nextEntityId = response.data.data.nextEntityId;
    // return updatedEntityAnnotations;
    return response.data;
}, { name: 'FETCH_UPDATED_ANNOTATIONS' });
