

    const onDelete = async () => {
        let dataNew;
        if (data.find((e: any) => e.UUID === event.UUID)) {
            await csvs.deleteEvent(event.UUID, {
                fetch: fetchDataMetadir,
                write: writeDataMetadir,
            });
            dataNew = data.filter((e: any) => e.UUID !== event.UUID);
        } else {
            dataNew = data;
        }

        setData(dataNew);
        setEvent(undefined);
        await rebuildLine(dataNew);
    };

                                {event && (
                                    <Button
                                        type="button"
                                        title={t("line.button.delete")}
                                        onClick={onDelete}
                                    >
                                        🗑️
                                    </Button>
                                )}
