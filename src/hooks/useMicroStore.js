import { useEffect } from "react";

export const useMicroStore = ({ name, id, microStore, store }) => {
  useEffect(() => {
    if (!id || microStore?.has?.(id)) {
      return;
    }
    microStore?.add?.(id, store, name);
    return () => {
      microStore?.removeAll?.(id);
    };
  }, [microStore, store, id]);
};
