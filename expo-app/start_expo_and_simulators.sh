#!/bin/bash

# Array of simulator UUIDs
declare -a simulators=("D76BA11B-E050-4B8E-AAC8-857200B974CB" "54AE02E2-319C-41C1-88CD-3E43D5B44DA0" "3C208767-A0B3-4078-ADC3-6BB34D77D4EF")

# Path to Expo Go app
expoAppPath="$HOME/.expo/ios-simulator-app-cache/Exponent-2.31.5.tar.app"

# Check if Expo Go app exists
if [ ! -d "$expoAppPath" ]; then
    echo "Expo Go app not found at $expoAppPath. Please provide the correct path."
    exit 1
fi

# Your local network IP address
local_ip="127.0.0.1"

# Start the Expo development server in LAN mode
echo "Starting Expo development server in LAN mode..."
npx expo start --lan --port 19000 &

# Capture the PID of the Expo process
expo_pid=$!

# Function to check if a simulator is booted
is_booted() {
    xcrun simctl list | grep "$1" | grep "Booted" > /dev/null
}

# Function to check if the Expo server is up
is_expo_server_up() {
    curl -s --head --request GET http://$local_ip:19000 | grep "200 OK" > /dev/null
}

# Wait for the Expo server to start
echo "Waiting for Expo server to start..."
while ! is_expo_server_up; do
    sleep 5
done

# Loop through each simulator UUID
for i in "${simulators[@]}"
do
    echo "Processing simulator $i..."

    # Shut down the simulator if it's already booted
    if is_booted $i; then
        echo "Simulator $i is already booted. Shutting down..."
        xcrun simctl shutdown $i
        sleep 5
    fi

    # Boot the simulator
    echo "Booting simulator $i..."
    xcrun simctl boot $i
    sleep 10

    # Ensure the simulator is in a booted state
    if ! is_booted $i; then
        echo "Failed to boot simulator $i. Exiting..."
        kill $expo_pid
        exit 1
    fi

    # Install the Expo Go app
    echo "Installing Expo Go app on simulator $i..."
    xcrun simctl install $i "$expoAppPath"

    # Open the URL in the simulator
    echo "Opening URL exp://$local_ip:19000 on simulator $i..."
    xcrun simctl openurl $i exp://$local_ip:19000
done

echo "All simulators processed."

# Wait for user to terminate the script
read -p "Press any key to terminate the Expo server..."

# Stop the Expo server
echo "Stopping Expo server..."
kill $expo_pid

echo "Done."