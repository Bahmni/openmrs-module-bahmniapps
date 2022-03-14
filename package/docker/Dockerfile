FROM httpd:2.4-alpine

EXPOSE 8091
COPY package/docker/httpd.conf /usr/local/apache2/conf
COPY package/docker/systemdate.sh /usr/local/apache2/cgi-bin/systemdate
COPY package/docker/index.html /usr/local/apache2/htdocs/

#unzip default_config
ADD package/resources/default_config.zip /tmp/artifacts/
RUN unzip -d /usr/local/apache2/htdocs/bahmni_config/ /tmp/artifacts/default_config.zip 

# Copy BahmniApps
COPY ui/dist/. /usr/local/apache2/htdocs/bahmni/
