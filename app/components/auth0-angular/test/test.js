function executeInConfigBlock(cb, includes) {
  var fakeModule = angular.module('fakeModule', []);
  var modulesToInclude = (includes ? includes : ['auth0']).concat('fakeModule');
  fakeModule.config(cb);

  module.apply(null, modulesToInclude);
}

function initAuth0() {
  executeInConfigBlock(function (authProvider) {
    authProvider.init({
      domain: 'my-domain.auth0.com',
      clientID: 'my-client-id',
      callbackURL: 'http://localhost/callback'
    });
  });
}

describe('Auth0 Angular', function () {

  describe('init', function () {

    it('should handle a single client', function () {
      executeInConfigBlock(function (authProvider) {
        authProvider.init({
          domain: 'my-domain.auth0.com',
          clientID: 'my-client-id',
          callbackURL: 'http://localhost/callback'
        });
      });

      inject(function (auth) { expect(auth).to.be.ok; });
    });

    it('should allow passing a different constructor', function () {

      var MyAuth0Constructor = function () {
        this.getProfile = function () {};
      };
      executeInConfigBlock(function (authProvider) {
        authProvider.init({
          domain: 'my-domain.auth0.com',
          clientId: 'my-client-id',
          callbackURL: 'http://localhost/callback'
        }, MyAuth0Constructor);
      });

      inject(function (auth) {
        expect(auth).to.be.ok;
        expect(auth.config.auth0lib.constructor).to.be.equal(MyAuth0Constructor);
      });
    });
  });

  describe('auth.profile and getProfile', function () {
    var auth, $rootScope, $timeout;

    beforeEach(initAuth0);
    beforeEach(inject(function (_auth_, _$rootScope_, _$timeout_) {
      auth = _auth_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;

      var getProfile = sinon.stub();
      getProfile.onCall(0).callsArgWith(1, null, {foo: 'bar', one: {two: {three: 'baz'}}});
      getProfile.onCall(1).callsArgWith(1, null, {foo: 'bar', one: {two: {three: 'baz'}}});

      auth.config.auth0lib.getProfile = getProfile;
    }));

    it('auth.profile should be null or undefined', function () {
      expect(auth.profile).to.be.undefined;
    });
    it('auth.profile and getProfile should return the same reference', function (done) {
      expect(auth.profile).to.be.undefined;

      auth.getProfile('id-token').then(function (newProfile) {
        expect(auth.profile).to.be.equal(newProfile);
        expect(auth.profile.foo).to.be.equal('bar');
        expect(auth.profile.one.two.three).to.be.equal('baz');
      })
      .then(done);
      $timeout.flush();
    });
    it('all auth.profile fields should be cleaned on getProfile', function (done) {
      auth.profile = {};
      auth.profile.hello = 'yes';
      auth.getProfile('id-token').then(function () {
        expect(auth.profile.hello).not.to.be.ok;
        expect(auth.profile.foo).to.be.equal('bar');
        expect(auth.profile.one.two.three).to.be.equal('baz');
      })
      .then(done);
      $timeout.flush();
    });
  });

  describe('signout', function () {
    var auth, $rootScope, $timeout;

    beforeEach(initAuth0);

    beforeEach(inject(function (_auth_, _$rootScope_, _$timeout_) {
      auth = _auth_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
    }));

    it('should clean all the values and flags from profile', function () {
      // Pre-checks
      expect(auth.profile).to.be.undefined;

      expect(auth.isAuthenticated).to.be.equal(false);
      expect(auth.idToken).not.to.exist;
      expect(auth.accessToken).not.to.exist;

      // Arrange
      auth.profile = {};
      auth.profile.name = 'Tim';
      auth.profile.likes = 'Bananas';
      auth.isAuthenticated = true;
      auth.idToken = 'some-jwt-token';
      auth.accessToken = 'some-access-token';

      // Action signout
      auth.signout();

      // ... and also to be clean
      expect(auth.profile).to.be.null;

      // ... and flags to be reset
      expect(auth.isAuthenticated).to.be.equal(false);
      expect(auth.idToken).to.be.null;
      expect(auth.accessToken).to.be.null;

    });
  });


  describe('Token store', function () {
    var auth, $rootScope, $timeout, getDelegationToken, hasTokenExpiredOriginal, refreshToken, renewIdToken, originalToken;

    beforeEach(initAuth0);

    beforeEach(inject(function (_auth_, _$rootScope_, _$timeout_) {
      auth = _auth_;
      $rootScope = _$rootScope_;
      $timeout = _$timeout_;
      hasTokenExpiredOriginal = auth.hasTokenExpired;

      var token = [
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9',
        'eyJleHAiOjEzOTQ2OTk4OTIsImlhdCI6MTM5NDY2Mzg5Mn0',
        'X6wKtHdkf06U2XIAUaxx0UXT6EYjNqB3uktJcuxHim4'
      ];
      originalToken = token = token.join('.');
      getDelegationToken = sinon.stub();
      getDelegationToken.onCall(0).callsArgWith(1, null, {id_token: token});

      refreshToken = sinon.stub();
      refreshToken.onCall(0).callsArgWith(1, null, {id_token: token});
      renewIdToken = sinon.stub();
      renewIdToken.onCall(0).callsArgWith(1, null, {id_token: token});
      auth.config.auth0js = {
        getDelegationToken: getDelegationToken,
        refreshToken: refreshToken,
        renewIdToken: renewIdToken,
        getProfile: function() {}
      };
    }));

    afterEach(function () {
      auth.hasTokenExpired = hasTokenExpiredOriginal;
    });

    it('should get the token using the API on the first time', function (done) {
      auth.getToken('client-id').then(function (localToken) {
        expect(localToken.id_token).to.equal(originalToken);
      })
      .then(done);

      // Flush the promise and timeout!
      $rootScope.$apply();
      $timeout.flush();
    });

    it('should refresh the token OK', function (done) {
      auth.refreshIdToken('refresh_token').then(function (token) {
        expect(token).to.be.ok;
      })
      .then(done);

      // Flush the promise and timeout!
      $rootScope.$apply();
      $timeout.flush();
    });

    it('should renew the id_token OK', function (done) {
      auth.renewIdToken().then(function (token) {
        expect(token).to.be.ok;
      })
      .then(done);

      // Flush the promise and timeout!
      $rootScope.$apply();
      $timeout.flush();
    });


    it('should call reject when token fetch failed', function (done) {
      getDelegationToken.onCall(0).callsArgWith(1, {error: 'An error ocurred'}, null);

      var clientId = 'client-id';

      auth.getToken({
        targetClientId: clientId
      }).then(null, function (err) {
        expect(err.error).to.be.ok;
      })
      .then(done);

      // Flush the promise and timeout!
      $rootScope.$apply();
      $timeout.flush();
    });
  });

});
