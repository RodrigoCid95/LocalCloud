#!/bin/bash

go build -o bin/lc ./cmd/cli
go build -o bin/lc-server ./cmd/server

echo "Ready!"
