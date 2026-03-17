#!/bin/bash

LANGUAGE=$1
FILE=$2
INPUT=$3

if [ "$LANGUAGE" = "cpp" ]; then
    g++ $FILE -O2 -o /tmp/main
    timeout 2s /tmp/main < $INPUT
fi

if [ "$LANGUAGE" = "c" ]; then
    gcc $FILE -O2 -o /tmp/main
    timeout 2s /tmp/main < $INPUT
fi

if [ "$LANGUAGE" = "python" ]; then
    timeout 2s python3 $FILE < $INPUT
fi

if [ "$LANGUAGE" = "node" ]; then
    timeout 2s node $FILE < $INPUT
fi

if [ "$LANGUAGE" = "java" ]; then
    cp $FILE /tmp/
    cd /tmp
    javac $(basename $FILE)
    CLASS=$(basename $FILE .java)
    timeout 2s java $CLASS < $INPUT
fi

if [ "$LANGUAGE" = "go" ]; then
    go build -o /tmp/main $FILE
    timeout 2s /tmp/main < $INPUT
fi

if [ "$LANGUAGE" = "rust" ]; then
    rustc -o /tmp/main $FILE
    timeout 2s /tmp/main < $INPUT
fi