## [6.4.1] - 2015-05-18

### Fixed

 - [cors] do not use jsonp on same origin
  https://github.com/auth0/auth0.js/commit/5f6c98bf2d15356d657c58d68afeabb677324194

## [6.4.1] - 2015-05-07

### Fixed

 - [base64url] Fix incorrect base64 decode (only first `-` and `_` characters were replaced). (`wooorm`)
  https://github.com/auth0/auth0.js/commit/5f6c98bf2d15356d657c58d68afeabb677324194


## [6.4.0] - 2015-05-05

### Changed

 - [cors] Allow to override the useJSONP policy by disabling with `{forceJSONP: false}` in constructor options. (`cristiandouce`)
  https://github.com/auth0/auth0.js/commit/8ff0529a444272fd1f6696a2bf1f02136dd67743
 - [cors]  Only use crossOrigin flags when the origin differs as on the same domain security policies detail. (`cristiandouce`)
  https://github.com/auth0/auth0.js/commit/8ff0529a444272fd1f6696a2bf1f02136dd67743


## [6.3.1] - 2015-04-27

### Fixed

 - [popup] Pop up is now closed when signing up successfully (`ivancevich`)
  https://github.com/auth0/auth0.js/commit/77865c65eaa54017a94d13dd23da81c855a64634

## [6.3.0] - 2015-04-15

