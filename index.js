const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const scrapingResults = [
   {
     title: "",
     datePosted:"",
     nieghborhood: "",
     url: "",
     jobDescription: ""
    }
];
async function scrapListings(page) {
  await page.goto("https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof");
  const html = await page.content();
  const $ = cheerio.load(html);
 
  const listings = $(".result-info").map((index, element) => {
      const titleElement = $(element).find(".result-title");
      const timeElement = $(element).find(".result-date");
      const hoodElement = $(element).find(".result-hood");
      const title = $(titleElement).text();
      const url = $(titleElement).attr('href');
      const date = new Date($(timeElement).attr('datetime'));
      const location = $(hoodElement).text().trim().replace("(", "").replace(")", "");
      return {title, url, date, location};
  }).get();
  return listings;
}

async function scrapeJD(listings, page) {
  for (var i = 0; i < listings.length; i++) {
      await page.goto(listings[i].url);
      const html = await page.content();
      const $ = cheerio.load(html);
      const jdElement = $("#postingbody").text();
      const compensationElement = $("p.attrgroup > span:nth-child(1)").text();
      listings[i].jdElement = jdElement;
      listings[i].compensationElement = compensationElement;
      console.log(listings[i].jdElement);
      console.log(listings[i].compensationElement);
      await sleep(1000);
  }
}

async function sleep(miliseconds) {
  return new Promise(resolve => setTimeout(resolve, miliseconds));
}

async function main() {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  const listings = await scrapListings(page);
  const listingsWithJd = await scrapeJD (listings, page);

  console.log(listings);
};

main();
