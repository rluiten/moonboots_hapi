/*Test that label parameters are honored*/
var Lab = exports.lab = require('lab').script();
var Expect = require('code').expect;
var server, server3001, server3002, appSource;
var async = require('async');
var Hapi = require('hapi');
var Moonboots = require('moonboots');
var MoonbootsHapi = require('..');
var options = {
    appPath: '/app',
    labels: ['foo'],
    moonboots: {
        jsFileName: 'moonboots-hapi-js',
        cssFileName: 'moonboots-hapi-css',
        main: __dirname + '/../sample/app/app.js',
        developmentMode: true,
        stylesheets: [
            __dirname + '/../sample/stylesheets/style.css'
        ],
    }
};

var moonboots = new Moonboots(options.moonboots);

Lab.experiment('labels parameter', function () {
    Lab.before(function (done) {
        async.parallel({
            pack: function (next) {
                server = new Hapi.Server();
                //TODO clean up once https://github.com/spumko/hapi/pull/1425 is merged
                server3001 = server.connection({ port: 3001, labels: ['foo'] });
                server3002 = server.connection({ port: 3002, labels: ['bar'] });
                //server3001 = new Hapi.Server('localhost', 3001, {labels: ['foo']});
                //server3002 = new Hapi.Server('localhost', 3002, {labels: ['bar']});
                //pack._server(server3001);
                //pack._server(server3002);
                server.register({ register: MoonbootsHapi, options: options }, next);
            },
            getSource: function (next) {
                appSource = moonboots.htmlSource();
                next();
            }
        }, function (err) {
            if (err) {
                process.stderr.write('Unable to setUp tests', err, '\n');
                process.exit(1);
            }
            done();
        });
    });
    Lab.test('server with matching label', function (done) {
        server3001.inject({
            method: 'GET',
            url: '/app'
        }, function _getApp(res) {
            Expect(res.statusCode, 'response code').to.equal(200);
            Expect(res.payload, 'response body').to.equal(appSource, 'application source');
            done();
        });
    });
    Lab.test('server without matching label', function (done) {
        server3002.inject({
            method: 'GET',
            url: '/app'
        }, function _getApp(res) {
            Expect(res.statusCode, 'response code').to.equal(404);
            done();
        });
    });
});
