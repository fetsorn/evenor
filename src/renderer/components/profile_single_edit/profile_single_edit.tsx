import React, { useEffect, useState, useMemo } from "react";
import { Title } from "../../../../components";
import { IFrames, EditForm, ViewForm } from "./components";
import { formatTitle } from "./Sidebar";

export default function Sidebar({ event: any, eventOriginal: any }) {
  return (
    <div className={cn(styles.sidebar, { [styles.invisible]: !event })}>
      <div className={styles.container}>
        <div id="scrollcontainer" className={styles.sticky}>
          <Title>formatTitle(event, eventIndex)</Title>

          <div>
            <div className={styles.buttonbar}>
              <ButtonRevertEvent />

              <ButtonSaveEvent />

              <InputDropdown />

              <ButtonDeleteEvent />
            </div>
            <form>{addedFields.map(generateInput)}</form>;
          </div>

          <IFrames />
        </div>
      </div>
    </div>
  );
}
