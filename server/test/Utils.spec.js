
var Utils = require('../Utils');
var assert = require("chai").assert;

var server = require("../app");
var app;

describe('Server Utils Test Suite', function () {
  before(function (done) {
    this.timeout(15000);
    app = server();
    done();
  });

  describe('Utils Method Test suite (To parse and convert dates in timestamps)', function () {
    it('should be a function', function () {
      assert.isFunction(Utils, 'Utils should return a function which takes event object as a parameter');
    })
  });

});