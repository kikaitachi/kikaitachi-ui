#!/usr/bin/env bash

deno bundle src/main.js | minify --mime text/javascript > web/main.js && \
  minify src/main.css > web/main.css && \
  cat src/index.html | sed -e '/<!-- css -->/{r web/main.css' -e 'd}' | \
  sed -e '/<!-- js -->/{r web/main.js' -e 'd}' > web/index.html && \
  rm web/main.js web/main.css
