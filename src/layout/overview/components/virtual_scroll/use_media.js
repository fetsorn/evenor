import { useEffect, useState } from "react";

export const useMedia = (query) => {
  const [state, setState] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    let mounted = true;

    const mediaQueryList = window.matchMedia(query);

    const onChange = () => {
      if (!mounted) {
        return;
      }

      setState(!!mediaQueryList.matches);
    };

    mediaQueryList.addListener(onChange);

    setState(mediaQueryList.matches);

    return () => {
      mounted = false;

      mediaQueryList.removeListener(onChange);
    };
  }, [query]);

  return state;
};
