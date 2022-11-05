import React, { useState, useEffect } from 'react'
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { loginRequest, b2cPolicies, protectedIoTResources, protectedFuncResources } from "../authConfig";
import { Menu, Icon } from 'semantic-ui-react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosAgent from '../api/apiAgents';

import DevicesMenu from './DevicesMenu';

export const MainMenu = ({setOid, fetchTrigger, newDevice, triggers, showDevice}) => {
    const { instance, accounts  } = useMsal();
    const [objectId, setObjectId] = useState(null);
    const [username, setUsername] = useState(null);
    const [IoTApiAccessToken, setIoTApiAccessToken] = useState(null);
    const [IoTFuncApiAccessToken, setFuncIoTApiAccessToken] = useState(null);

    const acquireToken = async (scope, setAccessTokenHandler, axioSetAccessTokenHandler) =>{
        if (accounts.length > 0) {
            instance.acquireTokenSilent({
                scopes: scope,
                account: accounts[0]
            }).then((response) => {
                axioSetAccessTokenHandler(response.accessToken)
                setAccessTokenHandler(response.accessToken)
                return response.accessToken
            }).catch((error) => {
                if (error instanceof InteractionRequiredAuthError) {
                    instance.acquireTokenPopup({
                        scopes: scope,
                    }).then((response) => {
                        axioSetAccessTokenHandler(response.accessToken)
                        setAccessTokenHandler(response.accessToken)
                        return response.accessToken
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
            instance.acquireTokenSilent(request).then(async (response) => {
                const jwt = JSON.parse(atob(response.idToken.split('.')[1]));
                setObjectId(jwt["oid"]);
                setOid(jwt["oid"]);
                setUsername(jwt["name"]);
                await acquireToken(protectedIoTResources.iotApi.scopes, setIoTApiAccessToken, axiosAgent.setIoTApiAccessToken);
                await acquireToken(protectedFuncResources.iotApi.scopes, setFuncIoTApiAccessToken, axiosAgent.setFuncIoTApiAccessToken);

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
            axiosAgent.setIoTApiAccessToken(null);
            setIoTApiAccessToken(null);
            axiosAgent.setFuncIoTApiAccessToken(null);
            setFuncIoTApiAccessToken(null);
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