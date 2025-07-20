#!/bin/sh

# Wait for Weaviate to be up
echo "Waiting for Weaviate to be available..."
until curl -sf http://weaviate:8080/v1/.well-known/ready; do
  sleep 2
done
echo "Weaviate is up!"

# Run the load script
yarn b2b:load

# Start the dev server
yarn dev