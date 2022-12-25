
          <div>
            {t("tree.label.depth")}: {depth}
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={depth}
            title={t("tree.field.depth")}
            onChange={async (e: any) => {
              setDepth(e.target.value);
              await render(familyID, e.target.value);
            }}
          />
