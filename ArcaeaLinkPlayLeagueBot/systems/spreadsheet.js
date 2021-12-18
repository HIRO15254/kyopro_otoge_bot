//@ts-check
const { GoogleSpreadsheet } = require('google-spreadsheet');

const googlespreadsheet = new GoogleSpreadsheet('1ZpZ2beBEjW0B2SxAS2TZT4f1UDl5LOkt8CjX71eHIs4');

let credentials;
exports.road = async function() {
  try {
    credentials = require('../../credentials.json');
  }
  catch {
    //@ts-expect-error
    credentials = require("/app/google-credentials.json");
  }
  await googlespreadsheet.useServiceAccountAuth(credentials);
  await googlespreadsheet.loadInfo();
  return googlespreadsheet;
}

exports.spreadsheet = googlespreadsheet;