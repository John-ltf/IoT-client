import { LogLevel } from "@azure/msal-browser";

export const b2cPolicies = {
    names: {
        signUpSignIn: process.env.REACT_APP_USER_FLOW_SIGN,
        forgotPassword: process.env.REACT_APP_USER_FLOW_RESET,
        editProfile: process.env.REACT_APP_USER_FLOW_EDIT
    },
    authorities: {
        signUpSignIn: {
            authority: `https://${process.env.REACT_APP_TENANT}.b2clogin.com/${process.env.REACT_APP_TENANT}.onmicrosoft.com/${process.env.REACT_APP_USER_FLOW_SIGN}`,
        },
        forgotPassword: {
            authority: `https://${process.env.REACT_APP_TENANT}.b2clogin.com/${process.env.REACT_APP_TENANT}.onmicrosoft.com/${process.env.REACT_APP_USER_FLOW_RESET}`,
        },
        editProfile: {
            authority: `https://${process.env.REACT_APP_TENANT}.b2clogin.com/${process.env.REACT_APP_TENANT}.onmicrosoft.com/${process.env.REACT_APP_USER_FLOW_EDIT}`
        }
    },
    authorityDomain: `${process.env.REACT_APP_TENANT}.b2clogin.com`
}

export const msalConfig = {
    auth: {
        clientId: process.env.REACT_APP_CLIENT_ID,
        authority: b2cPolicies.authorities.signUpSignIn.authority,
        knownAuthorities: [b2cPolicies.authorityDomain],
        redirectUri: "/",
        postLogoutRedirectUri: "/",
        navigateToLoginRequestUrl: false,
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                }
            }
        }
    }
};

export const protectedResources = {
    iotApi: {
        endpoint: "http://localhost:5000/hello",
        scopes: [`https://${process.env.REACT_APP_TENANT}.onmicrosoft.com/${process.env.REACT_APP_IOT_WEB_API}/${process.env.REACT_APP_IOT_WEB_API_SCOPE}`],
    },
}

 export const loginRequest = {
    scopes: [...protectedResources.iotApi.scopes]
};
