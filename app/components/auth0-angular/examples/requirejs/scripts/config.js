require.config({
    paths: {
        'angular':          '//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular',
        'angular-route':    '//ajax.googleapis.com/ajax/libs/angularjs/1.2.16/angular-route',
        'auth-angular':     './auth0-angular',
        'angular-jwt':     '//cdn.rawgit.com/auth0/angular-jwt/master/dist/angular-jwt',
        'angular-storage': '//cdn.rawgit.com/auth0/angular-storage/master/dist/angular-storage',
        'auth0':            '//cdn.auth0.com/w2/auth0-6'
    },
    shim: {
        'angular':{ exports:'angular' },
        'angular-route':    { deps:['angular']         },
        'angular-storage':    { deps:['angular']         },
        'angular-jwt':    { deps:['angular']         },
        'auth0-angular':    { deps:['angular']         }
    }
});

define([ './controllers' ], function () {
  // Your app has loaded!
});

