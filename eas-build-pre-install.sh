#!/bin/bash

# Create the AuthKey file from environment variables
echo "Setting up App Store Connect API Key..."

# Create the private directory if it doesn't exist
mkdir -p private

# Create the AuthKey file
echo "${ASC_API_KEY_CONTENT}" > private/AuthKey_${ASC_API_KEY_ID}.p8

# Give feedback about the created file
echo "Created AuthKey_${ASC_API_KEY_ID}.p8 for issuer ${ASC_API_KEY_ISSUER_ID}"

# Make it accessible to the build process
chmod 600 private/AuthKey_${ASC_API_KEY_ID}.p8

echo "App Store Connect API Key setup complete!"