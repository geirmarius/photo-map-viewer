<script setup lang="ts">
import { ref, watch } from 'vue';
import 'leaflet/dist/leaflet.css';
import leaflet from 'leaflet';
import { activePhoto, photos } from '../utilities/filesystem';

const mapEl = ref<null | HTMLElement>(null);
let map;

function addPhotos(entries: typeof photos) {
	entries.forEach((photo) => {
		if (photo.gps?.latitude == null) return;

		const icon =	leaflet.divIcon({
			className: 'photo-map-icon',
			iconSize: 48,
			html: `<img src="${photo.thumbUrl}" alt="">`,
		})

		leaflet
			.marker([photo.gps.latitude, photo.gps.longitude], { icon })
			.addTo(map)
			.on('click', () => activePhoto.value = photo)
	})
}

if (map != null) addPhotos(photos)

watch(photos, (photos) => {
	if (map != null) addPhotos(photos)
})

watch(mapEl, (el) => {
	if (el) {
		map = leaflet
			.map(el, {
				center: [59.9, 10.7],
				zoom: 13,
			});

		leaflet
			.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
					maxZoom: 19,
					attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			})
			.addTo(map);
	}
})
</script>

<template>
	<div style="width: 100%; height: 100%;" :ref="(el) => mapEl = (el as HTMLElement)"></div>
</template>

<style>
	.photo-map-icon {
		background-color: white;
		border-radius: 6px;
		padding: 3px;
		display: grid;
		outline: 1px solid lightgray;
	}

	.photo-map-icon img {
		min-width: 0 !important;
		min-height: 0 !important;
		width: 100% !important;
		height: 100% !important;
		object-fit: cover;
		border-radius: 3px;
	}
</style>