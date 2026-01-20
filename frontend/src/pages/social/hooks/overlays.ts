import { useEffect } from "react";

type SocialOverlayState = {
  groupEncourageOpen: boolean;
  groupDetailOpen: boolean;
  groupPanelOpen: boolean;
  addOpen: boolean;
};

export function useSocialOverlayLock({
  groupEncourageOpen,
  groupDetailOpen,
  groupPanelOpen,
  addOpen
}: SocialOverlayState) {
  useEffect(() => {
    const shouldLock = groupEncourageOpen || groupDetailOpen || groupPanelOpen || addOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    document.body.classList.toggle("group-encourage-open", groupEncourageOpen);
    document.body.classList.toggle("group-detail-open", groupDetailOpen);
    document.body.classList.toggle("group-panel-open", groupPanelOpen);
    document.documentElement.classList.toggle("group-detail-open", groupDetailOpen);
    document.documentElement.classList.toggle("group-panel-open", groupPanelOpen);
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("group-encourage-open");
      document.body.classList.remove("group-detail-open");
      document.body.classList.remove("group-panel-open");
      document.documentElement.classList.remove("group-detail-open");
      document.documentElement.classList.remove("group-panel-open");
    };
  }, [groupEncourageOpen, groupDetailOpen, groupPanelOpen, addOpen]);
}
