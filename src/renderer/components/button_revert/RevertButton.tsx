
    const onRevert = async () => {
        setEvent(eventOriginal);
        if (!data.find((e: any) => e.UUID === event.UUID)) {
            setEvent(undefined);
        }
        setIsEdit(false);
    };
                                {event && (
                                    <Button
                                        type="button"
                                        title={t("line.button.revert")}
                                        onClick={onRevert}
                                    >
                                        ↩
                                    </Button>
                                )}
