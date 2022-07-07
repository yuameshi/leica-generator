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
				EXIF.getData(img, async function () {
					const MiSansRegular = new FontFace('MiSans', 'url(./fonts/MiSans-Regular.woff2)');
					await MiSansRegular.load();
					document.fonts.add(MiSansRegular);
					const MiSansBold = new FontFace('MiSans', 'url(./fonts/MiSans-Bold.woff2)', { weight: 'bold' });
					await MiSansBold.load();
					document.fonts.add(MiSansBold);
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
					const detailStr = `f/${tags.FNumber} ${reductionTo(tags.ExposureTime?.numerator, tags.ExposureTime?.denominator).join('/')} ISO${tags.ISOSpeedRatings}`;

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

					let gps;
					if (tags.GPSLatitude && tags.GPSLongitude) {
						gps = `${tags.GPSLatitude[0]}°${tags.GPSLatitude[1]}′${tags.GPSLatitude[2]}″${tags.GPSLatitudeRef || ''}  ${tags.GPSLongitude[0]}°${tags.GPSLongitude[1]}′${tags.GPSLongitude[2]}″${tags.GPSLongitudeRef || ''}`;
					}

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
					})(tags.DateTimeOriginal || tags.DateTime || tags.DateTimeDigitized, gps);

					(function drawDividingLine() {
						ctx.fillStyle = '#d3d3d3';
						ctx.textBaseline = 'top';
						ctx.textAlign = 'left';
						ctx.font = `bold ${textAreaHeight * 0.2}px 'MiSans'`;
						const detailWidth = ctx.measureText(detailStr).width;
						ctx.font = `bold ${textAreaHeight * 0.17}px 'MiSans'`;
						const timeWidth = ctx.measureText(gps || tags.DateTimeOriginal || tags.DateTime || tags.DateTimeDigitized).width;
						ctx.fillRect(img.width - Math.max(detailWidth, timeWidth) - img.width * 0.04, img.height + textAreaHeight * 0.28, img.width * -0.0025, textAreaHeight * 0.425);
					})();

					(function drawLeika() {
						const imgLeika = new Image();
						imgLeika.src = './leica.svg';
						imgLeika.addEventListener('load', () => {
							ctx.font = `bold ${textAreaHeight * 0.2}px 'MiSans'`;
							const detailWidth = ctx.measureText(detailStr).width;
							ctx.font = `bold ${textAreaHeight * 0.17}px 'MiSans'`;
							const timeWidth = ctx.measureText(gps || tags.DateTimeOriginal || tags.DateTime || tags.DateTimeDigitized).width;
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
function reductionTo(m, n) {
	function isInteger(obj) {
		return obj % 1 === 0;
	}
	let arr = [];
	if (!isInteger(m) || !isInteger(n)) {
		return [1];
	} else if (m <= 0 || n <= 0) {
		return [1];
	}
	let a = m;
	let b = n;
	a >= b ? ((a = m), (b = n)) : ((a = n), (b = m));
	if (m != 1 && n != 1) {
		for (let i = b; i >= 2; i--) {
			if (m % i == 0 && n % i == 0) {
				m = m / i;
				n = n / i;
			}
		}
	}
	arr[0] = m;
	if (n !== 1) {
		arr[1] = n;
	}
	return arr;
}
