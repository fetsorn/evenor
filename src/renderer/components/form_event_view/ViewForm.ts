
    const generateOutput = (label: any, idx: any) => {
        const prop = Object.keys(schema).find(
            (prop: any) => schema[prop]["label"] === label
        );
        const lang = i18n.resolvedLanguage;
        const description = schema?.[prop]?.description?.[lang] ?? label;
        if (event?.[label])
            return (
                <div>
                    <br />
                    <div key={`output_${idx}`}>{description}</div>
                    <Paragraph key={`label_${idx}`}>{event[label]}</Paragraph>
                </div>
            );
    };
