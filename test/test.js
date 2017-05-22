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
// driver.findElement(By.name('q')).sendKeys('webdriver');
// driver.findElement(By.name('btnG')).click();
// driver.wait(until.titleIs('webdriver - Google Search'), 1000);
driver.quit();

1;
