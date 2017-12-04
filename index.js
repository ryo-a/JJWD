var client = require('cheerio-httpcli');
const csv = require('csv-parse');
const parse = require('csv-parse/lib/sync'); // requiring sync module
const fs = require('fs');
const zlib = require('zlib');

/* read settings file */
const environment = require('./settings/env.json');
const jmaURL = require('./settings/url.json');
const rainReplaceRule = require('./settings/rainReplaceRule.json');
const rainReplaceRule1h = require('./settings/rainReplaceRule1h.json');


client.fetch(jmaURL.preAllRainURL, 'sjis', function (err, $, res, body) {
  let input = csvHeaderReplacerWithJSON($.html(),rainReplaceRule);
  let result = parse(input, { columns: true });
  fs.writeFileSync(environment.outputPath + '/amedas-rain-all.json', JSON.stringify(result), 'utf8');

   //deletation
   for (var i = 0; i < Object.keys(result).length; i++) {
    //delete result[i].pref;
  }

});

client.fetch(jmaURL.pre1hRainURL, 'sjis', function (err, $, res, body) {
  let input = csvHeaderReplacerWithJSON($.html(),rainReplaceRule1h);
  let result = parse(input, { columns: true });
  fs.writeFileSync(environment.outputPath + '/amedas-rain-1h.json', JSON.stringify(result), 'utf8');

  //gzip test
  zlib.gzip(JSON.stringify(result), function (err, binary) {
    fs.writeFileSync(environment.outputPath + 'amedas-rain-all.json.gz', binary);
  });
});

function csvHeaderReplacerWithJSON(target,ruleJSON){
  let result = target;

  //TODO: JSON内の useRegExpがtrueならRegExp使うようにしたい
  for (var key in ruleJSON) {
    let keyRegExp = key; //new RegExp(key, 'g');
    result = result.replace(keyRegExp, ruleJSON[key]);
  }
  return result;
}


function csvReplacerCommon(target) {
  var result =
    target.replace(/観測所番号/g, 'stnId')
      .replace(/都道府県/g, 'pref')
      .replace(/国際地点番号/g, 'intlStnId')
      .replace(/地点/g, 'point')
      .replace(/現在時刻\(年\)/g, 'year')
      .replace(/現在時刻\(月\)/g, 'month')
      .replace(/現在時刻\(日\)/g, 'day')
      .replace(/現在時刻\(時\)/g, 'hour')
      .replace(/現在時刻\(分\)/g, 'min');

  return result;
}

function csvHeaderReplacer(target) {
  var result =
    target.replace(/観測所番号/g, 'stnId')
      .replace(/都道府県/g, 'pref')
      .replace(/国際地点番号/g, 'intlStnId')
      .replace(/地点/g, 'point')
      .replace(/現在時刻\(年\)/g, 'year')
      .replace(/現在時刻\(月\)/g, 'month')
      .replace(/現在時刻\(日\)/g, 'day')
      .replace(/現在時刻\(時\)/g, 'hour')
      .replace(/現在時刻\(分\)/g, 'min')
      .replace(/現在値\(mm\)/g, 'data')
      .replace(/現在値の品質情報/g, 'quality')
      .replace(/今日の最大値\(mm\)/g, 'tdMaxData')
      .replace(/今日の最大値の品質情報/g, 'tdMaxQuality')
      .replace(/今日の最大値起時（時）\(まで\)/g, 'tdMaxHour')
      .replace(/今日の最大値起時（分）\(まで\)/g, 'tdMaxMin')
      .replace(/今日の最大値起時\(まで\)の品質情報/g, 'tdMaxQC')
      .replace(/10年未満での極値更新/g, 'record10')
      .replace(/極値更新/g, 'record')
      .replace(/昨日までの観測史上1位の値\(mm\)/g, 'recordData')
      .replace(/昨日までの観測史上1位の値の品質情報/g, 'recordQuality')
      .replace(/昨日までの観測史上1位の値の年/g, 'recordYear')
      .replace(/昨日までの観測史上1位の値の月/g, 'recordMonth')
      .replace(/昨日までの観測史上1位の値の日/g, 'recordDay')
      .replace(/昨日までの([1-9]|1[012])月の1位の値\(mm\)/g, 'recordSameMonthData')
      .replace(/昨日までの([1-9]|1[012])月の1位の値の品質情報/g, 'recordSameMonthQuality')
      .replace(/昨日までの([1-9]|1[012])月の1位の値の年/g, 'recordSameMonthYear')
      .replace(/昨日までの([1-9]|1[012])月の1位の値の月/g, 'recordSameMonthMonth')
      .replace(/昨日までの([1-9]|1[012])月の1位の値の日/g, 'recordSameMonthDay')
      .replace(/統計開始年/g, 'startYear');

  return result;
}