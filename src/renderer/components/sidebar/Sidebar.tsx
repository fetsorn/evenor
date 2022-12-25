import React, { useEffect, useState, useMemo } from "react";
import { Title } from "../../../../components";
import { IFrames, EditForm, ViewForm } from "./components";
import { formatTitle } from "./Sidebar";

const Sidebar = (isEdit, event, eventOriginal) => {

    return (
        <>
        <Title>formatTitle(event, eventIndex)</Title>
        {isEdit ? (
            <div className={styles.buttonbar}>
                <RevertButton/>
                <SaveButton/>
                <InputDropdown/>
                <DeleteButton/>
            </div>
            <EditForm/>
        ) : (
            <div className={styles.buttonbar}>
                <EditButton/>
            </div>
            <ViewForm/>
        )}
        <IFrames/>
        </>
    );
};

export default Sidebar;
