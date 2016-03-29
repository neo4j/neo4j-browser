/**
 * Auth0 Angular e2e tests:
 *
 * The basic flows to test are:
 *
 *  * Login success
 *  * Login failed
 *  * Reload page and load profile information correctly.
 *  * Logout and reload page and profile information is not shown.
 *
 *  Repeat each step for ro, redirect and popup modes.
 */

function findAnchorByContent(content, cb) {
  element.all(by.css('a')).then(function (anchors) {
    anchors.forEach(function (anchor) {
      anchor.getText().then(function (anchorText) {
        if (anchorText === content) {
          cb(anchor);
        }
      });
    });
  });
}

describe('custom login example', function() {
  var logoutButton;

  beforeEach(function () {
    browser.get('/');
    findAnchorByContent('logout', function (button) {
      logoutButton = button;
    });
  });

  afterEach(function () {
    logoutButton.click();
  });

  describe('when doing auth with "ro"', function () {
    it('should sign in successfully with valid credentials', function() {
      element(by.model('user')).sendKeys('hello@bye.com');
      element(by.model('pass')).sendKeys('hello');

      element(by.css('button')).click();

      expect(element(by.css('.message')).getText()).toEqual('loading...');

      browser.driver.wait(function() {
        return element(by.css('.message')).getText().then(function (text) {
          return 'Welcome hello@bye.com!' === text;
        });
      });

      expect(element(by.css('.message')).getText()).toEqual('Welcome hello@bye.com!');

      element(by.css('pre > code')).getText().then(function (text) {
        var obj = JSON.parse(text);
        expect(obj).not.toBeFalsy();
      });

    });

    it('should fail with invalid credentials', function() {
      element(by.model('user')).sendKeys('hello@bye.com');
      element(by.model('pass')).sendKeys('hello2');

      element(by.css('button')).click();

      expect(element(by.css('.message')).getText()).toEqual('loading...');

      browser.driver.wait(function() {
        return element(by.css('.message')).getText().then(function (text) {
          return 'invalid credentials' === text;
        });
      });

      expect(element(by.css('.message')).getText()).toEqual('invalid credentials');
    });

    it('should keep working after reload', function () {
      element(by.model('user')).sendKeys('hello@bye.com');
      element(by.model('pass')).sendKeys('hello');

      element(by.css('button')).click();

      browser.driver.wait(function() {
        return element(by.css('.message')).getText().then(function (text) {
          return 'Welcome hello@bye.com!' === text;
        });
      });

      element(by.css('.message')).getText().then(function (text) {
        expect(text).toEqual('Welcome hello@bye.com!');
      });

      element(by.css('pre > code')).getText().then(function (text) {
        var obj = JSON.parse(text);
        expect(obj).not.toBeFalsy();
      });

      // Refresh the page! It should save state
      browser.get('/');

      browser.driver.wait(function() {
        return element(by.css('.message')).getText().then(function (text) {
          return 'Welcome hello@bye.com!' === text;
        });
      });

      // Prevent afterEach from crashing
      findAnchorByContent('logout', function (button) {
        logoutButton = button;
      });

      element(by.css('.message')).getText().then(function (text) {
        expect(text).toEqual('Welcome hello@bye.com!');
      });

      element(by.css('pre > code')).getText().then(function (text) {
        var obj = JSON.parse(text);
        expect(obj).not.toBeFalsy();
      });
    });

    it('should logout correctly', function () {
      element(by.model('user')).sendKeys('hello@bye.com');
      element(by.model('pass')).sendKeys('hello');

      element(by.css('button')).click();

      browser.driver.wait(function() {
        return element(by.css('.message')).getText().then(function (text) {
          return 'Welcome hello@bye.com!' === text;
        });
      });

      element(by.css('.message')).getText().then(function (text) {
        expect(text).toEqual('Welcome hello@bye.com!');
      });

      element(by.css('pre > code')).getText().then(function (text) {
        var obj = JSON.parse(text);
        expect(obj).not.toBeFalsy();
      });

      logoutButton.click();

      expect(element(by.model('user')).getText()).toEqual('');
      expect(element(by.model('pass')).getText()).toEqual('');

    });
  });

  describe('popup', function () {
    it('should fail signin when is closed', function () {
      findAnchorByContent('Login with Google', function (anchor) {
        anchor.click();


        browser.getAllWindowHandles().then(function (handles) {
          var popupHandle = handles[1];

          browser.switchTo().window(popupHandle);

          browser.close();

          browser.switchTo().window(handles[0]);

          browser.driver.wait(function() {
            return element(by.css('.message')).getText().then(function (text) {
              return 'invalid credentials' === text;
            });
          });

          element(by.css('.message')).getText().then(function (text) {
            expect(text).toEqual('invalid credentials');
          });

        });
      });
    });
    it('should succeed signin when user logs in', function () {
      findAnchorByContent('Login with Google', function (anchor) {
        anchor.click();

        browser.getAllWindowHandles().then(function (handles) {
          var popupHandle = handles[1];

          browser.switchTo().window(popupHandle);

          var email  = browser.driver.findElement(by.name('Email'));
          var passwd = browser.driver.findElement(by.name('Passwd'));
          var signIn = browser.driver.findElement(by.name('signIn'));

          email.sendKeys(browser.params.credentials.google.user || process.env.GOOGLE_USER);
          passwd.sendKeys(browser.params.credentials.google.pass || process.env.GOOGLE_PASSWORD);
          signIn.click();

          browser.switchTo().window(handles[0]);

          browser.driver.wait(function() {
            return element(by.css('.message')).getText().then(function (text) {
              return 'Welcome Auth0 Tests!' === text;
            });
          });

          element(by.css('.message')).getText().then(function (text) {
            expect(text).toEqual('Welcome Auth0 Tests!');
          });

          element(by.css('pre > code')).getText().then(function (text) {
            var obj = JSON.parse(text);
            expect(obj).not.toBeFalsy();
          });

        });
      });
    });

  });
});
