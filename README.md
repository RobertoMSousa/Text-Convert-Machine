# Text-Convert-Machine

Web page that allow the user to write text on the browser and download it as pdf or html.
The file that were previously generated are also available to download on the home page.

## Author
Roberto Sousa
linkedin:

##Requirements
To run this project you need to have installed the following components on your machine:
* Node.js (https://nodejs.org/en/)
* MongoDB (https://www.mongodb.com/)
* Redis (https://redis.io/)

## Installing

Go to root folder of the project
```shell
npm install
gulp install
```

This will install the dependencies that we need to run the project.

## Developing

In order to be able to compile the code you need to generate the html and js code that will be stored on the public folder to pushed into production.
To do that you need to run
```shell
gulp compile
```
After that you should run
```shell
gulp develop
```
This will launch the development environment on localhost:8000 for development purposes.

After this point you should go to localhost:8000 to see the platform running.

## Features

On this platform you can:
* Write rich text online
* Generate the rich text as pdf or html
* Download the generated files


## Licensing

This code is under the public domain, feel free to use it as you please.
