#!/bin/bash
set -euo pipefail
docker build . -t ssr-proxy
docker build example -t ssr-proxy-example
docker-compose up
