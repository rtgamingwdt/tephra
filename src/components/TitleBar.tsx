import { appWindow } from "@tauri-apps/api/window";
import { FaRegWindowClose, FaRegWindowMaximize, FaRegWindowMinimize } from "react-icons/fa";

export default function TitleBar() {

    return (
        <div data-tauri-drag-region className="titlebar">
            <button className="titlebar" onClick={() => appWindow.minimize()}>
                <FaRegWindowMinimize />
            </button>
            <button className="titlebar" onClick={() => appWindow.toggleMaximize()}>
                <FaRegWindowMaximize />
            </button>
            <button className="titlebar" onClick={() => appWindow.close()}>
                <FaRegWindowClose />
            </button>
        </div>
    )
}