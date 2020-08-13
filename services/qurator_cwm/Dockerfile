FROM ubuntu:latest
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get -qq -y update \
    && apt-get -qq -y install build-essential locales ca-certificates \
        python3-pip python3-dev python3-pil python3-icu libpq-dev \
    && apt-get -qq -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8

# Set up the locale and make sure the system uses unicode for the file system.
ENV LANG='en_US.UTF-8'

RUN groupadd -g 1000 -r app \
    && useradd -m -u 1000 -s /bin/false -g app app

RUN pip3 install --no-cache-dir -q -U pip setuptools six wheel nose coverage

WORKDIR /qurator_cwm

RUN mkdir -p /qurator_cwm

COPY requirements.txt /qurator_cwm
RUN pip3 install --no-cache-dir -r /qurator_cwm/requirements.txt

COPY . /qurator_cwm
RUN pip3 install --no-cache-dir -e /qurator_cwm

RUN chown -R app:app /qurator_cwm

ENV FTM_STORE_URI=postgresql://aleph:aleph@postgres/aleph \
    REDIS_URL=redis://redis:6379/0

USER app
CMD qurator_cwm worker