import React, { useState, useEffect, useMemo, useRef } from "react";
import { useMedia } from "./use_media.js";
import { useWindowSize } from "./use_window_size.js";

const REM_DESKTOP = 0.277777;
const REM_MOBILE = 0.8;

const rowHeights = {
  mobile: 40,
  desktop: 40,
};

// TODO pass ...props to overviewItem as spread
export function VirtualScroll({ data, OverviewItem, tolerance = 2, ...other }) {
  const { width: viewportWidth } = useWindowSize();

  const isMobile = useMedia("(max-width: 600px)");

  const rowHeight = useMemo(
    () =>
      isMobile
        ? Math.round((viewportWidth / 100) * REM_MOBILE * rowHeights.mobile)
        : Math.round((viewportWidth / 100) * REM_DESKTOP * rowHeights.desktop),
    [viewportWidth, isMobile],
  );

  const topSpacer = useRef();

  const [start, setStart] = useState(0);

  const { height: viewportHeight } = useWindowSize();

  const visibleRowCount = useMemo(
    () => Math.ceil(viewportHeight / rowHeight) + tolerance * 2,
    [viewportHeight, rowHeight, tolerance],
  );

  const dataWithKeys = data.map((elem, index) => ({
    ...elem,
    key: index,
  }));

  const getTopHeight = () => rowHeight * start;

  const getBottomHeight = () =>
    rowHeight * (dataWithKeys.length - (start + visibleRowCount));

  useEffect(() => {
    const onScroll = () => {
      const offsetTop = topSpacer?.current.offsetTop ?? 0;

      const shift = Math.min(
        Math.max(
          0,
          Math.floor((window.scrollY - offsetTop) / rowHeight) - tolerance,
        ),
        Math.max(0, dataWithKeys.length - visibleRowCount),
      );

      setStart(shift);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [dataWithKeys, visibleRowCount, rowHeight, tolerance]);

  return (
    <>
      <div style={{ height: getTopHeight() }} ref={topSpacer} />
      {dataWithKeys.slice(start, start + visibleRowCount).map((elem) => (
        <OverviewItem
          record={elem}
          key={elem.key}
          style={{ height: rowHeight }}
          isLast={elem.key === dataWithKeys.length - 1}
          {...other}
        />
      ))}
      <div style={{ height: getBottomHeight() }} />
    </>
  );
}
