"use strict";
const express = require("express");
const SampleController = require("./sample-controller");
const Access = require("../access-permission/access-permission-middleware");
var Routes;
(function (Routes) {
    function sample() {
        var router = express.Router();
        router.use(Access.ensureAuthenticated());
        router.route('/')
            .get(SampleController.sampleFunc);
        return router;
    }
    Routes.sample = sample;
})(Routes = exports.Routes || (exports.Routes = {}));
