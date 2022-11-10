FROM httpd:2.4-alpine

EXPOSE 8091
COPY package/docker/httpd.conf /usr/local/apache2/conf
COPY package/docker/systemdate.sh /usr/local/apache2/cgi-bin/systemdate
COPY package/docker/index.html /usr/local/apache2/htdocs/
COPY ui/app/images/bahmniLogoFull.png /usr/local/apache2/htdocs/bahmni-logo.png
COPY package/docker/maintenance.html /usr/local/apache2/htdocs/
COPY package/docker/unauthorized.html /usr/local/apache2/htdocs/
COPY package/docker/style.css /usr/local/apache2/htdocs/

# Copy BahmniApps
COPY ui/dist/. /usr/local/apache2/htdocs/bahmni/
