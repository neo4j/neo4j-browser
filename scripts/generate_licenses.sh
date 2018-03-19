#!/bin/bash

NOTICE_FILE="./NOTICE.txt"
NOTICE_FILE_XML="./NOTICE.xml"
LICENSES_FILE="./LICENSES.txt"

# Generate NOTICE.txt with list of dependencies and their license
# Limit to runtime dependencies
cat ./scripts/static_data/NOTICE_HEADER.txt > $NOTICE_FILE && yarn licenses list --production >> $NOTICE_FILE;
cat ./scripts/static_data/NOTICE_XML_HEADER.txt > $NOTICE_FILE_XML && yarn licenses list --production --json --no-progress | node ./scripts/generate_licenses_xml.js >> $NOTICE_FILE_XML;

# Generate LICENSES.txt with list of full text version of the licenses that dependecies use
# Limit to runtime licenses
cat ./scripts/static_data/LICENSES_HEADER.txt > $LICENSES_FILE && yarn licenses generate-disclaimer --production >> $LICENSES_FILE;

exit 0;