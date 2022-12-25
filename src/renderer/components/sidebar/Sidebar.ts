    const notAddedFields = useMemo(
        () =>
            event
                ? Object.keys(schema).filter((prop: any) => {
                    return !Object.prototype.hasOwnProperty.call(
                        event,
                        schema[prop]["label"]
                    );
                })
                : [],
        [event]
    );

    const addedFields = useMemo(
        () =>
            event ? Object.keys(event).filter((prop: any) => prop != "UUID") : [],
        [event]
    );

    function formatTitle() {
                        {event && formatDate(event[schema[groupBy]["label"]])}{" "}
                        {eventIndex && eventIndex}
    }
