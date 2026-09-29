import { BatteryFull, Signal, Wifi } from "lucide-react";
import "./device-preview.css";
import { STANDALONE } from "./mode";

/** Presentation frame only. The iframe runs the actual app and its normal API. */
export function DevicePreview() {
  const screenOnly = new URLSearchParams(window.location.search).has("screen-only");
  return (
    <div className={"device-preview" + (screenOnly ? " screen-only" : "")}>
      <div className="device-stage">
        <div className="device-body">
          <div className="device-screen">
            <div className="device-status" aria-hidden="true">
              <span>9:41</span>
              {!screenOnly && <span className="device-camera" />}
              <div><Signal size={15} /><Wifi size={15} /><BatteryFull size={21} /></div>
            </div>
            <iframe title="FieldSeal interactive mobile app" src={STANDALONE ? undefined : "/"} srcDoc={STANDALONE ? `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${document.querySelector("style")?.textContent ?? ""}</style></head><body><div id="root"></div><script>${document.getElementById("app-bundle")?.textContent ?? ""}</script></body></html>` : undefined} />
            <div className="device-gesture" aria-hidden="true"><span /></div>
          </div>
        </div>
      </div>
      {!screenOnly && <>
        <p className="device-caption">{STANDALONE ? "Standalone demo · Saved in this browser · No server" : "Interactive web prototype · Illustrative device frame"}</p>
        <a className="device-exit" href={STANDALONE ? "?workspace" : "/"}>Open full workspace</a>
      </>}
    </div>
  );
}
