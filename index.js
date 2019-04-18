const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const AuthenticationContext = require('adal-node').AuthenticationContext;
require('dotenv').config();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;
const final_redirect_uri = process.env.FINAL_REDIRECT_URI;
const authority_url = "https://login.windows.net";
const auth_url = authority_url + "/common/oauth2/authorize";
var crm_url;

/**
 * Generates a random string
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function (length) {
    let text = '';
    const possible = 'tommarvoloriddle';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const stateKey = 'dynamics_auth_state';

const app = express();

app.use(express.static(__dirname + '/public'))
    .use(cookieParser());

app.get('/login', function (req, res) {

    crm_url = req.query.crm_url;
    
    const state = generateRandomString(16);
    res.cookie(stateKey, state);
    res.redirect(auth_url + '?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            redirect_uri: redirect_uri + "/code",
            resource: crm_url,
            prompt: "consent",
            state: state
        }));
});

app.get('/code', function (req, res) {
  
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;
    
    const refresh_token = req.query.refresh_token;
    var authenticationContext = new AuthenticationContext(authority_url + "/common");
    authenticationContext.acquireTokenWithAuthorizationCode(req.query.code, redirect_uri + "/code", crm_url, client_id, client_secret, function(err, response) {
        var message = '';
        if (err) {
          message = 'error: ' + err.message + '\n';
        }
        message += 'response: ' + JSON.stringify(response);

        res.redirect(final_redirect_uri + '?' +
            querystring.stringify({
                access_token: response.accessToken,
                refresh_token: response.refreshToken,
                expires_in: response.expiresIn,
                expires_on: response.expiresOn
            }));
    });    
});

app.get('/refresh_token', function (req, res) {
    crm_url = req.query.crm_url;
    var authenticationContext = new AuthenticationContext(authority_url + "/common"); 
    authenticationContext.acquireTokenWithRefreshToken(req.session.authInfo.refreshToken, client_id, client_secret, crm_url, function(refreshErr, refreshResponse) { 
        if (refreshErr) { 
            var message = 'refreshError: ' + refreshErr.message; 
            res.send(message);  
            return; 
        }
        res.send(refreshResponse);
      
    });  
   
});


app.listen(process.env.PORT || 3000);

