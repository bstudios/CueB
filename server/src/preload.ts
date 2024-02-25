// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import { ServerAccessData } from "./utils/ServerAccessData";
declare global {
  interface Window {
    electronAPI: {
      onGotServerAccessData: (
        callback: (data: ServerAccessData) => void
      ) => void;
      requestServerAccessData: () => void;
    };
  }
}
contextBridge.exposeInMainWorld("electronAPI", {
  onGotServerAccessData: (callback: (data: ServerAccessData) => void) =>
    ipcRenderer.on("serverAccessData", (_event, value) => callback(value)),
  requestServerAccessData: () => ipcRenderer.send("requestServerAccessData"),
});