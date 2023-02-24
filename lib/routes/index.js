"use strict";

const router = require("express").Router();

router.get("/login", (req, res) => res.oidc.login({ returnTo: "/user" }));
router.get("/logout", (req, res) => res.oidc.logout());
router.get("/user/logout", (req, res) => res.oidc.logout());

router.get("/", (req, res) => {
    if (req.oidc.isAuthenticated()) return res.redirect("/user");
    res.render("index", {
        title: "Account Linking Sample",
        user: req.oidc && req.oidc.user,
    });
});

module.exports = router;