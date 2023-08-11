FROM httpd:2.4-alpine

RUN apk update && \
    apk add --no-cache tzdata wget curl unzip

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

# Download Person Management App
RUN <<EOR
    LATEST_RELEASE=$(curl -L -s -H 'Accept: application/json' https://github.com/Bahmni/person-management-app/releases/latest)
    LATEST_VERSION=$(echo $LATEST_RELEASE | sed -e 's/.*"tag_name":"\([^"]*\)".*/\1/')
    ARTIFACT_URL="https://github.com/Bahmni/person-management-app/releases/download/$LATEST_VERSION/person-management-app.zip"
    wget $ARTIFACT_URL
    unzip person-management-app.zip -d /usr/local/apache2/htdocs/
    rm person-management-app.zip
    mv /usr/local/apache2/htdocs/build/ /usr/local/apache2/htdocs/person-management/
EOR

RUN apk del wget curl unzip