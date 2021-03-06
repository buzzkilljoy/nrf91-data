## Introduction
This repository contains source code for the nRF91 Data web application, based on the nRF91 Pizza web application. 
The main purpose of the application is to demonstrate how to pull data from nRF Cloud with the Device REST API.

As a developer, this means you have a quick way of displaying near-live data from your Thingy:91 in a custom interface. There is no need to write firmware or cloud code for your cellular IoT prototype.

The following quote is from the Device API Getting Started Guide:

> The nRF Connect for Cloud Device API allows you to programmatically interact with, and retrieve historical information generated by, any device that you have connected to nRFCloud.com. The Device API consists of both a REST API and an MQTT API. The REST API is easier for Web engineers to understand and work with. It is designed with them in mind, and to support building custom Web applications that support IoT solutions, e.g., an admin dashboard.

Please check out these resources for more details on working with the Device API: 
* *Getting Started Guide* in the [nRF Connect for Cloud docs](https://nrfcloud.com/#/docs)
* *REST API Docs* in the [nRF Connect for Cloud docs](https://nrfcloud.com/#/docs)
* [Experiment with the API in Swagger UI](http://petstore.swagger.io/?url=https://docs.api.nrfcloud.com/api/api-rest.yaml)

## Features
* Connect to any device you have running in nRF Connect for Cloud
* Read and display GPS position
* Read and display temperature
* Read and display humidity
* Read and display air quality

The relevant code for connecting to the REST API is available in `cloud-api.js`. The code for parsing data is available in `app.js`.

## Requirements
![Image of Thingy:91](https://github.com/NordicPlayground/nrf91-pizza/blob/master/images/thingy91.png)

Nordic **Thingy:91** Cellular IoT prototyping kit. [Buy here](https://www.nordicsemi.com/About-us/BuyOnline?search_token=nRF6943&series_token=nRF9160)

## How to use
In order to use this web application you must first set up your Thingy:91 and connect it to nRF Connect for Cloud. Refer to the [Thingy:91 Get Started Guide](https://www.nordicsemi.com/Software-and-tools/Prototyping-platforms/Nordic-Thingy-91/GetStarted).

If you can see data from your Thingy:91 being published in nRF Connect for Cloud you are ready for the next steps:
1. Copy your API Key from nRF Connect for Cloud - [https://nrfcloud.com/#/account](https://nrfcloud.com/#/account) 
2. Open the live demo web app - [https://buzzkilljoy.github.io/nrf91-data/](https://buzzkilljoy.github.io/nrf91-data/)
3. Click the gears icon in the top right corner
4. Paste the API Key
5. Select your device in the dropdown menu

## Limitations
The app has only been tested on iOS Safari browser and the Linux Firefox browser.

## Third-party licenses
* **Leaflet** - [BSD 2-Clause "Simplified" License](https://github.com/Leaflet/Leaflet/blob/master/LICENSE)
* **jQuery** - [MIT License](https://jquery.org/license/)
* **Bootstrap** - [MIT License](https://getbootstrap.com/docs/4.0/about/license/)

## A note on support
It is provided as-is, without any warranty. 
