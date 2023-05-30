import { dump, load, insert, ImageIFD } from 'piexifjs';
import { parse, thumbnailUrl } from 'exifr';

import Canon from './icons/Canon.svg';
import Fujifilm from './icons/Fujifilm_2006.svg';
import Leica from './icons/leica.svg';
import Nikon from './icons/Nikon_2003.svg';
import Olympus from './icons/Olympus_Corporation_logo.svg';
import Panasonic from './icons/Panasonic.svg';
import Sony from './icons/Sony.svg';

let originalImgData: string | ArrayBuffer;

window.addEventListener('DOMContentLoaded', () => {
	(document.querySelector('#fileInput') as HTMLInputElement).addEventListener('change', async (e: any) => {
		const fileReader = new FileReader();
		const file = e.target!.files[0];
		if (!e.target || !e.target.files.length || !e.target.files[0]) {
			return;
		}
		const tags = await parse(file, true);
		console.log(tags);
		fileReader.addEventListener('loadend', async (e) => {
			const img = new Image();
			originalImgData = e.target!.result!;
			img.src = (/jpg|jpeg|gif|png|tif|tiff|heic/i.test(file.name.split('.')[file.name.split('.').length - 1]) ? e.target!.result!.toString() : await thumbnailUrl(file)) || 'undefined';
			if (img.src == 'undefined') {
				alert('不受支持的图片格式!');
			}
			img.addEventListener('load', () => {
				const canvas = document.querySelector('canvas#canvas') as HTMLCanvasElement;
				const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
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
					ctx.fillRect(img.width - Math.max(detailWidth, timeWidth) - textAreaHeight * 0.3 - img.width * 0.01, img.height + textAreaHeight * 0.28, img.width * -0.0025, textAreaHeight * 0.425);
				})();

				(function drawLogo() {
					const imgLogo = new Image();
					let src = Leica;
					switch (tags.Make) {
						case 'SONY': {
							src = Sony;
							break;
						}
						case 'Canon': {
							src = Canon;
							break;
						}
						case 'NIKON CORPORATION': {
							src = Nikon;
							break;
						}
						case 'FUJIFILM': {
							src = Fujifilm;
							break;
						}
						case 'Panasonic': {
							src = Panasonic;
							break;
						}
						case 'OM Digital Solutions': {
							src = Olympus;
							break;
						}
						default: {
							src = Leica;
							break;
						}
					}
					imgLogo.src = src;
					imgLogo.addEventListener('load', () => {
						ctx.font = `bold ${textAreaHeight * 0.2}px 'MiSans'`;
						const detailWidth = ctx.measureText(detailStr).width;
						ctx.font = `bold ${textAreaHeight * 0.17}px 'MiSans'`;
						const timeWidth = ctx.measureText(gps || timeStr).width;
						const logoHeight = textAreaHeight * 0.425;
						const logoWidth = logoHeight * (imgLogo.width / imgLogo.height);
						ctx.drawImage(imgLogo, img.width - Math.max(detailWidth, timeWidth) - textAreaHeight * 0.3 - img.width * 0.02 - logoWidth, img.height + textAreaHeight * 0.28, logoWidth, logoHeight);
					});
				})();

				document.querySelector('#saveImageBtn')!.addEventListener('click', () => {
					const exifData = load(originalImgData);
					exifData['0th'][ImageIFD.ProcessingSoftware] = 'Leica Generator by Yuameshi';
					exifData['0th'][ImageIFD.Software] = 'Leica Generator by Yuameshi';
					let exifStr = dump(exifData);
					const a = document.createElement('a');
					// a.href = canvas.toDataURL('image/jpeg');
					a.href = insert(exifStr, canvas.toDataURL('image/jpeg', 1));
					a.download = `${file.name}-Leica.jpg`;
					a.click();
				});
			});
		});
		fileReader.readAsDataURL(file);
	});
});

