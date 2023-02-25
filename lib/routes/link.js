const _ = require("lodash");
const debug = require("debug")("auth0-link-accounts-sample");
const { auth, requiresAuth } = require("express-openid-connect");
const { Errors, set } = require("../flashErrors");
const auth0Client = require("../Auth0Client");


const router = require("express").Router();

router.post("/", (req, res) => {
    const { connection, email, userid, original_user_id, stateInredirect } = req.body;

    req.session.linking = { targetUserId: userid, primaryUserId: original_user_id };
    // console.log("after change:", req.session.linking);
    const authorizationParams = {
        max_age: 0,
        login_hint: email,
        connection: connection,
        session: { absoluteDuration: 5 }
    };
    // Passwordless connection doesn't work with connection param.
    if (["email", "sms"].includes(authorizationParams.connection))
        delete authorizationParams.connection;
    // [re]-authenticate target account before account linking
    res.oidc.login({
        // returnTo: "/user/returnToCIC?state=" + stateInredirect,
        returnTo: process.env.ISSUER_BASE_URL + "/continue?state=" + stateInredirect,
        authorizationParams,

    });
});


module.exports = router;