### Added

 - [sms] Added SMS authentication ([docs](https://github.com/auth0/auth0.js#passwordless-authentication-with-sms)) (`ivancevich - cristiandouce`)
  https://github.com/auth0/auth0.js/commit/7af1c105b9470ada7ac28f780342513d55f2b502
  https://github.com/auth0/auth0.js/commit/2836d0d0222ba4fef7a270cf9520671fdaf087dd
  https://github.com/auth0/auth0.js/commit/95e282c922362ab68ea29ef5f5de6127ebe44882
  https://github.com/auth0/auth0.js/commit/3de0408888bfa952f28ff9f2465912476aebc874
  https://github.com/auth0/auth0.js/commit/27b53cc04180ec83e273082e9082e08f45dc9b02
  https://github.com/auth0/auth0.js/commit/d6a239758fdcf7b1911ebcc577f26d20068a6194
  https://github.com/auth0/auth0.js/commit/0452ba4b10aeae7bf67eaf3c2f7201e18fbe7e94
  https://github.com/auth0/auth0.js/commit/037605cae5d5b334e99ef308d3b1c393ea9a0f4b
  https://github.com/auth0/auth0.js/commit/e560f0c857b6b9709257271871b87635615fda7e
  https://github.com/auth0/auth0.js/commit/82ea2573ef876200d358c7706d083b77cddfb563
  https://github.com/auth0/auth0.js/commit/6bbdc74fd3a9485947137d202d111ed444bdcd99
  https://github.com/auth0/auth0.js/commit/68dbacea12dc3a0e68246c833c64610f28371b60
  https://github.com/auth0/auth0.js/commit/2c4170eff747818656f920dad6cea4ce6f786036
  https://github.com/auth0/auth0.js/commit/5e3df9151b2273bea9a320a7c35ee04e5c5b767f
  https://github.com/auth0/auth0.js/commit/32c782f02661e9a53ecc78fe6e0da3bf728eacff
  https://github.com/auth0/auth0.js/commit/5aea2aa7b48c167264e63c441c51f5db2cd54577
  https://github.com/auth0/auth0.js/commit/8f34c789fadafa3d74bfd18ab6cc4f72f7fd1280

## [6.2.0] - 2015-04-07

### Added

 - [error] Added refused/timeout connection errors. (https://github.com/auth0/auth0.js/pull/76) (https://github.com/auth0/auth0.js/issues/75) (`pose`)
  https://github.com/auth0/auth0.js/commit/e7f3ef95993b62ed3f40e4e7608b586b9bab6c68
  https://github.com/auth0/auth0.js/commit/5db28b9c269c44da4d72ea6e5254c692cf5e31c2
  https://github.com/auth0/auth0.js/commit/d07733c717c8bee2214f36963880ec26563f76f8

## [6.1.0] - 2015-03-19

### Added

 - [error] Added Internet connection error reporting: Failing requests that report status code === 0 are now reported as offline rather than invalid_user_password (https://github.com/auth0/auth0.js/pull/71) (https://github.com/auth0/auth0.js/issues/50) (`pose`)
  https://github.com/auth0/auth0.js/commit/8fa314997adaa0832a838758432f5249c5ebd0a4
  https://github.com/auth0/auth0.js/commit/68aea5dee564c60ede71e0668468f7433f723f3b

## [6.0.6] - 2015-02-18

### Fixed

 - [auth0.js] Fixes issues with Phonegap and db connections. (`pose`)
  https://github.com/auth0/auth0.js/commit/6800c05460919da0bb514068e71fd7ee76663af0

## [6.0.5] - 2015-02-18

### Fixed

 - [auth0.js] Fixed: If callback has not >1 arguments, then we don't do open a popup and do sso. (`pose`)
  https://github.com/auth0/auth0.js/commit/ac5a535ff1201fd4fb4fec464517ac29172d02d9

## [6.0.4] - 2015-02-18

### Fixed

 - [auth0.js] Fixing sso flag not working by default. (`pose`)
  https://github.com/auth0/auth0.js/commit/a876394a17536429bfd99546d3d6bfffcc247f8e
 - [auth0.js] Sending scope parameter when using dbconn, sso: true and popup. (`pose`)
  https://github.com/auth0/auth0.js/commit/908493a5028f1bc339b26a7390d51142c95d0314

### Added

 - [auth0.js] Adding popup blocker warning. (`pose`)
  https://github.com/auth0/auth0.js/commit/e7fa8c282cd827dae758282d2b54b22443c595fd

## [6.0.3] - 2015-02-11 [YANKED]

## [6.0.2] - 2015-01-26
- [925ec92] Fixing merge conflict. (`Alberto Pose`)
- [15eff14] Updating to winchan@0.1.1 (`Alberto Pose`)
- [3086cfb] Merge pull request #59 from auth0/6.x (`Alberto Pose`)
- [a27686f] Merge pull request #53 from alexfiedler/patch-1 (`Alberto Pose`)
- [ec44e49] Adding consistency warning. (`Alberto Pose`)
- [2d653b8] Improving test style. (`Alberto Pose`)
- [7ee1ba2] Adding popup.kill check (`Alberto Pose`)
- [2a3453d] Making sso: true by default. (`Alberto Pose`)
- [4b5e833] Passing existing popup to winchan when using dbconnection and sso: true after signup (prevents popup blocking) (`Alberto Pose`)
- [4a558c9] Updating to winchan 0.1.0 (`Alberto Pose`)
- [c470beb] Handles db connection on popup and sso: true. (`Alberto Pose`)
- [fb6bdca] Documenting popup and sso: true (`Alberto Pose`)
- [25faf0d] Typo in the readme for the browserify version (`alexfiedler`)

## [5.5.1] - 2015-01-23
- [296b7c6] Merge pull request #58 from auth0/bugfix-callback-param-order (`Alberto Pose`)
- [dc41581] Fix parameter order of FB login callback. (`Hernan Zalazar`)
- [75c7369] Fixing bug on _phonegapFacebookLogin method. (`Alberto Pose`)

## [5.5.0] - 2015-01-23
- [5df4b63] Merge pull request #57 from auth0/feature-phonegap-social-login (`Alberto Pose`)
- [41efa21] Small style fixes (`Alberto Pose`)
- [1b9813f] Add test for Auth0 option for phonegap auth. (`Hernan Zalazar`)
- [5c98c20] Small refactors and docs. (`Hernan Zalazar`)
- [133a815] Fail if phonegap-facebook-plugin is not installed. (`Hernan Zalazar`)
- [395bb3c] Refactor how cordova plugins are handled. (`Hernan Zalazar`)
- [ead76fe] If in Cordova app use Facebook plugin to login. (`Hernan Zalazar`)

## [5.4.0] - 2015-01-16
- [22e2ede] Revert "Handles db connection on popup and sso: true." (`Alberto Pose`)
- [009921e] Revert "Documenting popup and sso: true" (`Alberto Pose`)
- [08b6b40] Merge pull request #56 from auth0/popup-documented (`Alberto Pose`)
- [5ad257f] Documenting popup and sso: true (`Alberto Pose`)

## [5.3.0] - 2014-12-24
- [bdca479] Handles db connection on popup and sso: true. (`Alberto Pose`)

## [5.2.2] - 2014-12-19

## [5.2.1] - 2014-12-19
- [452da5c] Added passthorugh as default option for refreshToken (`Martin Gontovnikas`)

## [5.2.0] - 2014-12-02
- [7e01d39] Merge pull request #52 from auth0/accept-parameters-on-methods (`Martin Gontovnikas`)
- [4007e55] Accepting callbackURL and callbackOnLocationHash on methods (`Martin Gontovnikas`)

## [5.1.1] - 2014-10-24

## [5.1.0] - 2014-10-24
- [7ce2990] Merge branch 'add/handle-username-and-email' (`Cristian Douce`)
- [fc9a9b7] Add test expecting error when missing username with requires_username database (`Cristian Douce`)
- [55bd2e7] Enable tests for signup with requires_username enabled on database connection (`Cristian Douce`)
- [70c62b2] change password with username / email (`Matias Corbanini`)
- [7d3827d] signup enabled with both username and/or email (`Matias Corbanini`)

## [5.0.1] - 2014-10-20
- [f594172] Merge pull request #47 from auth0/delegation-error-message (`Cristian Douce`)
- [f1d00d4] Explicitly refer to delegation endpoint in missing token error (`Rodrigo López Dato`)

## [5.0.0] - 2014-10-15
- [0308678] Removed offline_mode. Made offline_access trigger device calculation (`Martin Gontovnikas`)

## [4.3.0] - 2014-10-14
- [c559151] Update the way of handling failings from reqwest in all public/private methods except for _getUserInfo as it's the only one returning a promise like object (`Cristian Douce`)

## [4.2.11] - 2014-10-14
- [97a517f] Bump reqwest ~1.1.4 (`Cristian Douce`)
- [513d944] Update index.js (`Alberto Pose`)

## [4.2.10] - 2014-10-07
- [b0a105f] restore old popup behavior for response_type=code (`José F. Romaniello`)

## [4.2.9] - 2014-10-07
- [8f22fef] open popup on signup case when callbackOnLocaHash:false and popup true (`José F. Romaniello`)
- [a50c6c0] remove debug option (`José F. Romaniello`)

## [4.2.8] - 2014-09-30
- [30b2853] Fix phonegap/cordova fast close window popup for better UX (`Cristian Douce`)
- [00282ed] minor (`José F. Romaniello`)

## [4.2.7] - 2014-09-15
- [b9b5c02] Added scope passthrough (`Martin Gontovnikas`)
- [8ef47f1] Minor (`Alberto Pose`)

## [4.2.6] - 2014-09-02
- [57ba12b] Defaulting to window hash (`Martin Gontovnikas`)

## [4.2.5] - 2014-09-01
- [6c4ab5a] Merge branch 'master' of github.com:auth0/auth0.js (`Martin Gontovnikas`)
- [679a8f9] Added popup options to Phonegap as well (`Martin Gontovnikas`)
- [d1ac2ed] Update mocha@1.20.1 - We should handle global.window differently since mocha@1.21.x breaks the global `global` pattern and just use `this` (`Cristian Douce`)
- [c1614ae] Fix tests (`Cristian Douce`)
- [3e9e2d0] Fix bug on IE8 with `this` referencing window instead of iframe (`Cristian Douce`)
- [99d6e2c] Fix support forceLogout helper for IE8 (`Cristian Douce`)
- [8b1ea04] Disabled tag badge since fails 99% of the time (`Cristian Douce`)

## [4.2.4] - 2014-08-15

## [4.2.3] - 2014-08-15
- [04ace02] minor (`José F. Romaniello`)

## [4.2.1] - 2014-08-15
- [11b716c] delete built resources (`José F. Romaniello`)

## [4.2.0] - 2014-08-15
- [cfa345e] Merge pull request #39 from alyssaq/master (`Alberto Pose`)
- [5793da8] example command to run auth0 example (`Alyssa`)
- [3c908ab] Revert "add drone.yml to test drone.io" (`José F. Romaniello`)
- [c4d1d57] Updating README (`Martin Gontovnikas`)

## [4.1.0] - 2014-08-13
- [01559f1] Fixes & more tests (`Martin Gontovnikas`)
- [655ada8] Offline mode (`Martin Gontovnikas`)
- [f043ee8] minor (`José F. Romaniello`)
- [4b3f342] minor (`José F. Romaniello`)

## [4.0.1] - 2014-08-07
- [f7dbee8] Merge branch 'updates' (`Cristian Douce`)
- [5d68b56] Update is-array module to resolve native first or fallback instead (`Cristian Douce`)
- [eceb6b1] Move `Array.isArray` polyfill to function wrapper (`Cristian Douce`)
- [a9ff249] Update to better JSON.parse fallback (`Cristian Douce`)

## [4.0.0] - 2014-08-05
- [06e1b4d] Merge pull request #36 from auth0/delegation-token (`Martin Gontovnikas`)
- [af43fdc] Done Iaco Suggestions (`Martin Gontovnikas`)
- [0c7d2f5] Added refresh_token API as well (`Martin Gontovnikas`)
- [23ef5dd] Finished build (`Martin Gontovnikas`)
- [4635a3d] Updated README (`Martin Gontovnikas`)
- [d713d69] Added new DelegationToken API (`Martin Gontovnikas`)

## [3.2.3] - 2014-07-25
- [d0ad08e] reference branch of qs (`José F. Romaniello`)

## [3.2.2] - 2014-07-25
- [21cf9a5] Update package.json (`Cristian Douce`)

## [3.2.1] - 2014-07-22
- [26d68cd] Oops, fixing tests (`Alberto Pose`)

## [3.2.0] - 2014-07-22
- [4a906c7] Fixes #16: Make callbackURL optional and makes it default to document.location.href (`Alberto Pose`)
- [f14fa6b] Merge pull request #32 from auth0/update-login (`Alberto Pose`)
- [a5448c5] Add block docs to auth0.js API (`Cristian Douce`)

## [3.1.0] - 2014-07-14
- [40e85c1] Merge pull request #30 from auth0/phonegap (`Alberto Pose`)
- [a4526ab] Updating auth0.js to latest version (`Alberto Pose`)
- [550d8ba] Adding compiled files. (`Alberto Pose`)
- [72f972b] Phonegap fine tunning. (`Alberto Pose`)
- [34ae7e1] First take on Phonegap implementation. (`Alberto Pose`)

## [3.0.3] - 2014-07-11
- [a46ad4c] Removing popup tests that no longer apply after winchan. (`Alberto Pose`)

## [3.0.2] - 2014-07-11
- [a46bc50] Update build (`Cristian Douce`)
- [651f97f] Add trim to each method accepting username|email parameters before execution and tests (`Cristian Douce`)
- [359ad74] Add trim to .validateUser() and tests. #28 (`Cristian Douce`)
- [563a533] Add trim as dependency (`Cristian Douce`)

## [3.0.1] - 2014-07-11
- [ed4cd3c] Merge pull request #27 from auth0/winchan (`Alberto Pose`)

## [3.0.0] - 2014-07-11
- [46476dd] Winchan refactor. (`Alberto Pose`)
- [340e3dc] Merge pull request #25 from auth0/issues/24 (`Damian Schenkelman`)
- [ffa7b8c] Fixes #24 by adding support for connection_scope to login and signin. Bump to 2.3.0 (`dschenkelman`)
- [15449c8] Updating Auth0 Logo (`Alberto Pose`)
- [50d9027] Add tests for IE11. Related #23 (`Cristian Douce`)

## [2.2.0] - 2014-06-10
- [c253b9b] add packageify as a dep (`José F. Romaniello`)
- [ada0658] Add prefix to all jsonp requests to avoid bug when learnboost/jsonp is used in same site (`Cristian Douce`)

## [2.1.10] - 2014-06-17
- [74c2ae0] update jsonp timeout (`siacomuzzi`)

## [2.1.9] - 2014-06-17
- [df60ffa] Bump jsonp dependency (`Cristian Douce`)

## [2.1.8] - 2014-06-10

## [2.1.7] - 2014-06-10
- [76b2504] add packageify as a dep (`José F. Romaniello`)

## [2.1.6] - 2014-06-04

## [2.1.5] - 2014-06-03

## [2.1.4] - 2014-05-16

## [2.1.3] - 2014-05-09
- [cd3717f] Filtering popup and popupOptions when calling /authorize endpoint. (`Alberto Pose`)

## [2.1.2] - 2014-05-08
- [78d7807] Minor: Fixing bug when popupOptions is undefined. (`Alberto Pose`)

## [2.1.1] - 2014-05-08
- [02cf3f0] Centering login popup by default. (`Alberto Pose`)

## [2.1.0] - 2014-05-08
- [f0e1b37] Fixing loginWithPopup and documenting callback usage. (`Alberto Pose`)
- [4a7ec1f] Fixing broken getDelegationToken test. (`Alberto Pose`)

## [2.0.18] - 2014-04-30
- [0a9d651] do not send popup and popupOptions as qs (`José F. Romaniello`)

## [2.0.17] - 2014-04-23
- [0cf2048] Merge pull request #14 from auth0/notify-about-popup-close (`Alberto Pose`)
- [7490421] Making callback(err, null) -> err instance of Error (`Alberto Pose`)
- [55c32f8] Notifying when user closed the popup window. (`Alberto Pose`)

## [2.0.16] - 2014-04-23
- [ac2794e] Merge pull request #13 from auth0/popup-error-url-fix (`Alberto Pose`)
- [dc2b72a] Fixing #error and ?error handling in popup (`Alberto Pose`)

## [2.0.15] - 2014-04-19
- [4f53dc6] minor (`José F. Romaniello`)

## [2.0.14] - 2014-04-19
- [b088fa0] do not validate iss if not present in the jwt (`José F. Romaniello`)
- [5a7f6f3] fix broken tests (`José F. Romaniello`)

## [2.0.13] - 2014-04-19
- [32a8a73] minor (`José F. Romaniello`)

## [2.0.12] - 2014-04-15
- [469a3b0] Delete auth0.debug.js (`José F. Romaniello`)

## [2.0.11] - 2014-04-15
- [1fb41e6] change bower to use built-in file (`José F. Romaniello`)
- [3879f18] Removing haunted character (╯°□°）╯︵ ┻━┻ (`Alberto Pose`)
- [1c1f198] Removing invalid character. (`Alberto Pose`)
- [8f4195c] Removing invalid character. (`Alberto Pose`)

## [2.0.10] - 2014-04-03
- [03d966b] fix issue with use_jsonp() and add an option to force jsonp (`José F. Romaniello`)
- [67795ad] Adds to CDN URLs like auth0-2.js, auth0-2.0.js (`Alberto Pose`)
- [d434613] Merge pull request #10 from cbas/patch-1 (`Alberto Pose`)
- [23eccee] Fixed bower name & version (`Sebastiaan Deckers`)
- [f6e7f34] Adding error handling to examples. (`Alberto Pose`)

## [2.0.9] - 2014-03-31
- [425b787] Fixing ',' that broke IE8 (`Alberto Pose`)

## [2.0.8] - 2014-03-31
- [9a25381] Simplifying getProfile method. (`Alberto Pose`)

## [2.0.7] - 2014-03-29
- [4f2bd8f] Fixing bug on popup logic. (`Alberto Pose`)

## [2.0.6] - 2014-03-29
- [b081eac] Updating compiled files. (`Alberto Pose`)
- [5ac63ae] minor (`siacomuzzi`)
- [c0f3d8d] Removing debugger statement. (`Alberto Pose`)
- [0937f03] minor (`siacomuzzi`)
- [788998b] Updating login-google-popup example. (`Alberto Pose`)

## [2.0.5] - 2014-03-28
- [c339e0e] build library (`siacomuzzi`)

## [2.0.4] - 2014-03-28
- [62e8c19] minor (`siacomuzzi`)
- [7f9d5f9] Updating parseHash and getProfile docs (`Alberto Pose`)

## [2.0.3] - 2014-03-28
- [6034016] s/throw/return/g in some tests (`Alberto Pose`)
- [3729585] Fixing popup example. (`Alberto Pose`)
- [8928bb8] * parseHash now returns null on invalid hash URL. * getProfile MUST be called exclusively using a token (object obtained by doing parseHash of the hash URL). * Removed inCallback function as it was confusing. (`Alberto Pose`)

## [2.0.2] - 2014-03-27
- [95b50b8] Fixing tests that were not working. (`Alberto Pose`)
- [3f592fb] Fixing broken example. (`Alberto Pose`)
- [2f2945c] signin with {popup: true} MUST receive a callback. (`Alberto Pose`)

## [2.0.1] - 2014-03-27
- [f062763] Fixing callback(err) -> callback(e) (`Alberto Pose`)
- [b9d478e] Updating how parseHash sync works. (`Alberto Pose`)

## [2.0.0] - 2014-03-27

## [1.6.5] - 2014-03-26
- [b7faae0] change  to  to avoid ad-block plugins (`José F. Romaniello`)

## [1.6.4] - 2014-03-08
- [b292d00] change "/api/users/validate_userpassword" with "/public/api/users/validate_userpassword" (`siacomuzzi`)

## [1.6.3] - 2014-03-07
- [eed985f] validateUser method (`siacomuzzi`)

## [1.6.2] - 2014-03-04
- [575419b] getProfile: call POST /userinfo (`siacomuzzi`)
- [46915a1] fix parse error when hash starts with a slash (#/access_token, #/error) (`siacomuzzi`)

## [1.6.1] - 2014-03-04
- [85c7c07] getProfile: use /tokeninfo instead of /api/users/:id (`siacomuzzi`)
- [86bfd46] fix test (`Matias Woloski`)

## [1.6.0] - 2014-03-02
- [3d864b9] support for callback on popup mode and chance getProfile signature (`Matias Woloski`)
- [6620ebf] updated bower version (`siacomuzzi`)

## [1.5.1] - 2014-02-28

## [1.5.0] - 2014-02-28
- [26eada7] more tests (`siacomuzzi`)
- [3d49a70] minor (`siacomuzzi`)
- [0643352] code improvements (`siacomuzzi`)
- [9f46880] loginWithUsernamePassword: call loginWithResourceOwner based on callback.arguments (`siacomuzzi`)
- [7b9afae] loginWithUsernamePassword: by default use RO endpoint (`siacomuzzi`)

## [1.4.3] - 2014-02-27
- [2f670fe] rebuild js (`siacomuzzi`)

## [1.4.2] - 2014-02-27
- [20c8894] minor fix (`siacomuzzi`)

## [1.4.1] - 2014-02-27
- [a8021f8] minor (`siacomuzzi`)

## [1.4.0] - 2014-02-27
- [edba82f] default scope: openid (`siacomuzzi`)

## [1.3.12] - 2014-02-25
- [790d6dd] improve validation error messages (`siacomuzzi`)
- [c52cebe] more tests (`siacomuzzi`)

## [1.3.11] - 2014-02-25
- [8216994] validate id_token.aud and id_token.iss. closes #7 (`siacomuzzi`)

## [1.3.10] - 2014-02-24
- [8e0fcc5] fix encoding issues (`siacomuzzi`)
- [d7c7acf] code improvements (`siacomuzzi`)

## [1.3.9] - 2014-02-24
- [f4786a7] getProfile method. closes #6 (`siacomuzzi`)

## [1.3.8] - 2014-02-24
- [85b435a] login method: call loginWithUsernamePassword only if options.username/options.email is not undefined (`siacomuzzi`)
- [c443c01] fix tests (`José F. Romaniello`)

## [1.3.7] - 2014-02-24
- [7c840c7] close popup on signing with db connection errors (`José F. Romaniello`)

## [1.3.6] - 2014-02-23
- [533336f] partially implement popup mode for user&pass (`José F. Romaniello`)
- [1f10701] configured grunt-maxcdn (`siacomuzzi`)

## [1.3.5] - 2014-02-03
- [8cc4baa] show popup sample (`Sebastian Iacomuzzi`)
- [79df2a9] Merge pull request #5 from cristiandouce/feature-popup (`Sebastian Iacomuzzi`)
- [3c65770] Update example with new popup support and make it work (`Cristian Douce`)
- [a28bccb] Add popup support for 3rd party connection login (`Cristian Douce`)
- [0e46cb4] minor (`siacomuzzi`)
- [6bb81b2] update getDelegationToken in order to require id_token parameter (`siacomuzzi`)
- [b027819] update example based on recent changes (`siacomuzzi`)

## [1.3.4] - 2014-01-30
- [d51ec69] update getDelegationToken in order to require id_token parameter (`siacomuzzi`)
- [7cbca93] update example based on recent changes (`siacomuzzi`)
- [492491f] minor (`siacomuzzi`)

## [1.3.3] - 2014-01-23
- [5c67712] minor (`siacomuzzi`)

## [1.3.2] - 2014-01-23
- [0f26430] getDelegationToken method (`siacomuzzi`)

## [1.3.1] - 2014-01-11
- [78e9451] fix minor (`José F. Romaniello`)

## [1.3.0] - 2014-01-11
- [2f84f21] add parameter to getSSOData to query for ADs (`José F. Romaniello`)

## [1.2.8] - 2014-01-03

## [1.2.7] - 2014-01-03
- [da4d77d] Adding alias login=signin and error hash parsing. (`Alberto Pose`)
- [c715cd8] Making testem to be run from node_modules. (`Alberto Pose`)

## [1.2.6] - 2013-12-24
- [534f39f] minor (`José F. Romaniello`)

## [1.2.5] - 2013-12-24

## [1.2.4] - 2013-12-24

## [1.2.3] - 2013-12-24
- [a39d146] fix tests (`José F. Romaniello`)
- [b5fc9f1] add experimental support for bower, closes #4 (`José F. Romaniello`)

## [1.2.2] - 2013-11-27
- [e1977c1] use "/usernamepassword/login" endpoint for  loginWithUsernamePassword method (`siacomuzzi`)
- [0ce682b] minor (`José F. Romaniello`)

## [1.2.0] - 2013-11-21

## [1.1.2] - 2013-11-21
- [eebf542] add logout method (`José F. Romaniello`)

## [1.1.1] - 2013-11-14
- [d8923f9] fix signup bug on server error for ie8 (`José F. Romaniello`)

## [1.1.0] - 2013-11-13
- [9ed4ab9] fix change_password false/positive error (`José F. Romaniello`)
- [0ba9890] upload to cdn with sourcemaps (`José F. Romaniello`)
- [dbb3b58] add version number to file in cdn (`José F. Romaniello`)

## [1.0.0] - 2013-11-05
- [8262da6] change parseHash api and introduce callbackOnLocationHash (`José F. Romaniello`)
- [5e1c3a6] minor (`José F. Romaniello`)

## [0.2.2] - 2013-11-01
- [24bed55] code improvements (`siacomuzzi`)
- [e7b2753] support response_type and scope parameters (`siacomuzzi`)
- [9d29142] add cdn task (`José F. Romaniello`)
- [110e1a0] minor (`José F. Romaniello`)
- [f96b076] add build badge (`José F. Romaniello`)
- [73eb7ab] minor (`José F. Romaniello`)
- [327dd68] change layout of the repo (`José F. Romaniello`)
- [6b7b8bc] run in two phases (`José F. Romaniello`)
- [8c10631] minor (`José F. Romaniello`)
- [5ccd32a] minor (`José F. Romaniello`)

## [0.2.1] - 2013-10-31
- [ee13b0d] update debug (`José F. Romaniello`)
- [3f1ae81] change timeouts (`José F. Romaniello`)
- [409b3e2] simplify phantomjs runner (`José F. Romaniello`)
- [f0f5ffd] minor (`José F. Romaniello`)
- [f8257fa] minor (`José F. Romaniello`)
- [8fd9c60] minor (`José F. Romaniello`)
- [bd74281] change to my fork of browserstack cli (`José F. Romaniello`)
- [dbfffa0] use basic config for testem browserstack (`José F. Romaniello`)
- [04f253f] let's trick travis (`José F. Romaniello`)
- [57ff019] minor (`José F. Romaniello`)
- [8480820] add timeout to browserstack tests (`José F. Romaniello`)

## [0.2.0] - 2013-10-25
- [014611b] rename loginWithDbConnection with loginWithUsernamePassword in order to support adldap connections (`siacomuzzi`)

## [0.1.8] - 2013-10-24
- [7be0242] Merge pull request #2 from auth0/standalone_vs_npm (`José F. Romaniello`)
- [f517547] minor (`José F. Romaniello`)
- [1dd448a] do not pollute windown when used as a module (`José F. Romaniello`)
- [bca0c22] minor (`siacomuzzi`)
- [40c0729] minor (`siacomuzzi`)
- [63faff4] minor (`siacomuzzi`)
- [b76da42] minor (`siacomuzzi`)
- [ebead5e] changePassword: improve success result (`siacomuzzi`)
- [5db26d3] changePassword method (`siacomuzzi`)
- [787f165] getConnections method (`siacomuzzi`)
- [1146416] fix test for ie10 (`José F. Romaniello`)
- [0e44473] disable safari tests (`José F. Romaniello`)
- [0e91627] minor (`José F. Romaniello`)
- [79107ce] change set of browsers for tests (`José F. Romaniello`)
- [75ef118] use BrowserStack/testem instead of saucelabs (`José F. Romaniello`)
- [63e8548] fix problem with XDomainRequest (`José F. Romaniello`)
- [af0cf03] add certs to test (`José F. Romaniello`)
- [d091fb3] add example_https (`José F. Romaniello`)
- [884c1ba] have a nice weekend! (`siacomuzzi`)
- [c46c47f] include simple test for getSSOData (for all browsers) (`siacomuzzi`)
- [5126a5b] hipchat notifications (`Matias Woloski`)
- [70c3968] dont run getSSOData tests in iPhone browser (`siacomuzzi`)
- [3c99610] comment all getSSOData tests (`siacomuzzi`)
- [69cb23a] improved logout helper method (`siacomuzzi`)
- [8aee29b] minor (`siacomuzzi`)
- [e08367f] remove setTimeout because safari (iphone) does not support it (`siacomuzzi`)
- [9d0df8f] minnor (`siacomuzzi`)
- [ef49aad] minor (`siacomuzzi`)
- [17e4074] commented getSSOData tests (temporarily) (`siacomuzzi`)
- [4e9806e] forceLogout method for tests (`siacomuzzi`)
- [f2f7dca] skip getSSOData test (temporarily) (`siacomuzzi`)
- [4039328] minor (`siacomuzzi`)
- [1dc13cd] getSSOData method (`siacomuzzi`)
- [55515dc] minor (`José F. Romaniello`)
- [ef3ea97] minor (`José F. Romaniello`)
- [d7df3fd] minor (`José F. Romaniello`)
- [5e8490a] minor (`José F. Romaniello`)
- [224b039] minor (`José F. Romaniello`)
- [1df98b5] minor (`José F. Romaniello`)
- [ae0e0de] increase font size of test harness (`José F. Romaniello`)
- [f0c26e5] minor (`José F. Romaniello`)
- [2994757] minor (`José F. Romaniello`)
- [320ce84] change to jsonp module (`José F. Romaniello`)
- [5970616] minor (`José F. Romaniello`)
- [8bedec9] fix tests in ie (`José F. Romaniello`)
- [1a938f7] change from chai to expect (`José F. Romaniello`)
- [e66d025] do not use jsonp for IE10 (`José F. Romaniello`)
- [af8a715] minor (`José F. Romaniello`)
- [1dd048e] minor (`José F. Romaniello`)
- [8d8c049] increate timeout (`José F. Romaniello`)
- [081fb70] change to phantomjs (`José F. Romaniello`)

## [0.1.5] - 2013-09-28
- [85c2701] use jsonp for signup when the browser doesnt support cors (`José F. Romaniello`)

## [0.1.4] - 2013-09-27
- [8b9575e] fix 404 error on db connections login (`José F. Romaniello`)
- [9ece5e2] some fixes for IE7 (`José F. Romaniello`)

## [0.1.3] - 2013-09-27
- [2f5f5c3] improve errors in jsonp case (`José F. Romaniello`)

## [0.1.2] - 2013-09-27
- [d5f6fa5] improve errors in JSONP case (`José F. Romaniello`)

## [0.1.1] - 2013-09-27

## [0.1.0] - 2013-09-27
- [a7073c1] add signup feature (`José F. Romaniello`)
- [b598929] update builds (`José F. Romaniello`)
- [87fd887] add support for jsonp (`José F. Romaniello`)
- [735b537] minor (`José F. Romaniello`)

## [0.0.3] - 2013-09-26
- [c05c4f7] add support for db connections user&pass (`José F. Romaniello`)
- [c11a97c] base64 url decode id_token (`José F. Romaniello`)

