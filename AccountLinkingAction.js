/**
* Requirements :
* 1. Add this action after the email verified check.
* 2. Setup Account Linking WebApp.
* 3. You can use the client id and secret from the Account Linking WebApp in this Action as that client woule have the necessary permissions on Management API.

* Usage:
    1. Check if user app_metadata has account_link_check_done set.
    2. If the flag is set, means user account was checked for account linking and no other account was found with same verified email.
    3. If flag is not set
*/


exports.onExecutePostLogin = async (event, api) => {
    if(!event.user.app_metadata.account_link_check_done){
    if (event.client.client_id !== '{Client ID of Account Linking App}') {
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
    api.user.setAppMetadata("account_link_check_done", true);
}
