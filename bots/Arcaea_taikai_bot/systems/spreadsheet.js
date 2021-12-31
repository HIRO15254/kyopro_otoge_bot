//@ts-check
const { GoogleSpreadsheet } = require('google-spreadsheet');

const googlespreadsheet = new GoogleSpreadsheet('1xKp8L_IIHtjfyH4vWpIQiH8PYTp68HHYFXZmmuBmT2k');

let credentials;
exports.road = async function () {
  try {
    credentials = require('../../../credentials.json');
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