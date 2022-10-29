import './App.css';
import React, { useEffect } from 'react'
import {ToastContainer, toast} from 'react-toastify';
import { MsalProvider, useMsal } from "@azure/msal-react";
import { EventType, InteractionType } from "@azure/msal-browser";
import { b2cPolicies } from "./authConfig";

import PageLayout from './modules/PageLayout';

const B2cAuth = () => {
  const { instance } = useMsal();

  useEffect(() => {
    const callbackId = instance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_FAILURE) {
        if (event.error && event.error.errorMessage.indexOf("AADB2C90118") > -1) {
          if (event.interactionType === InteractionType.Redirect) {
            instance.loginRedirect(b2cPolicies.authorities.forgotPassword);
          } else if (event.interactionType === InteractionType.Popup) {
            instance.loginPopup(b2cPolicies.authorities.forgotPassword)
              .catch(e => {
                return;
              });
          }
        }
      }

      if (event.eventType === EventType.LOGIN_SUCCESS || event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) {
        if (event?.payload) {
          if (event.payload.idTokenClaims["acr"] === b2cPolicies.names.forgotPassword) {
            toast.error("Password has been reset successfully. \nPlease sign-in with your new password.");
            return instance.logout();
          } else if (event.payload.idTokenClaims["acr"] === b2cPolicies.names.editProfile) {
            toast.error("Profile has been edited successfully. \nPlease sign-in again.");
            return instance.logout();
          }
        }
      }
    });

    return () => {
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
  }, []);

  return(
    <>
    </>
  )
}

const App = ({ instance }) => {
  return (
    <>
      <ToastContainer position='bottom-right' />
        <MsalProvider instance={instance}>
          <PageLayout>
            <B2cAuth />
          </PageLayout>
        </MsalProvider>
    </>
  );
}

export default App;
