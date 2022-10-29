import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { Segment, Grid } from 'semantic-ui-react';
import React, { useState, useCallback } from 'react'

import { MainMenu } from "./MainMenu";
import NewDevice from './NewDevice';
import ManageTriggers from './ManageTriggers';
import DeviceData from './DeviceData';
import BackroundImage from './BackroundImage';

const PageLayout = (props) => {
    const [objectId, setObjectId] = useState(null);
    const [device, setDevice] = useState({deviceId: null, nickName: null})
    const [fetchTrigger, setfetchTrigger] = useState(0)
    const [newDevicePanel, setnewDevicePanel] = useState(false)
    const [triggersPanel, setTriggersPanel] = useState(false)

    const setOid = useCallback(
        (oid) => {
            setObjectId(oid);
        },
        [],
    );
    const showDevice = useCallback(
        (deviceId, nickName) => {
            setDevice({deviceId: deviceId, nickName: nickName});
            setnewDevicePanel(false);
            setTriggersPanel(false);
        },
        [],
    );
    const newDevice = useCallback(
        () => {
            setDevice({deviceId: null, nickName: null});
            setnewDevicePanel(true);
            setTriggersPanel(false);
        },
        [],
    );
    const triggers = useCallback(
        () => {
            setDevice({deviceId: null, nickName: null});
            setnewDevicePanel(false);
            setTriggersPanel(true);
        },
        [],
    );
    const newDeviceCompleted = useCallback(
        () => {
            setDevice({deviceId: null, nickName: null});
            setfetchTrigger(fetchTrigger+1)
            setnewDevicePanel(false);
            setTriggersPanel(false);
        },
        [],
    );

    const deleteDevice = useCallback(
        () => {
            setDevice({deviceId: null, nickName: null});
            setfetchTrigger(fetchTrigger+1)
            setnewDevicePanel(false);
            setTriggersPanel(false);
        },
        [],
    );

    return (
        <>
            <MainMenu setOid={setOid} fetchTrigger={fetchTrigger} newDevice={newDevice} triggers={triggers} showDevice={showDevice}/>
            <UnauthenticatedTemplate>
                <BackroundImage />
            </UnauthenticatedTemplate>

            <AuthenticatedTemplate>
                {
                    (newDevicePanel)?
                        <NewDevice newDeviceCompleted={newDeviceCompleted} objectId={objectId}/>
                    : null
                }
                {
                    (triggersPanel)?
                        <ManageTriggers/>
                    : null
                }
                {
                    (device.deviceId != null)?
                        <DeviceData device={device} deleteDevice={deleteDevice} objectId={objectId}/>
                    : null
                }
            </AuthenticatedTemplate>
        </>
    );
};

export default PageLayout;