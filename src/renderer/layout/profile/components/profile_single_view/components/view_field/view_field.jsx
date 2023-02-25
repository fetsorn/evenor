import React, { useState, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { manifestRoot } from 'lib/api';
import { useStore } from '@/store/index.js';
import { FieldText } from '..';

const Dispenser = React.lazy(() => import('lib/dispensers/index.js'));

export function ViewField({ entry }) {
  const { i18n } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const [
    baseEntry,
    isSettings,
  ] = useStore((state) => [
    state.entry,
    state.isSettings,
  ]);

  const schema = isSettings ? JSON.parse(manifestRoot) : useStore((state) => state.schema);

  const branch = entry['|'];

  const branchType = schema[branch]?.type;

  const branchDescription = schema?.[branch]?.description?.[i18n.resolvedLanguage] ?? branch;

  const trunk = schema[branch]?.trunk;

  return (
    <div>
      {branchType === 'array' ? (
        <div>
          {!isOpen ? (
            <div>
              <button type="button" onClick={() => setIsOpen(true)}>▶️</button>

              {branchDescription}
            </div>
          ) : (
            <div>
              <div>
                <button type="button" onClick={() => setIsOpen(false)}>🔽</button>

                {branchDescription}
              </div>

              {entry.UUID}

              { entry.items.map((item, index) => (
                <div key={index}>
                  <ViewField entry={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : trunk === 'tags' ? (
        <div>
          {!isOpen ? (
            <div>
              <button type="button" onClick={() => setIsOpen(true)}>▶️</button>

              {branchDescription}
            </div>
          ) : (
            <div>
              <div>
                <button type="button" onClick={() => setIsOpen(false)}>🔽</button>

                {branchDescription}
              </div>

              <Suspense>
                <Dispenser {...{ baseEntry, branchEntry: entry }} />
              </Suspense>
            </div>
          )}
        </div>
      ) : branchType === 'object' ? (
        <div>
          {!isOpen ? (
            <div>
              <button type="button" onClick={() => setIsOpen(true)}>▶️</button>

              {branchDescription}
            </div>
          ) : (
            <div>
              <div>
                <button type="button" onClick={() => setIsOpen(false)}>🔽</button>

                {branchDescription}
              </div>

              {entry.UUID}

              { Object.keys(entry).map((leaf) => {
                if (leaf === '|' || leaf === 'UUID') { return; }

                const leafEntry = schema[leaf]?.type === 'object'
                                 || schema[leaf]?.type === 'array'
                  ? entry[leaf]
                  : { '|': leaf, [leaf]: entry[leaf] };

                return (
                  <div key={(entry.UUID ?? '') + leaf}>
                    <ViewField entry={leafEntry} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          {branchDescription}

          <FieldText value={entry[branch]} />
        </div>
      )}
    </div>
  );
}
