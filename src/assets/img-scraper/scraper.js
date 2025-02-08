const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

const baseURL = 'https://genshin-impact.fandom.com/wiki';

const elementList = [
  'Pyro',
  'Geo',
  'Dendro',
  'Cryo',
  'Electro',
  'Anemo',
  'Hydro'
];

async function scrapeGenshinCharacterData() {
  try {
    const characterListURL = baseURL + '/Character/List';
    const response = await axios.get(characterListURL, { headers });
    console.log('GET request successful');

    const $ = cheerio.load(response.data);

    const charactersDict = {};

    $('table.article-table, table.sortable').each((tableIndex, table) => {
      const headers = $(table).find('th')
        .map((i, header) => $(header).text().trim().toLowerCase())
        .get();

      const isCharacterTable = headers.some(header =>
        ['character', 'element', 'weapon'].some(keyword => header.includes(keyword))
      );

      if (!isCharacterTable) return;

      // Process each row in the table
      $(table).find('tr').slice(1).each((rowIndex, row) => {
        const cells = $(row).find('td, th');

        // Ensure we have enough cells (per the fandom wikia)
        if (cells.length < 5) return;

        const nameCell = $(cells[1]);
        // get anchor or normal tag (should all have anchor)
        const name = nameCell.find('a').text().trim() || nameCell.text().trim();

        const character = {
          name: name.replace(' ', '_'),
          element: cells.length > 3 ? $(cells[3]).text().trim() : null,
        };

        if (character.name && elementList.includes(character.element)) {
          if (!charactersDict[character.name]) {
            charactersDict[character.name] = character;
          }
        }
      });
    });

    const characters = Object.values(charactersDict)
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(characters);
    return characters;
  } catch (error) {
    console.error('Scraping error:', error);
    throw (error);
  }
}

async function extractImageFromPage(character) {
  const characterURL = baseURL + '/' + character;
  let foundImage;
  try {
    const response = await axios.get(characterURL, { headers });

    console.log('GET request successful');

    const $ = cheerio.load(response.data);

    $('img').each((index, element) => {
      const imgSrc = $(element).attr('data-src') || $(element).attr('src');

      if (imgSrc && !imgSrc.startsWith('data:')) {
        let absoluteURL = imgSrc.startsWith('//') ? 'https:' + imgSrc : imgSrc;
        if (absoluteURL.includes('Full_Wish')) {
          // website scaled down images, not what we want
          absoluteURL = absoluteURL.replace(/\/scale-to-width-down\/\d+/, '');
          console.log(absoluteURL);
          foundImage = absoluteURL;
        }
      }
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 404) {
          console.error("ERR 404: Page doesn't exist / didn't respond");
        } else {
          console.error('Server responded with:', error.response.status);
        }
      }
      throw new Error("image extraction didn't work"); 
    }
  }

  return foundImage;
}

async function downloadImage(characterObject) {
  const imageDir = path.join(__dirname, '..', 'character-icons');
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  try {
    const filename = characterObject.name + '.png';
    const response = await axios({
      url: characterObject.src,
      responseType: 'stream'
    });

    const filePath = path.join(imageDir, filename);
    characterObject.filePath = path.join('character-icons', filename);

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Failed to download ${characterObject.src}: ${error.message}`);
  }
}

async function main() {
  // Fetch character data from list page
  const characterData = await scrapeGenshinCharacterData();

  for (const character of characterData) {
    // Get image URL
    const imgsrc = await extractImageFromPage(character.name);

    if (imgsrc) {
      character.src = imgsrc;
      // download image extracted
      await downloadImage(character);
    }
  }

  console.log(characterData);
  const jsonString = JSON.stringify(characterData, null, 2);

  fs.writeFile('../data/character-data.json', jsonString, (error) => {
    if (error) {
      console.error('Error writing file:', error);
    } else {
      console.log('JSON file saved successfully!');
    }
  });
}

main();
