FROM httpd:2.4-alpine

RUN apk add -y --no-cache wget curl unzip

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
    RELEASE_URL="https://github.com/Bahmni/person-management-app/releases/tag/v-11"
    RELEASE_TAG=$(curl -L -s -H 'Accept: application/json' $RELEASE_URL)
    VERSION_TAG=$(echo $RELEASE_TAG | sed -e 's/.*"tag_name":"\([^"]*\)".*/\1/')
    ARTIFACT_URL="https://github.com/Bahmni/person-management-app/releases/download/$VERSION_TAG/person-management-app.zip"
    wget $ARTIFACT_URL
    unzip person-management-app.zip -d /usr/local/apache2/htdocs/
    rm person-management-app.zip
    mv /usr/local/apache2/htdocs/build/ /usr/local/apache2/htdocs/person-management/
EOR

RUN apk del wget curl unzip