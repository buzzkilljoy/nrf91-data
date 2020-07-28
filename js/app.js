// Global objects

const api = new NRFCloudAPI(localStorage.getItem('apiKey'));
const leafletMap = L.map('leaflet-map').setView([63.4206897, 10.4372859], 15);
const lastDate = new Date();
let counterInterval;
let requestInterval;
let flipped = false;

// Setup the map

leafletMap.addLayer(L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19,
}));

leafletMap.zoomControl.remove();

const pizzaMarker = L.marker([63.4206897, 10.4372859], {
	icon: L.icon({
		iconUrl: 'images/pizza_map_icon.png',
		iconSize: [40, 41],
		iconAnchor: [20, 41]
	})
}).addTo(leafletMap);

// Create marker for destination (NordicSemiconductor Oslo office)
L.marker([0, 0], {
	icon: L.icon({
		iconUrl: 'images/nordic_logo_small.png',
		iconSize: [40, 35],
		iconAnchor: [20, 18]
	})
})
	.setLatLng({
		lat: Number(localStorage.getItem('destLat') || '59.919629'),
		lon: Number(localStorage.getItem('destLon') || '10.687080'),
	})
	.addTo(leafletMap);

// Create marker for BOSCH
L.marker([0, 0], {
	icon: L.icon({
		iconUrl: 'images/bosch_logo_small.png',
		iconSize: [80, 18],
		iconAnchor: [40, 9]
	})
})
	.setLatLng({
		lat: Number(localStorage.getItem('boschLat') || '59.914682'),
		lon: Number(localStorage.getItem('boschLon') || '10.798602'),
	})
	.addTo(leafletMap);

// Load devices from nRFCloud api and populate list in settings view
function loadDeviceNames() {
	$('#statusMessageSmall').text('Loading device names');
	$('#device-list').empty().append('Refreshing device list...');
	api.devices().then(({ items }) => {
		if (items.length < 1) {
			throw new Error();
		}
		$('#device-list').empty();
		items.forEach(({ id, name }) => {
			const deviceItem = $(`<a class="list-group-item list-group-item-action">${name}</a>`);
			deviceItem.click(() => {
				$('#device-list').children().removeClass('active');
				deviceItem.addClass('active');
				localStorage.setItem('deviceId', id);
			});
			$('#device-list').append(deviceItem);
		});
		$('#statusMessageSmall').text('Device names loaded');
	})
		.catch(() => $('#device-list').empty().append('No devices found.'));
}

// Show toast message
function showToast(title, subtitle, content, type, delay) {
	$.toast({ title, subtitle, content, type, delay });
}

// Simple NMEA GPGGA sentence decoder
function decodeGPS(data) {
	const [type, , lat, latHem, lon, lonHem] = data.split(',');
	if (type === '$GPGGA') {
		let la = Number(lat) / 100;
		let lo = Number(lon) / 100;
		la += -(la % 1) + (la % 1) / 60 * 100;
		lo += -(lo % 1) + (lo % 1) / 60 * 100;
		return {
			lat: la * (latHem === 'N' ? 1 : -1),
			lon: lo * (lonHem === 'E' ? 1 : -1),
		}
	}
	return undefined;
}

