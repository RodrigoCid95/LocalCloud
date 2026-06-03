#!/bin/bash

./bin/lc users add -n user -p 12341234
./bin/lc assignments add user users
./bin/lc assignments add user apps
./bin/lc assignments add user files
./bin/lc assignments add user chat
