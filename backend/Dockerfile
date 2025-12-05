# syntax=docker/dockerfile:1.5
FROM python:3.14-bookworm AS base
ARG BACKEND_PORT
ARG MODEL_PATH
ENV BACKEND_PORT=$BACKEND_PORT
ENV MODEL_PATH=$MODEL_PATH
# set working directory inside the container to /app
WORKDIR /app
# Install system dependencies (uvicorn performance)
RUN apt-get update && apt-get install -y libpq-dev build-essential && apt-get clean && rm -rf /var/lib/apt/lists/*
# copy application files from to container's working directory
COPY . ./
# Copy requirements.txt to container
COPY requirements.txt .
# Use build cache for faster pip installs
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt
# start application with uvicorn on image start
CMD uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT --reload