import React, { useState, useEffect } from 'react'
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { loginRequest, b2cPolicies } from "../authConfig";
import { Button, Menu, Icon } from 'semantic-ui-react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DevicesMenu from './DevicesMenu';

export const MainMenu = ({setOid, fetchTrigger, newDevice, triggers, showDevice}) => {
    const { instance, accounts } = useMsal();
    const [objectId, setObjectId] = useState(null);
    const [username, setUsername] = useState(null);

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
                        <DevicesMenu fetchTrigger={fetchTrigger} showDevice={showDevice} objectId={objectId} />
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