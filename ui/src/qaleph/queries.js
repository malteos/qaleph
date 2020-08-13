import Query from "app/Query";

export function queryEntityAnnotations(location, entityId) {
    const path = entityId ? `entities/${entityId}/annotations` : undefined;

    console.log('queryEntityAnnotations ', entityId);

    return Query.fromLocation(path, location, {}, 'annotations')
        .defaultFacet('collection_id', true);
}
