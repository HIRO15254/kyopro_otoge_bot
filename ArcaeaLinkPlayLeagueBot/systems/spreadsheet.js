//@ts-check
const { GoogleSpreadsheet } = require('google-spreadsheet');

let credentials;
async function ret() {
  try {
    credentials = require('../../credentials.json');
  }
  catch {
    //@ts-expect-error
    credentials = require("/app/google-credentials.json");
  }
  const googlespreadsheet = new GoogleSpreadsheet('1ZpZ2beBEjW0B2SxAS2TZT4f1UDl5LOkt8CjX71eHIs4');
  await googlespreadsheet.useServiceAccountAuth(credentials);
  await googlespreadsheet.loadInfo();
  return googlespreadsheet;
}
module.exports = ret();
