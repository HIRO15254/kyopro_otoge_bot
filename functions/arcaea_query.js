const { GoogleSpreadsheet } = require('google-spreadsheet');

function constToLevel(cons) {
	const cons_int = parseInt(cons)
	if(cons < 9){
		return String(cons_int);
	}
	else{
		if(cons - cons_int < 0.7){
			return String(cons_int);
		}
		else{
			return String(cons_int) + "+";
		}
	}
}

function stringToLevel(str) {
	if (str[str.length - 1] == '+'){
		return parseInt(str.substring(0, str.length - 1)) * 2 - 8
	}
	else{
		if(parseInt(str) < 9){
			return parseInt(str)
		}
		else{
			return parseInt(str) * 2 - 9
		}
	}
}

exports.query = async function(credentials, query) {
  const doc = new GoogleSpreadsheet('11PDRjN6gcPexgxuYui5B_Xd0BRQQ8tImKh31SVHnmWo');
  await doc.useServiceAccountAuth(credentials);
  await doc.loadInfo();

  const Sheet = await doc.sheetsById[624650468];
  const Rows = await Sheet.getRows();

  let charts = [];
  Rows.forEach(e => {
    let pack_short = ''
    e.pack.split(' ').forEach(function(e) {
      pack_short += e[0];
    });
    charts.push({ 'title': e.title, 'artist': e.artist, 'pack': [e.pack, pack_short], 'diff': ['Past', 'PST'], 'const': parseFloat(e.past), 'level': constToLevel(parseFloat(e.past))});
    charts.push({ 'title': e.title, 'artist': e.artist, 'pack': [e.pack, pack_short], 'diff': ['Present', 'PRS'], 'const': parseFloat(e.present), 'level': constToLevel(parseFloat(e.present)) });
    charts.push({ 'title': e.title, 'artist': e.artist, 'pack': [e.pack, pack_short], 'diff': ['Future', 'FTR'], 'const': parseFloat(e.future), 'level': constToLevel(parseFloat(e.future)) });
    if (e.title === 'dropdead') { charts[charts.length - 1].level = 8; }
    if (e.beyond) {
      charts.push({ 'title': e.title, 'artist': e.artist, 'pack': [e.pack, pack_short], 'diff': ['Beyond', 'BYD'], 'const': parseFloat(e.beyond), 'level': constToLevel(parseFloat(e.beyond)) });
    }
  });

  if (query.pack) {
    const packs = query.pack.split(',');
    const filtered_charts = charts.filter(function(element) {
      let ans = false
      packs.forEach(function(pack) {
        if (element.pack[0].toLowerCase() === pack.toLowerCase() || element.pack[1].toLowerCase() === pack.toLowerCase()) {
          ans = true;
        }
      });
      return ans
    });
    charts = filtered_charts;
  }

  if (query.diff) {
    const diffs = query.diff.split(',');
    const filtered_charts = charts.filter(function(element) {
      let ans = false
      diffs.forEach(function(diff) {
        if (element.diff[0].toLowerCase() === diff.toLowerCase() || element.diff[1].toLowerCase() === diff.toLowerCase()) {
          ans = true;
        }
      });
      return ans;
    });
    charts = filtered_charts;
  }

  if (query.cons) {
    let re = /{(.+?):(.+?)}/;
    if (re.exec(query.cons)){
      q = re.exec(query.cons);
      const filtered_charts = charts.filter(function(element) {
        return parseFloat(q[1]) <= element.const && parseFloat(q[2]) >= element.const;
      });
      charts = filtered_charts;
    }
    else{
      const filtered_charts = charts.filter(function(element) {
        return parseFloat(query.cons) === element.const;
      });
      charts = filtered_charts;
    }
  }

  if (query.level) {
    let re = /{(.+?):(.+?)}/;
    if (re.exec(query.level)){
      q = re.exec(query.level);
      const filtered_charts = charts.filter(function(element) {
        return stringToLevel(q[1]) <= stringToLevel(element.level) && stringToLevel(q[2]) >= stringToLevel(element.level);
      });
      charts = filtered_charts;
    }
    else{
      const filtered_charts = charts.filter(function(element) {
        return query.level === element.level;
      });
      charts = filtered_charts;
    }
  }

  return charts;
}