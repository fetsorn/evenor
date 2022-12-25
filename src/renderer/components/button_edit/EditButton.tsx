
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
