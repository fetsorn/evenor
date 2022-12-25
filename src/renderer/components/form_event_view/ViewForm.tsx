
                        <div>
                            <Paragraph>{event?.UUID}</Paragraph>
                            {event && <div>{addedFields.map(generateOutput)}</div>}
                        </div>
