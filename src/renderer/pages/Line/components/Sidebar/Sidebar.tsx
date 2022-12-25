import React, { useEffect, useState, useMemo } from "react";
import { Title } from "../../../../components";
import { IFrames, EditForm, ViewForm } from "./components";
import { inUseEffect, inUseEffect2 } from "./Sidebar";

const Sidebar = (isEdit, event, eventOriginal) => {

    useEffect(() => {
        inUseEffect()
    }, [eventOriginal]);

    useEffect(() => {
        inUseEffect2()
    }, [event]);

    return (
        <>
            <Title>formatTitle(event, eventIndex)</Title>
            {isEdit ? <EditForm/> : <ViewForm/>}
            <IFrames/>
        </>
    );
};

export default Sidebar;
