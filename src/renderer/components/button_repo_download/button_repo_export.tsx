
                                    <button
                                        type="button"
                                        title={t("list.button.download")}
                                        onClick={async () => {
                                            await zip(repo);
                                        }}
                                    >
                                        ⬇
                                    </button>
