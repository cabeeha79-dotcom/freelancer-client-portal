import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

// TanStack Start's own default client entry, with one addition: onRecoverableError.
//
// WHY IT EXISTS. Hydration mismatch is the largest defect class this platform
// ships, and a static scan can only find causes somebody already wrote down.
// React knows about every one of them, so ask React instead of keeping a list.
// In dev React already logs the mismatch with a diff and the beacon forwards it;
// a PRODUCTION build logs `Minified React error #418` with no diff and no
// component name, which was 41 of 114 hydration events on the week to
// 2026-09-18 - reported, and undiagnosable. This hook receives the real Error
// plus `componentStack` in both builds.
//
// It reports through console.error because that is already the wire: the sandbox
// beacon forwards console.error to /internal/app-errors.

// Attributes the app itself puts on <html>/<body>. Anything else up there came
// from outside the app.
//
// THIS LIST IS INVERTED ON PURPOSE. About a third of reported hydration
// mismatches are a browser extension rewriting the DOM before React hydrates -
// a translator, a password manager, a grammar checker. Those are not app bugs,
// no app code can prevent them, and React will not fix them
// (facebook/react#32557, closed not_planned) - yet they were counted and triaged
// as ours.
//
// The server-side filter that catches them names each extension's attribute
// (`data-immersive-translate`, `data-gramm`, ...), which cannot scale: there are
// thousands of extensions, Immersive Translate alone also writes `data-imt-p`
// and slipped through entirely, and React's diff - where that evidence lives -
// sits past the 2048-char report cap 43% of the time.
//
// So enumerate what OUR document produces, which is a closed set we control, and
// treat anything else on the root as foreign. That recognises extensions nobody
// has heard of, needs no upkeep, and puts the verdict at the FRONT of the
// message where truncation cannot reach it.
const OWN_ROOT_ATTRS = new Set([
  "class",
  "style",
  "lang",
  "dir",
  "id",
  "translate",
  "data-theme",
  "data-scroll-locked",
  "data-vaul-drawer-wrapper",
]);

function foreignRootAttrs(): string[] {
  const out: string[] = [];
  try {
    for (const el of [document.documentElement, document.body]) {
      if (!el) continue;
      for (const name of el.getAttributeNames()) {
        if (!OWN_ROOT_ATTRS.has(name)) out.push(name);
      }
    }
  } catch {
    // A document we cannot read tells us nothing, so say nothing.
  }
  return out;
}

// Mutations landing between this module evaluating and hydration starting.
//
// The attribute scan above misses an extension that acts LATE - a translator the
// viewer triggers by hand after load. This catches that case. Counted, never
// inspected: the content of someone else's DOM edit is not ours to log.
let preHydrationMutations = 0;
let stopObserving = () => {};
try {
  const observer = new MutationObserver((records) => {
    preHydrationMutations += records.length;
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });
  stopObserving = () => {
    try {
      preHydrationMutations += observer.takeRecords().length;
      observer.disconnect();
    } catch {
      /* already disconnected */
    }
  };
} catch {
  /* no MutationObserver in this browser - the attribute scan still works */
}

startTransition(() => {
  // Flush synchronously: everything recorded up to this line predates hydration.
  // Past it React is the one mutating the DOM, and its edits are not evidence.
  stopObserving();

  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
    {
      onRecoverableError: (error, errorInfo) => {
        const message = error instanceof Error ? error.message : String(error);
        const stack =
          errorInfo?.componentStack ||
          (error instanceof Error ? error.stack : undefined) ||
          "(no stack)";
        const foreign = foreignRootAttrs();
        // Leads the message, so the report cap cannot truncate the verdict away.
        const origin =
          foreign.length > 0 || preHydrationMutations > 0
            ? `env:foreign-dom(attrs=${foreign.slice(0, 6).join(",") || "none"};mutations=${preHydrationMutations})`
            : "env:clean";
        console.error("[recoverable]", origin, message, "\n", stack);
      },
    },
  );
});
