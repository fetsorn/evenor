
                        <div>
                            <div className={styles.buttonbar}>
                                {event && (
                                    <Button
                                        type="button"
                                        title={t("line.button.revert")}
                                        onClick={onRevert}
                                    >
                                        ↩
                                    </Button>
                                )}
                                {menuItems.length > 0 && (
                                    <DropdownMenu
                                        title={t("line.dropdown.input")}
                                        label="+"
                                        menuItems={menuItems}
                                    />
                                )}
                                {event && (
                                    <Button
                                        type="button"
                                        title={t("line.button.save")}
                                        onClick={onSave}
                                    >
                                        💾
                                    </Button>
                                )}
                                {event && (
                                    <Button
                                        type="button"
                                        title={t("line.button.delete")}
                                        onClick={onDelete}
                                    >
                                        🗑️
                                    </Button>
                                )}
                            </div>
                            {event && <form>{addedFields.map(generateInput)}</form>}
                        </div>