#!/bin/bash

pids=$(pgrep Xvfb)
if [ -n "$pids" ]; then
    export DISPLAY=:99
    Xvfb :99 &
else
    echo "Xvfb running"
fi