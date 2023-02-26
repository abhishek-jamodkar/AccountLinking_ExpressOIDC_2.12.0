/**
Requirements : 
1. Add auth0 as dependecy in the Action
2. Store the Client Id and clientSecret in the secrets of Action.
3. Add login URI for each application if the user should see a "return to application" button on email verified screen.
4. Deploy and add this action as first Action in Post Login flow.

Usage:
1. If the email for user logging in is unverified, this action will send an email verification email to the user through management API, 
and return error to the application as "Email Verification is required".
2. If user email is verified, the action will be skipped

*/
exports.onExecutePostLogin = async (event, api) => {
api.access.deny("email verification required, please check your email");
if(!event.user.email_verified){
        const _ = require('lodash');  
        console.log("entering Email Verification check");
        const ManagementClient = require('auth0').ManagementClient;
        const management = new ManagementClient({
            domain: "{Auth0 Domain Name}",
            clientId: event.secrets.clientID,
            clientSecret: event.secrets.clientSecret,

        });
/**  providing client_id params will show a button on the email verification confirmation page to redirect to the the login url mentioned in the 
     application login uri field on the client configuration in Auth0
*/
        let  params = {
	        user_id: event.user.user_id,
            client_id : event.client.client_id,
        };
/** The api.access.deny will return the error to the application /callback endpoint and application should read the error 
*   and show appropriate screen to the users.
*/
       await management.jobs.verifyEmail(params)
       .then(data => {
 api.access.deny("email verification required, please check your email");
})
.catch(err => {
 api.access.deny("Something went wrong, please try again!");

});
       
api.access.deny("email verification required, please check your email");

}

};

