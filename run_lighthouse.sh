#!/bin/bash

trap cleanup 0 1 2 3 6

readonly HOST=http://localhost
readonly PORT=4200

function wait_for_serve() {
  attempt_counter=0
  max_attempts=10

  echo "Waiting for app to launch..."
  until $(curl --output /dev/null --silent --head --fail $HOST:$PORT); do
      if [ ${attempt_counter} -eq ${max_attempts} ];then
        echo "App launch failed. Quiting."
        exit 1
      fi

      attempt_counter=$(($attempt_counter+1))
      sleep 5
  done
  echo "App launched successfully."
}

function cleanup() {
  echo "Stopping docker and app..."
  docker stop content-services-api-e2e-mock > /dev/null 2>&1
  kill %1
}

echo "Starting mock services..."
yarn mock-services > /dev/null 2>&1

echo "Serve app..."
ng serve --configuration=travis &
wait_for_serve

echo "Run lighthouse..."
yarn run lighthouse $HOST:$PORT/demo/tab-search

exit
