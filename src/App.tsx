import { invoke } from "@tauri-apps/api";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import Tab from "./components/Tab";
import TitleBar from "./components/TitleBar";
import { Config, File } from "./types";

function App() {

  const [currentFile, setCurrentFile] = useState<File>();
  const [openFiles, setOpenFiles] = useState<Map<string, File>>(new Map());
  const editorRef = useRef<HTMLDivElement>(null);

  const save = async () => {
    if (currentFile) {
      await invoke("save", { filePath: currentFile.path, content: currentFile.content });

      setOpenFiles((prevFiles) => {
        const newFiles = new Map(prevFiles);
        newFiles.set(currentFile.path, { ...currentFile, saved: true });
        return newFiles;
      });
    }
  }

  const openFile = async (filePath: string) => {
    if (editorRef.current && !openFiles.has(filePath)) {
      editorRef.current.innerText = await invoke("open_file", { filePath });
      setOpenFiles((prevFiles) => {
        const newFiles = new Map(prevFiles);
        const parts = filePath.split("/");

        const data = {
          name: parts[parts.length - 1],
          content: editorRef.current!.innerText,
          saved: true,
          path: filePath
        }

        newFiles.set(filePath, data);
        setCurrentFile(data);
        return newFiles;
      });
    }
  }

  useEffect(() => {

    const noContextMenu = (event: Event) => event.preventDefault();

    document.addEventListener("contextmenu", noContextMenu);

    invoke<string>("config").then((config: string) => {
      const parsed = JSON.parse(config) as Config;
      openFile(parsed.last_open);
    })

    return () => {
      document.removeEventListener("contextmenu", noContextMenu);
    }
  }, []);

  useEffect(() => {

    if (editorRef.current && currentFile) editorRef.current.innerText = currentFile.content;

    const handleKeybinds = async (event: KeyboardEvent) => {
      switch (true) {
        case event.ctrlKey && event.key == "s":
          save();
          break;
      }
    }

    document.addEventListener("keydown", handleKeybinds);

    return () => document.removeEventListener("keydown", handleKeybinds);
  }, [currentFile])

  return (
    <>
      <TitleBar />
      <div className="app">
        <div className="sidebar">

        </div>
        <div className="file-drawer">

        </div>
        <div className="file-drawer-slider">

        </div>
        <main className="view">
          <div className="tabs">
            {Array.from(openFiles).map((file) => <Tab saved={file[1].saved} key={file[0]} active={file[0] == currentFile?.path} name={file[1].name} close={() => {
              setOpenFiles((prevFiles) => {
                const newFiles = new Map(prevFiles);
                newFiles.delete(file[0]);
                return newFiles;
              })
            }} />)}
          </div>
          <div className="editor">
            <div ref={editorRef} contentEditable role="textarea" onInput={(event) => {
              if (currentFile) {
                const newContent = (event.target as HTMLDivElement).innerText;
                setOpenFiles((prevFiles) => {
                  const newFiles = new Map(prevFiles);
                  newFiles.set(currentFile.path, {
                    ...currentFile,
                    content: newContent,
                    saved: currentFile.content == prevFiles.get(currentFile.path)?.content
                  });
                  return newFiles;
                });
              }
            }} />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
