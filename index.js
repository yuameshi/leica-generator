window.addEventListener('DOMContentLoaded', () => {
	document.querySelector('#fileInput').addEventListener('change', (e) => {
		let fileReader = new FileReader();
		let file = e.target.files[0];
		if (!e.target || !e.target.files.length || !e.target.files[0]) {
			return;
		}
		fileReader.addEventListener('loadend', (e) => {
			const img = new Image();
			img.src = e.target.result;
			img.addEventListener('load', () => {
				const canvas = document.querySelector('canvas#canvas');
				const ctx = canvas.getContext('2d');
				EXIF.getData(img, function () {
					const tags = EXIF.getAllTags(this);
					console.log(tags);

					const canvas = document.querySelector('canvas#canvas');
					const textAreaHeight = img.height * 0.15;
					canvas.height = img.height + textAreaHeight;
					canvas.width = img.width;
					const ctx = canvas.getContext('2d');

					ctx.fillStyle = '#FFF';
					ctx.fillRect(0, 0, canvas.width, canvas.height);
					ctx.drawImage(img, 0, 0);

					const deviceNameStr = `${tags.Make} ${tags.Model}`;
					const detailStr = `f/${tags.FNumber} ${
						tags.ExposureTime?.numerator > tags.ExposureTime?.denominator ? (Math.round(tags.ExposureTime?.numerator / tags.ExposureTime?.denominator) * 10) / 10 : `1/${Math.round(tags.ExposureTime?.denominator / tags.ExposureTime?.numerator)}`
					} ISO${tags.ISOSpeedRatings}`;
					let timeStr = tags.DateTimeOriginal || tags.DateTimeDigitized || tags.DateTime;
					try {
						timeStr = `${timeStr.split(' ')[0].replace(/:/g, '.')} ${timeStr.split(' ')[1]}`;
					} catch (e) {
						alert('您的照片的EXIF信息的时间部分可能有些问题或不规范');
					}

					let gps;
					if (tags.GPSLatitude && tags.GPSLongitude) {
						gps = `${tags.GPSLatitude[0]}°${tags.GPSLatitude[1]}′${Math.round(tags.GPSLatitude[2])}″${tags.GPSLatitudeRef || ''}  ${tags.GPSLongitude[0]}°${tags.GPSLongitude[1]}′${Math.round(tags.GPSLongitude[2])}″${
							tags.GPSLongitudeRef || ''
						}`;
					}

					(function drawDeviceName(deviceName) {
						ctx.fillStyle = '#000';
						ctx.font = `bold ${textAreaHeight * 0.2}px 'MiSans'`;
						ctx.textBaseline = 'top';
						ctx.textAlign = 'left';
						ctx.fillText(deviceName, textAreaHeight * 0.3, img.height + textAreaHeight * 0.3);
					})(deviceNameStr);

					(function drawDetail(detailStr) {
						ctx.fillStyle = '#000';
						ctx.font = `bold ${textAreaHeight * 0.2}px 'MiSans'`;
						ctx.textBaseline = 'top';
						ctx.textAlign = 'right';
						ctx.fillText(detailStr, img.width - textAreaHeight * 0.3, img.height + textAreaHeight * 0.3);
					})(detailStr);

					(function drawTimeAndGps(timeStr, gpsStr) {
						ctx.fillStyle = '#737373';
						ctx.font = `${textAreaHeight * 0.17}px 'MiSans'`;
						ctx.textBaseline = 'top';
						ctx.textAlign = 'right';
						if (gpsStr !== undefined) {
							ctx.fillText(gpsStr, img.width - textAreaHeight * 0.3, img.height + textAreaHeight * 0.55);
							ctx.textAlign = 'left';
							ctx.fillText(timeStr, textAreaHeight * 0.3, img.height + textAreaHeight * 0.55);
						} else {
							ctx.fillText(timeStr, img.width - textAreaHeight * 0.3, img.height + textAreaHeight * 0.55);
						}
					})(timeStr, gps);

					(function drawDividingLine() {
						ctx.fillStyle = '#d3d3d3';
						ctx.textBaseline = 'top';
						ctx.textAlign = 'left';
						ctx.font = `bold ${textAreaHeight * 0.2}px 'MiSans'`;
						const detailWidth = ctx.measureText(detailStr).width;
						ctx.font = `bold ${textAreaHeight * 0.17}px 'MiSans'`;
						const timeWidth = ctx.measureText(gps || timeStr).width;
						ctx.fillRect(img.width - Math.max(detailWidth, timeWidth) - img.width * 0.04, img.height + textAreaHeight * 0.28, img.width * -0.0025, textAreaHeight * 0.425);
					})();

					(function drawLeika() {
						const imgLeika = new Image();
						imgLeika.src = './leica.svg';
						imgLeika.addEventListener('load', () => {
							ctx.font = `bold ${textAreaHeight * 0.2}px 'MiSans'`;
							const detailWidth = ctx.measureText(detailStr).width;
							ctx.font = `bold ${textAreaHeight * 0.17}px 'MiSans'`;
							const timeWidth = ctx.measureText(gps || timeStr).width;
							ctx.drawImage(imgLeika, img.width - Math.max(detailWidth, timeWidth) - img.width * 0.05 - textAreaHeight * 0.425, img.height + textAreaHeight * 0.28, textAreaHeight * 0.425, textAreaHeight * 0.425);
						});
					})();

					document.querySelector('#saveImageBtn').addEventListener('click', function () {
						const a = document.createElement('a');
						a.href = canvas.toDataURL('image/png');
						a.download = `${file.name}-Leika.png`;
						a.click();
					});
				});
			});
		});
		fileReader.readAsDataURL(file);
	});
});