// Collection of update functions for different message types of nRFCloud device messages
const updateFunc = {
	FLIP: data => {
		if (data === 'UPSIDE_DOWN') {
			$('#flip').text('Yes');
			$('#flip-image').attr('src', 'images/pizzabox_down.png');
			if (!flipped) {
				showToast('Free Pizza!', '7 seconds ago', 'Your Pizza was flipped and landed upside down. It is now a mess but also free of charge.','success',15000);
				$('#cost').text('$0');
				$('#costText').text('Pizza is on us');
				flipped = true;
			}
		}
	},
	GPS: data => {
		const pos = decodeGPS(data);
		if (!pos) {
			return;
		}
		pizzaMarker.setLatLng(pos);
		$('#locLatitude').text(pos.lat);
		$('#locLongitude').text(pos.lon);
		// Pan to position and leave dots as a track
		leafletMap.panTo(pos).addLayer(L.circleMarker(pos, { radius: 4, color: '#00a9ce' }));
	},
	TEMP: data => {
		templimit = localStorage.getItem('tempLimit');
		if (Number(data) > templimit) {
			$('#airTemperatureText').text('HOT!');
		}
		if (Number(data) < templimit) {
			$('#airTemperatureText').text('OK');
		}
		$('#airTemperature').text(data);
	},
	AIR_QUAL: data => {
		$('#airQuality').text(data);
	},
	AIR_PRESS: data => {
		$('#airPressure').text(data);
	},
	HUMID: data => {
		$('#airHumidity').text(data);
	}
}

async function getNewMessages() {
	const nowDate = new Date();

	$('#statusMessageSmall').text('Get messages');
	date_diff = (nowDate-lastDate)/1000;
	$('#statusMessageBig').text(date_diff);

	const { items } = await api.getMessages(localStorage.getItem('deviceId') || '');

	/*
	if (items == undefined || items.length == 0) {
		const msgDate = new Date();
		$('#statusMessageSmall').text('No messages');
		date_diff = (msgDate-lastDate)/1000;
		$('#statusMessageBig').text(date_diff);

		return;
	}
	*/

	(items || [])
		.map(({ message }) => message)
		.forEach(({ appId, data }) => {
			if (!updateFunc[appId]) {
				console.log('unhandled appid', appId, data);
				return;
			}
			$('#statusMessageSmall').text('New message');
			$('#statusMessageBig').text('0');
			const msgDate = new Date();
			lastDate = msgDate
			updateFunc[appId](data);
		});

}

function startTracking() {

	getNewMessages();

	// stop previous intervals if there was an order already
	clearInterval(requestInterval);

	// check nRFCloud messages from the device every 5 seconds
	requestInterval = setInterval(getNewMessages, 30000);
	
	/*
	requestInterval = setInterval(async () => {
		$('#statusMessageSmall').text('Check messages');
		getNewMessages();
	}, 5000);
	*/

}

// Main function
$(document).ready(() => {
	// Set initial values
	$('#api-key').val(localStorage.getItem('apiKey') || '');
	$('body').tooltip({ selector: '[data-toggle="tooltip"]' });

	// Main logo toggling fullscreen
	$('#mainlogo').click(() => document.documentElement.webkitRequestFullScreen());

	// Tab bar view selector buttons:
	$('.view-btn').click(({ target }) => {
		const id = target.id.replace('Btn', '');

		['splash', 'map', 'sensor', 'settings']
			.filter(key => key !== id)
			.forEach(key => {
				$(`#${key}View`).removeClass('d-flex').addClass('d-none');
				$(`#${key}Btn`).removeClass('text-white').addClass('nrf-light-blue');
			});

		$(`#${id}Btn`).removeClass('nrf-light-blue').addClass('text-white');
		$(`#${id}View`).removeClass('d-none').addClass('d-flex');

		if (id === 'settings') {
			loadDeviceNames();
		}
		if (id === 'map') {
			leafletMap.invalidateSize();
		}
	});

	// Settings view, api key change:
	$('#api-key').on('input', () => {
		api.accessToken = $('#api-key').val().trim();
		localStorage.setItem('apiKey', api.accessToken);
		loadDeviceNames();
	});

	// Settings view, temp limit change:
	$('#temperature-limit').on('input', () => {
		localStorage.setItem('tempLimit',$('#temperature-limit').val().trim());
	});

	$('#statusMessageSmall').text('Start tracking');
	$('#statusMessageBig').text('STARTING');

	startTracking();

	$('#statusMessageSmall').text('Tracking started');
	$('#statusMessageBig').text('STARTED');
});
