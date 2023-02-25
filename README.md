# AccountLinking_ExpressOIDC_2.12.0
# Auth0 Node.js Regular Web App with Express-Openid-connect v2.12 for Account Linking with Auth0 Actions Redirect.

## Install

Auth0 Account Linking Action :
1. Create an Auth0 Action using the AccountLinking.js code. 
2. Replace the variables in the AccountLinking Action and deploy. (This action should be sequenced after the email verification required Action.)


Account Linking App :
1. Install Node.js v12.16.2 or later 
2. Add a .env file containing your config. You can use .env_sample as template.
3. Create a "Regular Web Application" using [Auth0 Dashboard](https://manage.auth0.com) and enable [Implict, Authorization Code and Client Credentials grants](#grant-types)
4. In your App's configuration on the [Auth0 Dashboard](https://manage.auth0.com), add `http://localhost:3000/user/callback, http://localhost:3000/link/callback` to the list of **Allowed Callback URLs** and `http://localhost:3000/user` to **Allowed Logout URLs** list. (Replace localhost:3000 with your hostname and/or port if not using the default port 3000 while running the app on localhost.)
5. [Grant "read:users update:users"](#management-api-scopes) scopes to your "Regular Web App".
6. Make sure you have at least two enabled econnections where you can login with the same email. A Database and a Social provide a good simple testing setup.
7. Run: `npm install` and `npm run start`
8. Go to `http://localhost:3000/user`  (or your custom url)and you'll see the app running.


## Usage
Auth0 Account Linking Action :
1. Account Linking Action will check if user login count is 1 or account linking required flag in user app_metadata is true.
2. If condition returns true, the user will be redirected to the account linking app after setting user.app_metadata.account_link_required = true.
  The account_link_required check is added to prevent user bypassing account linking by closing the Account Linking application without linking the accounts.If user closes the Account linking app, it will be sent back to Account Linking app when it tries to login again to any application.
3. On successful account linking, the Account linking app redirects user back to Auth0 authentication pipeline.
4. The onContinuePostLogin in the Action will set account_link_required to false and continue the authentication process.


Account Linking Application:
1. On getting a request to /user endpoint with state query parameter from Auth0 Action redirect, the app will capture the state parameter in memory.
2. App will show the accounts that can be linked.
3. On clicking the link button, user will need to authenticate with the account to be linked.
4. On successful authentication, the application will link the accounts, merge the metadata and redirect user back to /continue endpoint by adding the state parameter captured in step 1.


## Notes
The account linking application in this sample is created to be used in conjunction with the Redirect Action and hence, if the application is accessed directly, it will try to redirect user to Auth0 /continue endpoint without state parameter and result in failure.
