import React, { useState, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetView } from '@/components/index.js';
import { useStore } from '@/store/index.js';
import { FieldText } from '..';

const Dispenser = React.lazy(() => import('lib/dispensers/index.js'));

export function ViewField({ entry, schema, isBaseObject }) {
  const { i18n } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const [
    baseEntry,
  ] = useStore((state) => [
    state.entry,
  ]);

  const branch = entry._;

  const branchType = schema[branch]?.type;

  const branchTask = schema[branch]?.task;

  const branchDescription = schema?.[branch]?.description?.[i18n.resolvedLanguage] ?? branch;

  const trunk = schema[branch]?.trunk;

  if (trunk === undefined
      && branchType !== 'array'
      && isBaseObject) {
    return (
      <div>
        {entry.UUID}

        { Object.keys(entry).map((leaf) => {
          if (leaf === '_' || leaf === 'UUID') { return; }

          const leafEntry = schema[leaf]?.type === 'object'
                                 || schema[leaf]?.type === 'array'
            ? entry[leaf]
            : { _: leaf, [leaf]: entry[leaf] };

          return (
            <div key={(entry.UUID ?? '') + leaf}>
              <ViewField entry={leafEntry} schema={schema} />
            </div>
          );
        })}
      </div>
    );
  }

  if (trunk === 'tags') {
    return (
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
    );
  }

  switch (branchType) {
    case 'array':
      return (
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

              { entry.UUID }

              { entry.items.map((item) => (
                <div key={`array_item_${Math.random()}`}>
                  <ViewField entry={item} schema={schema} />
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 'object':
      if (branchTask === 'file') {
        return (
          <AssetView {...{ entry, schema }} />
        );
      }

      return (
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
                if (leaf === '_' || leaf === 'UUID') { return <div />; }

                const leafEntry = schema[leaf]?.type === 'object'
                                 || schema[leaf]?.type === 'array'
                  ? entry[leaf]
                  : { _: leaf, [leaf]: entry[leaf] };

                return (
                  <div key={(entry.UUID ?? '') + leaf}>
                    <ViewField entry={leafEntry} schema={schema} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );

    default:
      return (
        <div>
          {branchDescription}

          <FieldText value={entry[branch]} />
        </div>
      );
  }
}
