FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    g++ \
    gcc \
    python3 \
    python3-pip \
    nodejs \
    npm \
    openjdk-17-jdk \
    golang \
    rustc \
    cargo \
    coreutils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY runner.sh /app/runner.sh
RUN chmod +x /app/runner.sh

CMD ["/bin/bash"]