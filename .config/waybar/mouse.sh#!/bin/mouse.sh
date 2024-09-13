#!/bin/bash

# Command to check the status of the mouse LED
LED_STATUS=$(m8mouse -g 2>&1)

# Print raw output for debugging purposes
echo "Raw LED status output: $LED_STATUS"

# Check if the command was successful
if [ $? -eq 0 ]; then
  # Extract the LED Mode from the output and remove any extra text
  LED_MODE=$(echo "$LED_STATUS" | grep "LED Mode" | awk -F: '{print $2}' | xargs | awk '{print $1}')

  # Determine the LED status based on the LED Mode value
  case "$LED_MODE" in
    1)
      echo "The mouse LED is in DPI mode."
      ;;
    2)
      echo "The mouse LED is in Multicolor mode."
      ;;
    3)
      echo "The mouse LED is in Rainbow mode."
      ;;
    4)
      echo "The mouse LED is in Flow mode."
      ;;
    5)
      echo "The mouse LED is in Waltz mode."
      ;;
    6)
      echo "The mouse LED is in Four Seasons mode."
      ;;
    7)
      echo "The mouse LED is OFF."
      ;;
    *)
      echo "Unexpected LED Mode value: $LED_MODE"
      ;;
  esac

  # Decide what to do based on the current LED mode
  if [ "$LED_MODE" == "7" ]; then
    # If the LED mode is 7 (Off), set it to 2 (Multicolor)
    notify-send "RedGear Gaming Mouse" "Setting the Mouse LED to Multicolor mode..."
    m8mouse -dpi 1 -led 2 -speed 4
    notify-send "m8mouser" "Successfully set the Mouse LED to Multicolor Mode"
    if [ $? -eq 0 ]; then
      echo "LED mode has been successfully set to Multicolor."
    else
      echo "Failed to set the LED mode to Multicolor. Please check if m8mouse supports this operation."
    fi
  elif [ "$LED_MODE" != "7" ]; then
    # If the LED mode is not 7 (Off), set it to 7 (Off)
   notify-send "RedGear gaming Mouse" "Setting the Mouse LED to off..."
   m8mouse -dpi 1 -led 7 -speed 4
   notify-send "RedGear gaming Mouse" "Successfully turned off the Mouse LED"
    if [ $? -eq 0 ]; then
      echo "LED mode has been successfully set to OFF."
    else
      echo "Failed to set the LED mode to OFF. Please check if m8mouse supports this operation."
    fi
  fi

else
  echo "Failed to check the LED status. Please ensure m8mouse is installed and configured correctly."
fi
