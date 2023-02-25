exports.onExecutePostLogin = async (event, api) => {
    if (event.client.client_id !== '{Client ID of Account Linking App}' && (event.user.app_metadata.account_link_required === 'true' || event.stats.logins_count < 2)) {
        const _ = require('lodash');
        console.log("entering accountLinking");
        const ManagementClient = require('auth0').ManagementClient;
        const management = new ManagementClient({
            domain: "{Auth0 DOmain Name}",
            clientId: "{Client ID of Account Linking App}",
            clientSecret: "{Client secret of Account Linking App}",

        });
        await management.users.getByEmail(event.user.email)
            .then(data => {
                console.log(data);
                if (data.length < 1) {
                    console.log("no data found");
                }
                if (data.length > 1) {
                    console.log("more than one record found for the email, redirecting");
                      api.user.setAppMetadata("account_link_required", true);
                      api.redirect.sendUserTo("https://{Account Linking App domain name}/user");


                }
            }).catch(err => {
                console.log(err);
            });
    }
};
exports.onContinuePostLogin = async (event, api) => {
    api.user.setAppMetadata("account_link_required", false);
}
