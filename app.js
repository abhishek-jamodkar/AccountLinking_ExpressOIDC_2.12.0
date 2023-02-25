"use strict";

const dotenv = require("dotenv");
dotenv.load();
const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const bodyParser = require("body-parser");
const { auth, requiresAuth } = require("express-openid-connect");
const https = require("https");
const fs = require("fs");
const session = require('express-session')
const auth0Client = require("./lib/Auth0Client");
const { Errors, set } = require("./lib/flashErrors");
const _ = require("lodash");
const user = require("./lib/routes/user");
const link = require("./lib/routes/link");
const jwt_decode = require('jwt-decode');
const app = express();
const debug = require("debug")("auth0-link-accounts-sample");


app.use(session({ secret: 'variable Secret', resave: false, saveUninitialized: true, cookie: { secure: true, maxAge: 300000 } }))

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "favicon.png")));

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/user", auth({
    authRequired: true,
    auth0Logout: true,
    httpTimeout: 1000,
    baseURL: process.env.BASE_URL + "/user",
    routes: {
        login: "/login",
        logout: "/logout",
        postLogoutRedirect: process.env.BASE_URL + "/user",
    },
    session: { absoluteDuration: 180 },
    authorizationParams: {
        // prompt: 'login'
    },

}), requiresAuth(), user);

app.use("/link", auth({
    authRequired: true,
    auth0Logout: true,
    httpTimeout: 10000,
    baseURL: process.env.BASE_URL + "/link",
    afterCallback: accountLink,

}), requiresAuth(), link);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
    app.use((err, req, res) => {
        res.status(err.status || 500);
        res.render("error", {
            message: err.message,
            error: err,
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render("error", {
        message: err.message,
        error: {},
    });
});


async function mergeMetadata(primaryUserId, secondaryUserId) {
    // load both users with metedata.
    const [primaryUser, secondaryUser] = await Promise.all(
        [primaryUserId, secondaryUserId].map((uid) => auth0Client.getUser(uid))
    );

    const customizerCallback = function(objectValue, sourceValue) {
        if (_.isArray(objectValue)) {
            return sourceValue.concat(objectValue);
        }
    };
    const mergedUserMetadata = _.merge({},
        secondaryUser.user_metadata,
        primaryUser.user_metadata,
        customizerCallback
    );
    const mergedAppMetadata = _.merge({},
        secondaryUser.app_metadata,
        primaryUser.app_metadata,
        customizerCallback
    );
    await auth0Client.updateUser(primaryUserId, {
        user_metadata: mergedUserMetadata,
        app_metadata: mergedAppMetadata,
    });
}



async function accountLink(req, res, session) {
    const {
        linking: { targetUserId, primaryUserId },
    } = req.session;


    var decoded = jwt_decode(session.id_token);

    const { sub: authenticatedTargetUserId } = decoded;
    if (authenticatedTargetUserId !== targetUserId) {
        set(req, Errors.WrongAccount);
        return session;
    }

    const { id_token: targetIdToken } = session;


    try {

        console.log("linking account now");
        await mergeMetadata(primaryUserId, authenticatedTargetUserId);
        await auth0Client.linkAccounts(primaryUserId, targetIdToken);
        console.log("Accounts linked.");
    } catch (err) {
        console.log("Linking failed %o", err);
    } finally {
        return session;
    }

}


module.exports = app;