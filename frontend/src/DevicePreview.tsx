import { BatteryFull, Signal, Wifi } from "lucide-react";
import "./device-preview.css";

/** Presentation frame only. The iframe runs the actual app and its normal API. */
export function DevicePreview() {
  return (
    <div className="device-preview">
      <div className="device-stage">
        <div className="device-body">
          <div className="device-screen">
            <div className="device-status" aria-hidden="true">
              <span>9:41</span>
              <span className="device-camera" />
              <div><Signal size={15} /><Wifi size={15} /><BatteryFull size={21} /></div>
            </div>
            <iframe title="FieldSeal interactive mobile app" src="/" />
            <div className="device-gesture" aria-hidden="true"><span /></div>
          </div>
        </div>
      </div>
      <p className="device-caption">Interactive web prototype · Illustrative device frame</p>
      <a className="device-exit" href="/">Open full workspace</a>
    </div>
  );
}
