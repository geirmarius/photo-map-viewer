<script setup lang="ts">
import { ref, unref, watch } from 'vue';
import LeafletMap from './components/LeafletMap.vue'
import { open, photos, activePhoto } from './utilities/filesystem'

const activePhotoUrl = ref<string | null>(null);

watch(activePhoto, (photo) => {
  if (activePhotoUrl.value != null) URL.revokeObjectURL(activePhotoUrl.value)
  if (photo?.file != null) activePhotoUrl.value = URL.createObjectURL(photo.file)
})

function next() {
  const index = photos.findIndex((photo) => photo.file === activePhoto.value?.file);
  activePhoto.value = (index + 1 >= photos.length)
    ? photos[0]
    : photos[index + 1]
}

function prev() {
  const index = photos.findIndex((photo) => photo.file === activePhoto.value?.file);
  activePhoto.value = (index === 0)
    ? photos[photos.length - 1]
    : photos[index - 1]
}
</script>

<template>
  <div class="app">
    <nav class="app__nav">
      <button v-on:click="open()" class="button">Open directory</button>
      <div>{{ photos.length }} files</div>
      <ul style="display: contents">
        <li v-for="photo in photos" :key="photo" class="file-list-item" v-on:click="activePhoto = photo">
          <img class="thumb" :src="photo.thumbUrl" alt="">
          <span class="overflow-text">{{ photo.file.name }}</span>
          <span class="gray">{{ photo.gps ? '' : '(no gps)' }}</span>
        </li>
      </ul>
    </nav>
    <LeafletMap class="app__map" />
    <div class="app__gallery" v-if="activePhoto != null">
      <img class="full-photo" v-if="activePhotoUrl != null" :src="activePhotoUrl" alt="">
      <div class="full-photo" v-else></div>
      <div class="gallery-nav">
        <button class="button" v-on:click="prev()">Prev</button>
        <span class="overflow-text">{{ activePhoto.file.name }}</span>
        <button class="button" v-on:click="next()">Next</button>
        <button class="button" v-on:click="activePhoto = null">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-columns: 24rem minmax(0, 1fr);
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  height: 100vh;
}

.app__nav {
  min-height: 0;
  overflow: auto;
  display: grid;
  gap: 1rem;
  padding: 1rem;
  grid-template-rows: max-content;
}

.app__gallery {
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) max-content;
  padding: 1rem;
  gap: 1rem;
}

.full-photo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.button {
  padding: 1rem;
}

.thumb {
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  border-radius: 3px;
}

.overflow-text {
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-list-item {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr) max-content;
  gap: 1rem;
  align-items: center;
  contain-intrinsic-size: 0 0;
}

.gray {
  color: gray;
}

.gallery-nav {
  display: grid;
  gap: 1rem;
  grid-template-columns: max-content 1fr;
  grid-auto-columns: max-content;
  grid-auto-flow: column;
  align-items: center;
}

button[aria-disabled="true"] {
  opacity: .6;
}
</style>
