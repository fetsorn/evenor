
                        <div>
                            {isReadOnly || (
                                <div>
                                    {event && (
                                        <Button
                                            type="button"
                                            title={t("line.button.edit")}
                                            onClick={onEdit}
                                        >
                                            ✏️
                                        </Button>
                                    )}
                                </div>
                            )}
                            <Paragraph>{event?.UUID}</Paragraph>
                            {event && <div>{addedFields.map(generateOutput)}</div>}
                        </div>