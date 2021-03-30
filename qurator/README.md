# Qurator Aleph (QAleph)

- Do not mount node_modules, instead build image with dependencies!
- Docker images are in an extra repo (malteos)

### Getting started

```bash
# clone our fork
git clone https://github.com/malteos/qaleph.git aleph
cd aleph

# checkout our branch
git checkout qaleph

# Change to this directory
cd qurator

# Build all images (optional) 
make build

# Pull pre-build images
make docker-pull

# Run the latest database migrations and create/update the search index.
make fast-upgrade

# Run the web-based API server and the user interface.
make web
```

Open http://localhost:8080/ in your browser to visit the web frontend.

### Working in a shell

```bash
make shell
# ...

# This will result in a root shell inside the container:
aleph --help

# Create new user account
aleph createuser --name="Alice" \
                 --admin \
                 --password=123abc \
                 user@example.com

# import data
aleph crawldir /aleph/contrib/testdata
aleph crawldir /aleph/contrib/testdata/qurator
aleph crawldir /host/Volumes/data/repo/qurator/test_data

# directly via compose
docker-compose -f docker-compose.dev.yml run --rm app aleph crawldir /host/Volumes/data/repo/qurator/test_data/2

```

## Worker
```bash
make worker
```

## File structure

```bash

# Aleph backend 
qaleph/ 

# UI
ui/src/qaleph

# Services
services/qurator
```

## Changes in original code base

```

requirements.txt,
services/ingest-file/requirements.txt
    Change FTW to "https://github.com/malteos/followthemoney/archive/qurator.zip#egg=followthemoney"

aleph/views/__init__.py
    Add blueprint views

ui/src/components/Entity/EntityViews.jsx:render
    Add tabs to entity view (e.g., annotations)
        
ui/src/app/variables.scss 

ui/ts.config:
    strict true=>false
   
ui/src/reducers/index.js
    Add reducers
    
ui/src/screens/SearchScreen/SearchScreen.jsx,
ui/src/util/getFacetConfig.js
    Add search facets
     
ui/src/components/common/AppItem
    Aleph version info
```


## Environment variables

```bash
ALEPH_TAG=latest
DOCKER_USER=qurator

# Workflow manager
CWM_USER=qurator
CWM_PASSWORD=
CWM_WORKFLOW_ID=QuratorWF1_102
```

## Extra dependencies

UI
```
recharts
moment
```

## Document processors

See https://docs.alephdata.org/developers/adding-text-processors

```bash
# in aleph.env
ALEPH_INGEST_PIPELINE=analyze:cwm

docker-compose -f docker-compose.dev.yml up \
    --force-recreate --no-deps cwm
```

## View processed files in ES

http://localhost:19200/aleph-entity-plaintext-v1/_search?pretty

## Follow The Money: Changes

Install custom ontology from Github repo: https://github.com/malteos/followthemoney.git

```
followthemoney.exc.InvalidData: Unknown property (<Schema('PlainText')>): labeledPositionAnnotations
```


## Annotations

Annotations can be created on a collection level.
For each annotation task a new collection must be created.
Label classes can be defined by adding the following text anywhere to the collection summary:

```NER-tags: CLASS1,CLASS2,CLASS3```

CLASS1 etc. can be replaced with the actual class names.

## Pages

```bash
# maybe mount this directory to persistent cloud storage
export ALEPH_PAGES_PATH=/aleph/qurator/pages
```

Aleph info: `ui/src/components/common/AppItem`
Translations
- msgid "Aleph {version}"
