# Pocketmock
Mock API server for local development.

## Installation
To install, run:
```shell
npm i -g pocketmock
```

## Usage
Currently, Pocketmock only supports serving static assets as API responses.

## Options
### -d, --dir
The directory that contains the static response data files.
Defaults to ```data```.

### -p, --port
The port from which to serve the API responses.
Defaults to ```3000```.

### -e, --ext
File extension of the static response data files. If this is set to ```json``` and a request is made to ```/some-request```, Pocketmock will look for a static file at ```/some-request.json```.

### Static API server
Pocketmock takes the request URL path and tries to map it to a static file. If a file is found, the contents of that file are sent as the response.

To create a static API server that looks for response data files in a directory named "mock-data", run:
```shell
pocketmock static -d mock-data
```

### Sample data
To create some sample data to test out pocketmock, run
```pocketmock sample``` and then ```pocketmock static```. A mock API will be started on the default port ```3000``` and serve responses from the default data directory in ```data```.


## License
This project is licensed under the terms of the MIT license.
