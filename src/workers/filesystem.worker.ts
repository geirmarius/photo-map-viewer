import exifr from 'exifr';

self.onmessage = (e) => {
	const file = e.data as File;

	function getGps(file: File) {
		exifr
		.gps(file)
		.then(async (gps) => {
			postMessage({
				file,
				gps,
				thumbUrl: await createThumbnailUrl(file),
			})
		})
	}
	
	function createThumbnailUrl(file: File): Promise<string> {
	
		return new Promise(async (resolve, reject) => {
			const image = await createImageBitmap(file, { resizeHeight: 64, resizeWidth: 64 })
			// const multiplier = 10 / Math.min(image.width, image.height)
			// canvas.width = image.width * multiplier;
			// canvas.height = image.height * multiplier;
			const canvas = new OffscreenCanvas(image.width, image.height);
			const ctx = canvas.getContext('2d');
			ctx?.drawImage(image, 0, 0, canvas.width, canvas.height);
			image.close();
			resolve(URL.createObjectURL(await canvas.convertToBlob({ quality: 70 })));
		})
	}

	getGps(file)
}

