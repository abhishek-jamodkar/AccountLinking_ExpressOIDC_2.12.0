exports.onExecutePostLogin = async (event, api) => {
    if(!event.user.app_metadata.account_link_check_done){
    if (event.client.client_id !== '{Client ID of Account Linking App}' && !event.user.app_metadata.account_link_required === false) {
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
                if (data.length === 1) {
                     api.user.setAppMetadata("account_link_check_done", true);
                }
            }).catch(err => {
                console.log(err);
            });
    }
    }
};
exports.onContinuePostLogin = async (event, api) => {
    api.user.setAppMetadata("account_link_required", false);
    api.user.setAppMetadata("account_link_check_done", true);
}
