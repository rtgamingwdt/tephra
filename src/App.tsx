import { invoke } from "@tauri-apps/api";
import { open } from '@tauri-apps/api/dialog';
import { useEffect, useRef, useState } from "react";
import "./App.css";
import MarkdownRender from "./components/MarkdownRender";
import Tab from "./components/Tab";
import TitleBar from "./components/TitleBar";
import { Config, File } from "./types";

function App() {

  const [currentFile, setCurrentFile] = useState<File>();
  const [openFiles, setOpenFiles] = useState<Map<string, File>>(new Map());
  const editorRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const lineRefs = useRef<HTMLSpanElement[]>([]);

  const save = async () => {
    if (currentFile) {
      console.log(currentFile.content);
      const updatedContent = currentFile.content.join("\n");
      await invoke("save", { filePath: currentFile.path, content: updatedContent });

      setOpenFiles((prevFiles) => {
        const newFiles = new Map(prevFiles);
        newFiles.set(currentFile.path, { ...currentFile, saved: true });
        return newFiles;
      });
    }
  }

  const openFile = async (filePath: string) => {
    if (!openFiles.has(filePath)) {
      const content = await invoke("open_file", { filePath }) as string;

      setOpenFiles((prevFiles) => {
        const newFiles = new Map(prevFiles);
        const parts = filePath.replaceAll('\\', '/').split("/");

        const data = {
          name: parts[parts.length - 1],
          content: content.split('\n'),
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

  useEffect(() => {
    if (focusIndex != null) lineRefs.current[focusIndex]?.focus();
  }, [focusIndex, lineRefs.current])

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
                if (newFiles.size < 1) setCurrentFile(undefined);
                return newFiles;
              });
            }} />)}
          </div>
          <div className="editor">
            <div style={{ height: openFiles.size < 1 ? "100%" : "0%", visibility: openFiles.size < 1 ? "visible" : "hidden" }} className="no-file-open">
              <h1>No File is Open</h1>
              <button onClick={async () => {
                const selectedFile = await open({ multiple: false, filters: [{ "extensions": ["txt", "md"], name: "" }] });
                if (selectedFile) openFile(selectedFile as string)
              }}>Select a File</button>
            </div>
            <div ref={editorRef} style={{ height: openFiles.size > 0 ? "100%" : "0%" }} className="editor-content">
              {currentFile && (
                currentFile.content.map((line, index) => {
                  return <MarkdownRender key={index} onInput={(event) => setCurrentFile((prev) => {
                    if (prev) {
                      const newContent = [...prev.content];
                      newContent[index] = (event.target as HTMLSpanElement).textContent || "";
                      return { ...prev, content: newContent };
                    }
                  })} onFocus={() => setFocusIndex(index)} onBlur={() => setFocusIndex(null)} focused={focusIndex == index} onKeyDown={(event) => {
                    switch (event.key) {
                      case "Backspace":
                        if ((event.target as HTMLSpanElement).innerText == '' && index > 0) {
                          setCurrentFile((prev) => {
                            if (prev) {
                              const newContent = [...prev.content];
                              newContent.splice(index, 1);
                              lineRefs.current.splice(index, 1);
                              return { ...prev, content: newContent }
                            }
                          });

                          setFocusIndex(index - 1);
                        }
                        break;
                      case "Enter":
                        event.preventDefault();
                        setCurrentFile((prev) => {
                          if (prev) {
                            const newContent = [...prev.content];
                            newContent.splice(index + 1, 0, "");
                            setFocusIndex(index + 1);
                            return { ...prev, content: newContent };
                          }
                        })
                        break;
                      case "ArrowDown":
                        setFocusIndex(index + 1);
                        break;
                      case "ArrowUp":
                        setFocusIndex(index - 1);
                        break;
                    }
                  }} {...lineRefs.current && { ref: (el: HTMLSpanElement) => lineRefs.current[index] = el }}>{line}</MarkdownRender>
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
