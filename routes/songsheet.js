var express = require('express');
var router = express.Router();

const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet('17yatCHl9WbWsE62Nk05ADFsphGZUA65JYpwaW_HEtFM');

/* GET users listing. */
router.post('/', function(req, res, next) {
  (async function() {
    var keywords = req.body.keywords;
    var onlyCheckWholeWrod = req.body.wholeWord;

    const rowData = [];

    // Cache the rows after first request, don't need to keep calling the sheets API
    if(!songCache.length) {
      await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
      });
      await doc.loadInfo();

      const sheet = doc.sheetsByIndex[0];
      const rows = await sheet.getRows();
      songCache = rows;      
    }
    
    songCache.forEach(row => {
        [artist, song, year] = row._rawData;

        if(onlyCheckWholeWrod) {
          if(keywords.some(word => isWholeWordMatch(artist, word)) || keywords.some(word => isWholeWordMatch(song, word))) {
            rowData.push({
              artist: artist,
              song: song,
              year: year
            });
          }
        }
        else if(keywords.some(word => artist.toLowerCase().includes(word)) || keywords.some(word => song.toLowerCase().includes(word))) {
          rowData.push({
            artist: artist,
            song: song,
            year: year
          });
        }
    });
    
    res.send({
      songArray: rowData
    });
  }());
});

function isWholeWordMatch(searchOnString, searchText) {
  searchText = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  return searchOnString.match(new RegExp("\\b"+searchText+"\\b", "i")) != null;
}

module.exports = router;