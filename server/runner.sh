#!/bin/bash

LANGUAGE=$1
FILE=$2
INPUT=$3

if [ "$LANGUAGE" = "cpp" ]; then
    g++ $FILE -O2 -o main
    timeout 2s ./main < $INPUT
fi

if [ "$LANGUAGE" = "c" ]; then
    gcc $FILE -O2 -o main
    timeout 2s ./main < $INPUT
fi

if [ "$LANGUAGE" = "python" ]; then
    timeout 2s python3 $FILE < $INPUT
fi

if [ "$LANGUAGE" = "node" ]; then
    timeout 2s node $FILE < $INPUT
fi

if [ "$LANGUAGE" = "java" ]; then
    javac $FILE
    CLASS=$(basename $FILE .java)
    timeout 2s java $CLASS < $INPUT
fi

if [ "$LANGUAGE" = "go" ]; then
    go build -o main $FILE
    timeout 2s ./main < $INPUT
fi

if [ "$LANGUAGE" = "rust" ]; then
    rustc $FILE
    timeout 2s ./$(basename $FILE .rs) < $INPUT
fi