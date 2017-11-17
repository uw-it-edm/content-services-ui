This Docker container returns a static response to api calls made by content-services-ui. 
It is used for running Protractor tests so that external services are mocked. 

To build the container :

 ```docker build -t content-services-api-mock . ```
 
Then, run it, by exposing a port, and mounting a volume where the configs and the static configs list is

```docker run --name content-services-api -it --rm  -p 8080:80 -v ${PWD}/mocks/:/usr/share/nginx/html/ content-services-api-mock```

You should now be able to access profile api

```http localhost:8080/profile/v1/app/my-app```

Be sure to serve the app with the corrensponding environment.ts file that uses `localhost:8080` as the api urls. 
