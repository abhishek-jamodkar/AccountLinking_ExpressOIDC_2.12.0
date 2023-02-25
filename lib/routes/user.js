"use strict";

const debug = require("debug")("auth0-link-accounts-sample");
const { auth, requiresAuth } = require("express-openid-connect");
// const router = require("express").Router();
const auth0Client = require("../Auth0Client");
const { Errors, clear } = require("../flashErrors");
let stateInredirect;


const router = require("express").Router();
/* GET user profile. */
// router.get("/returnToCIC", requiresAuth(), async(req, res) => {
//     console.log("stateInredirect in returnToCIC", req.query.state);

//     req.session.destroy();
//     res.redirect(process.env.ISSUER_BASE_URL + "/continue?state=" + req.query.state);
// });
router.get("/", requiresAuth(), async(req, res) => {
    // req.session.destroy();
    const { sub, email_verified } = req.oidc.user;
    stateInredirect = req.query.state;
    // console.log("stateInredirect", stateInredirect)
    // console.log("sub in User:", sub);
    // console.log("sub in User id_token:", req.appSession.id_token);
    req.session.linking = { primaryUserId: sub }

    try {
        let getUsersWithSameVerifiedEmail = [];
        const getUserProfile = auth0Client.getUser(sub);
        if (email_verified)
        // account linking is only offered verified email
            getUsersWithSameVerifiedEmail = auth0Client.getUsersWithSameVerifiedEmail(
            req.oidc.user
        );

        const [user, suggestedUsers] = await Promise.all([
            getUserProfile,
            getUsersWithSameVerifiedEmail,
        ]);

        const flashError = clear(req);
        console.log("stateInredirect available here?", stateInredirect)

        res.render("user", {
            user,
            suggestedUsers,
            wrongAccountError: flashError && flashError === Errors.WrongAccount,
            stateInredirect
        });
    } catch (err) {
        debug("GET /user[s] failed: %o", err);
        res.render("error", err);
    }
});

module.exports = router;