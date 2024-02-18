ARG VARIANT="20-bookworm"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:${VARIANT}

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
&& apt-get -y install --no-install-recommends xorg openbox libnss3 libasound2 libatk-adaptor libgtk-3-0 libxshmfence1 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgbm1