import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';

const headers = 
  {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  };

async function scrapeGenshinCharacterData() {
  try {
    const characterListUrl = 'https://genshin-impact.fandom.com/wiki/Character/List';


    const response = await axios.get(characterListUrl, {headers});

    
  } catch (error) {
    console.error('Scraping error:', error);
    throw(error);
  }
}
