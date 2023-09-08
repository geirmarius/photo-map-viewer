import exifr from 'exifr';
import { reactive, ref } from 'vue';

export const photos = reactive<{ file: File, gps: any, url: string, thumbUrl: string }[]>([]);
export const activePhoto = ref<typeof photos[0] | null>(null)

export function restore() {
	// TODO
}

export async function open() {
	const handle = await showDirectoryPicker()

	async function* getFilesRecursively(entry): File[] {
		if (entry.kind === "file") {
			const file = await entry.getFile();
			if (file !== null) {
				yield await file;
			}
		} else if (entry.kind === "directory") {
			for await (const handle of entry.values()) {
				yield* getFilesRecursively(handle);
			}
		}
	}

	for await (const file of getFilesRecursively(handle)) {
		const url = URL.createObjectURL(file)

		exifr
			.gps(file)
			.then(async (gps) => {
				photos.push({
					file,
					gps,
					url,
					thumbUrl: await createThumbnailUrl(url),
				})
			})
	}
}

function createThumbnailUrl(src: string): Promise<string> {
	const image = new Image();
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	return new Promise((resolve, reject) => {
		image.src = src;
		image.onload = () => {
			const multiplier = 100 / Math.min(image.width, image.height)
			canvas.width = image.width * multiplier;
			canvas.height = image.height * multiplier;
			ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);
			resolve(canvas.toDataURL())
		}

		image.onabort = reject;
		image.onerror = reject;
	})

}