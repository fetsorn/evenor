

        <div className={styles.slider}>
          <input
            type="text"
            value={familyID}
            title={t("tree.field.id")}
            onChange={async (e: any) => {
              setFamilyID(e.target.value);
              await render(e.target.value, depth);
            }}
          />
        </div>
