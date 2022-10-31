import React, { useState, useEffect } from 'react'
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { InteractionStatus, InteractionRequiredAuthError } from "@azure/msal-browser";
import { loginRequest, b2cPolicies, protectedResources } from "../authConfig";
import { Menu, Icon } from 'semantic-ui-react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosAgent from '../api/apiAgents';

import DevicesMenu from './DevicesMenu';

export const MainMenu = ({setOid, fetchTrigger, newDevice, triggers, showDevice}) => {
    const { instance, accounts, inProgress  } = useMsal();
    const [objectId, setObjectId] = useState(null);
    const [username, setUsername] = useState(null);
    const [IoTApiAccessToken, setIoTApiAccessToken] = useState(null);

    const acquireToken = () =>{
        if (accounts.length > 0) {
            instance.acquireTokenSilent({
                scopes: protectedResources.iotApi.scopes,
                account: accounts[0]
            }).then((response) => {
                axiosAgent.setIoTApiAccessToken(response.accessToken)
                setIoTApiAccessToken(response.accessToken)
            }).catch((error) => {
                if (error instanceof InteractionRequiredAuthError) {
                    instance.acquireTokenPopup({
                        scopes: protectedResources.iotApi.scopes,
                    }).then((response) => {
                        axiosAgent.setIoTApiAccessToken(response.accessToken)
                        setIoTApiAccessToken(response.accessToken)
                    }).catch(error => console.log(error));
                }
            });
        }
    }

    useEffect(() => {
        if (accounts.length > 0) {
            const request = {
                scopes: ["openid"],
                account: accounts[0]
            };
            instance.acquireTokenSilent(request).then(response => {
                const jwt = JSON.parse(atob(response.idToken.split('.')[1]));
                setObjectId(jwt["oid"]);
                setOid(jwt["oid"]);
                setUsername(jwt["name"]);
                acquireToken();
            }).catch(error => {
                if (error instanceof InteractionRequiredAuthError) {
                    instance.acquireTokenPopup(request).then(response => {
                        const jwt = (atob(response.idToken.split('.')[1]));
                        setObjectId(jwt["oid"]);
                        setOid(jwt["oid"]);
                        setUsername(jwt["name"]);
                    });
                }
            });
        }
        else {
            setObjectId(null);
            setUsername(null);
            axiosAgent.setIoTApiAccessToken(null)
            setIoTApiAccessToken(null);
        }
    }, [accounts]);

    const copyId = () =>{
        navigator.clipboard.writeText(objectId);
        toast.info(`Id ${objectId} copied`);
    }

    const newdevice = () => {
        newDevice();
    }

    const triggersPanel = () => {
        triggers();
    }

    return (
        <>
            <Menu inverted size='tiny'>
                <Menu.Item>
                    <Icon color='purple' name='microchip' />
                </Menu.Item>
                <UnauthenticatedTemplate>
                    <Menu.Menu position='right'>
                        <Menu.Item icon="sign-in" content="Login" onClick={() => instance.loginRedirect(loginRequest)} />
                    </Menu.Menu>
                </UnauthenticatedTemplate>

                <AuthenticatedTemplate>
                    <Menu.Item icon='add' content='New Device' onClick={newdevice} />
                    <Menu.Item icon='play' content='Triggers' onClick={triggersPanel} />
                    <Menu.Item>
                        {
                            (objectId !== null && IoTApiAccessToken !== null)?
                                <DevicesMenu fetchTrigger={fetchTrigger} showDevice={showDevice} objectId={objectId} IoTApiAccessToken={IoTApiAccessToken} />
                            : <></>
                        }
                    </Menu.Item>
                    <Menu.Menu position='right'>
                        <Menu.Item icon='copy' content="Copy your ID" onClick={() => copyId()} />
                        <Menu.Item icon='edit' content={"Edit Profile ("+username+")"} onClick={() => instance.loginRedirect(b2cPolicies.authorities.editProfile)} />
                        <Menu.Item icon="redo" content="Reset Password" onClick={() => instance.loginRedirect(b2cPolicies.authorities.forgotPassword)} />
                        <Menu.Item icon="sign-out" content="Logout" onClick={() => instance.logoutRedirect({ postLogoutRedirectUri: "/" })} />
                    </Menu.Menu>
                </AuthenticatedTemplate>
            </Menu>
        </>
    );
};