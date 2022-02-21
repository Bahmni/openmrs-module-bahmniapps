FROM httpd:2.4-alpine

EXPOSE 8091
COPY docker/httpd.conf /usr/local/apache2/conf
COPY build/bahmniapps /usr/local/apache2/htdocs/bahmni/
COPY build/default_config/ /usr/local/apache2/htdocs/bahmni_config/
