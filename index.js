var client = require('cheerio-httpcli');
const csv = require('csv-parse');
const parse = require('csv-parse/lib/sync'); // requiring sync module
const fs = require('fs');
const zlib = require('zlib');
const cron = require('node-cron');

/*------------- read settings file -------------*/
const environment = require('./settings/env.json');
const jmaURL = require('./settings/url.json');
const rainReplaceRule = require('./settings/rainReplaceRule.json');
const rainReplaceRule1h = require('./settings/rainReplaceRule1h.json');
const rainReplaceRule3h = require('./settings/rainReplaceRule3h.json');
const rainReplaceRule24h = require('./settings/rainReplaceRule24h.json');
const rainReplaceRule48h = require('./settings/rainReplaceRule48h.json');
const rainReplaceRule72h = require('./settings/rainReplaceRule72h.json');
const maxWindReplaceRule = require('./settings/maxWindReplaceRule.json');
const maxIntWindReplaceRule = require('./settings/maxIntWindReplaceRule.json');
const maxTempReplaceRule = require('./settings/maxTempReplaceRule.json');
const minTempReplaceRule = require('./settings/minTempReplaceRule.json');
const snowDepthReplaceRule = require('./settings/snowDepthReplaceRule.json');
const fallingSnow24hReplaceRule = require('./settings/fallingSnow24hReplaceRule.json');
const fallingSnowTotalReplaceRule = require('./settings/fallingSnowTotalReplaceRule.json');


/*------------- fetch and save file -------------*/
/* every 10 minutes */
cron.schedule('45 */10 * * * *', function(){
  getCSVandSaveJSON(jmaURL.rain1hURL, rainReplaceRule1h, 'amedas-rain-1h-recent.json');
  getCSVandSaveJSON(jmaURL.rain3hURL, rainReplaceRule3h, 'amedas-rain-3h-recent.json');
  getCSVandSaveJSON(jmaURL.rain24hURL, rainReplaceRule24h, 'amedas-rain-24h-recent.json');
  getCSVandSaveJSON(jmaURL.rain48hURL, rainReplaceRule48h, 'amedas-rain-48h-recent.json');
  getCSVandSaveJSON(jmaURL.rain72hURL, rainReplaceRule72h, 'amedas-rain-72h-recent.json');
  getCSVandSaveJSON(jmaURL.rainAllURL, rainReplaceRule, 'amedas-rain-all-recent.json');
});

/* every 4:00 JST */
cron.schedule('45 0 04 * * *', function(){
  getCSVandSaveJSON(jmaURL.fallingSnowTotalURL, fallingSnowTotalReplaceRule, 'amedas-falling-snow-total-recent.json');
});

/* every *:50:45 */
cron.schedule('45 50 */1 * * *', function(){
  getCSVandSaveJSON(jmaURL.maxWindURL, maxWindReplaceRule, 'amedas-max-wind-speed-recent.json');
  getCSVandSaveJSON(jmaURL.maxIntWindURL, maxIntWindReplaceRule, 'amedas-max-instantaneous-wind-speed-recent.json');
  
  getCSVandSaveJSON(jmaURL.maxTempURL, maxTempReplaceRule, 'amedas-max-temperature-recent.json');
  getCSVandSaveJSON(jmaURL.minTempURL, minTempReplaceRule, 'amedas-min-temperature-recent.json');
  
  getCSVandSaveJSON(jmaURL.snowDepthURL, snowDepthReplaceRule, 'amedas-snow-depth-recent.json');
  getCSVandSaveJSON(jmaURL.fallingSnow24hURL, fallingSnow24hReplaceRule, 'amedas-falling-snow-24h-recent.json');
});




function getCSVandSaveJSON(target, rule, filename, gzip,gzipfilename) {

  if (gzip == undefined) {
    gzip = false;
  }

  client.fetch(target, 'sjis', function (err, $, res, body) {
    let input = csvHeaderReplacerWithJSON($.html(), rule);
    let result = parse(input, { columns: true, relax_column_count: true });
    fs.writeFileSync(environment.outputPath + '/' + filename, JSON.stringify(result), 'utf8');
    if (gzip == true) {
      zlib.gzip(JSON.stringify(result), function (err, binary) {
        fs.writeFileSync(environment.outputPath + gzipfilename, binary);
      });
    }
  });
};

function csvHeaderReplacerWithJSON(target, ruleJSON) {
  let result = target;
  let regExpMode = ruleJSON.useRegExp;

  for (var key in ruleJSON) {
    var keystring = key;

    if (regExpMode == true) {
      keystring = new RegExp(key);
    }

    result = result.replace(keystring, ruleJSON[key]);
  }
  return result;
}