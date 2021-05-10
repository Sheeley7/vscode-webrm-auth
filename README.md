# vscode-webrm-auth [![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FAzure%2Fazure-quickstart-templates%2Fmaster%2Fquickstarts%2Fmicrosoft.storage%2Fstorage-account-create%2Fazuredeploy.json)
Auth server for vscode-webrm

# Directions
Start by clicking the 'Deploy to Azure' button up above 🠕

Then fill out the deployment form, leaving Application ID, Appliocation Private Key, and Auth redirect url empty for now.

![](screenshots/new-app-service2.png)

Click next and after the deployment is finished, write down the url. (https://your-site-name.azurewebsites.net).  

Go into Azure and create a new App Registration (Note, this is different from the App Service you just created).

![](screenshots/new-app-registration1.png)

Give your application a name, select whether it can be used for multiple tenants or signle tenant, then click Register

![](screenshots/new-app-registration2.png)

Click 'Certificates & secrets', then 'New client secret'. Enter a description and an expiration then click 'Add'  
*Be sure to copy down this client secret, as you will not be able to view it later (but you can always generated another)

![](screenshots/new-app-registration3.png)

Click 'API permissions', then 'Add a permission'

![](screenshots/new-app-registration4.png)

Find Dynamics CRM, select 'Delegated permissions', check the box 'user_impersonation', then click 'Add permissions'

![](screenshots/new-app-registration5.png)

Click 'Overview', copy down the Application ID, then click 'Add a Redirect URI'

![](screenshots/new-app-registration6.png)

Click 'Add a platform', enter the URL of the App Service that was deployed earlier (https://your-site-name.azurewebsites.net).

For the logout URL, enter the same URL as the Redirect URI with a '/logout' at the end:  
(https://your-site-name.azurewebsites.net/logout)

![](screenshots/new-app-registration7.png)

Click 'Configure', then add the following 2 redirect URIs  
    - 'https://your-site-name.azurewebsites.net/code'  
    - 'http://localhost/'  

Go back to the App Service that was deployed earlier, click 'Configuration', then enter the following values:  

Set CLIENT_ID to the Application ID you copied from the App Registration  
Set CLIENT_SECRET to the client secret you generated in the App Registration  
Set REDIRECT_URI to the App Service URL (https://your-site-name.azurewebsites.net)  
Leave FINAL_REDIRECT_URI set to 'http://localhost:8350/result'  

![](screenshots/new-app-service3.png)

And that should be it! Your App Service should be ready to use with vscode-webrm.
