import exifr from 'exifr';
import FileWorker from '../workers/filesystem.worker?worker'
import { ref, shallowReactive } from 'vue';

export const photos = shallowReactive<{ file: File, gps: any, thumbUrl: string }[]>([]);
export const activePhoto = ref<typeof photos[0] | null>(null)

const toPush = [];

const workers = Array.from({ length: 24 }, () => {
	const fileWorker = new FileWorker();

	fileWorker.onmessage = (e) => {
		toPush.push(e.data);
	}

	return fileWorker;
})

function poll() {
	requestIdleCallback(() => {
		poll();
		if (toPush.length) photos.push(...toPush.splice(0, 100))
	})
}

poll();

export function restore() {
	// TODO
}

export async function open() {
	const handle = await showDirectoryPicker()
	let wi = 0;

	async function* getFilesRecursively(entry: FileSystemFileHandle | FileSystemDirectoryHandle): File[] {
		if (entry.kind === "file") {
			const file = await entry.getFile();
			if (file !== null && file.type.startsWith('image/')) {
				yield await file;
			}
		} else if (entry.kind === "directory") {
			for await (const handle of entry.values()) {
				yield* getFilesRecursively(handle);
			}
		}
	}

	for await (const file of getFilesRecursively(handle)) {
		workers[++wi % workers.length].postMessage(file)
	}
}