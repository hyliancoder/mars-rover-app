import fetch from 'isomorphic-unfetch';
import { readFileSync, createWriteStream, existsSync, mkdirSync } from 'fs';
import download from 'image-downloader';

const dateFile = 'api/src/assets/files/dates.txt';

export const findExtensionOfString = string => {
  const regex = new RegExp('[^.]+$');
  const extension = string.match(regex);
  return extension;
};
  
export const getDatesFromFile = file => {
const datesArr = readFileSync(file, 'utf8').toString().split('\n');
const formattedDatesArr = datesArr.map(date => (date = new Date(date).toLocaleDateString('fr-CA')));
return formattedDatesArr;
};

  async function downloadImage(options) {
    try {
      const { filename, image } = await download.image(options)
      console.log(filename) 
    } catch (e) {
      console.error(e)
    }
  }
   

export const fetchNasaApiImages = async url => {
  try {
    const res = await fetch(url);
    const data = await res.json();
    const flatPhotoData = [].concat(...data.photos);
    return flatPhotoData;
  } catch (error) {
    console.log(
      'There has been a problem with your fetch operation: ',
      error.message
    );
  }
};

export const saveNasaImagesToDisk = async url => {
  const imgArr = await fetchNasaApiImages(url);
  const imgDownload = imgArr.map(async entry => {
    const imgFolder = `api/src/assets/images`;
    const imgUrl = entry.img_src.replace(/http:/, 'https:');
    const imgExt = await findExtensionOfString(imgUrl);
    const fileName = `${entry.earth_date}_${entry.id}.${imgExt}`;
    const filePath = `${imgFolder}/${fileName}`

    !existsSync(imgFolder) && mkdirSync(imgFolder, { recursive: true });
    const nasaApiOptions = {
        url: imgUrl,
        dest: filePath,
        timeout: 300000
      }
    await downloadImage(nasaApiOptions)
  });
  return imgDownload;
};

export const saveImagesInDateRange = async () => {
  const datesArr = await getDatesFromFile(dateFile);
  datesArr.map(async date => {
    const nasaUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=${date}&api_key=${process.env.nasaApiKey}`;
    const saveDateImages = await saveNasaImagesToDisk(nasaUrl);
    return saveDateImages
  });
};