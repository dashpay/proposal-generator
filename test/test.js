var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

var driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

    // .forBrowser('chrome')

var path = require('path');
var index = path.resolve(__dirname, '../index.html');
// console.log("index = [" + index + "]");

var url = "file://" + index;
// console.log("url = [" + url + "]");

driver.get(url);

// TODO: test invalid + valid proposal addresses, as well as ensure this gets
// trimmed on the next screen...
driver.findElement(By.name('payment_address')).sendKeys('  XdBKajV4g2wnpnAvvnV9dxwypQMfFHYWtp ');

// TODO: test invalid + valid proposal names
driver.findElement(By.id('name')).sendKeys('ABJ-GLOBAL-MARKET-OUTREACH');

// TODO: test invalid + valid URLs
driver.findElement(By.id('url')).sendKeys('http://example.com/ABJ-GLOBAL-MARKET-OUTREACH/');

driver.findElement(By.id('url')).sendKeys('http://example.com/ABJ-GLOBAL-MARKET-OUTREACH/');

// submit
driver.findElement(By.id('btnPrepare')).click();

driver.wait(until.titleIs('webdriver - Google Search'), 1000);
driver.quit();

1;
