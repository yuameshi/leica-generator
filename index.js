window.addEventListener('DOMContentLoaded', () => {
	document.querySelector('#fileInput').addEventListener('change', async (e) => {
		let fileReader = new FileReader();
		let file = e.target.files[0];
		window.e = e;
		if (!e.target || !e.target.files.length || !e.target.files[0]) {
			return;
		}
		let tags = await exifr.parse(file, true);
		console.log(tags);
		fileReader.addEventListener('loadend', async (e) => {
			const img = new Image();
			img.src = /jpg|png|tif|tiff|heic/.test(file.name.split('.')[file.name.split('.').length - 1]) ? e.target.result : await exifr.thumbnailUrl(file);
			if (img.src == undefined) {
				alert('不受支持的图片格式!');
			}
			window.a = e.target.result;
			img.addEventListener('load', () => {
				const canvas = document.querySelector('canvas#canvas');
				const ctx = canvas.getContext('2d');
				const textAreaHeight = img.height * 0.15;
				canvas.height = img.height + textAreaHeight;
				canvas.width = img.width;

				ctx.fillStyle = '#FFF';
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(img, 0, 0);

				const deviceNameStr = `${tags.Make} ${tags.Model}`;
				const detailStr = `f/${tags.FNumber} ${tags.ExposureTime > 1 ? (Math.round(tags.ExposureTime / 1) * 10) / 10 : `1/${Math.round(1 / tags.ExposureTime)}`} ISO${tags.ISO}`;
				const timeObj = tags.DateTimeOriginal || tags.CreateDate || tags.ModifyDate;
				const timeStr = `${timeObj?.getFullYear()}.${timeObj?.getMonth()}.${timeObj?.getDate()} ${timeObj?.getHours()}:${timeObj?.getMinutes()}:${timeObj?.getSeconds()}`;

				let gps;
				if (tags.GPSLatitude && tags.GPSLongitude) {
					gps = `${tags.GPSLatitude[0]}°${tags.GPSLatitude[1]}′${Math.round(tags.GPSLatitude[2])}″${tags.GPSLatitudeRef || ''}  ${tags.GPSLongitude[0]}°${tags.GPSLongitude[1]}′${Math.round(tags.GPSLongitude[2])}″${tags.GPSLongitudeRef || ''}`;
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

				document.querySelector('#saveImageBtn').addEventListener('click', () => {
					// console.log(piexif.load(e.target.result))
					// let zeroth = {};
					// let exif = {};
					// let gps = {};
					// zeroth[piexif.ImageIFD.Make] = tags.Make || 'Leica Generator';
					// zeroth[piexif.ImageIFD.Model] = tags.Model || 'Leica Generator';
					// zeroth[piexif.ImageIFD.XResolution] = [img.width, 1];
					// zeroth[piexif.ImageIFD.YResolution] = [img.height + textAreaHeight, 1];
					// zeroth[piexif.ImageIFD.ProcessingSoftware] = 'Leica Generator by Yuameshi';
					// zeroth[piexif.ImageIFD.DateTime] = `${timeObj?.getFullYear()}:${timeObj?.getMonth()}:${timeObj?.getDate()} ${timeObj?.getHours()}:${timeObj?.getMinutes()}:${timeObj?.getSeconds()}`;
					// zeroth[piexif.ImageIFD.Software] = 'Leica Generator by Yuameshi';
					// exif[piexif.ExifIFD.FNumber] = tags.FNumber;
					// exif[piexif.ExifIFD.ExposureTime] = tags.ExposureTime;
					// exif[piexif.ExifIFD.ISOSpeedRatings] = tags.ISO;
					// exif[piexif.ExifIFD.DateTimeOriginal] = `${timeObj?.getFullYear()}:${timeObj?.getMonth()}:${timeObj?.getDate()} ${timeObj?.getHours()}:${timeObj?.getMinutes()}:${timeObj?.getSeconds()}`;
					// gps[piexif.GPSIFD.GPSVersionID] = tags.GPSVersionID.split('.');
					// gps[piexif.GPSIFD.GPSLatitudeRef] = tags.GPSLatitudeRef;
					// gps[piexif.GPSIFD.GPSLatitude] = tags.GPSLatitude;
					// gps[piexif.GPSIFD.GPSLongitudeRef] = tags.GPSLongitudeRef;
					// gps[piexif.GPSIFD.GPSLongitude] = tags.GPSLongitude;
					// gps[piexif.GPSIFD.GPSTimeStamp] = tags.GPSTimeStamp;
					// let exifObj = { '0th': zeroth, Exif: exif, GPS: gps };
					// console.log(exifObj)
					// let exifStr = piexif.dump(exifObj);
					const a = document.createElement('a');
					a.href = canvas.toDataURL('image/jpeg');
					// a.href = piexif.insert(exifStr, canvas.toDataURL('image/jpeg'));
					a.download = `${file.name}-Leica.png`;
					a.click();
				});
			});
		});
		fileReader.readAsDataURL(file);
	});
});
