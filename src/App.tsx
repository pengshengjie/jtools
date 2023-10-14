import { ReactNode, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { AutoComplete, Input, InputRef } from "antd";
import { open } from "@tauri-apps/api/shell";
import goole from "./assets/goole.svg";
const OperaType = {
  URL_TYPE: "URL_TYPE",
  TRANSFORM_ENGLISH: "TRANSFORM_ENGLISH",
  TRANSFORM_CHINESE: "TRANSFORM_CHINESE",
};

type MarkBook = {
  date_added: string;
  date_last_used: string;
  date_modified: string;
  guid: string;
  id: string;
  name: string;
  type: "folder" | "url";
  children?: MarkBook[]
  url: string;
};

type OptionType = {
  type: keyof typeof OperaType;
  value: string;
  keyword?: string;
  label?: ReactNode;
  url?: string;
  path?: string;
}

function formatData(data: MarkBook[], path = ""): OptionType[] {
  return data.reduce<OptionType[]>((pre: OptionType[], val: MarkBook) => {
    if (val.type === "folder" && Array.isArray(val.children)) {
      return [...pre, ...formatData(val.children, path + "/" + val.name)];
    } else if (val.type === "url") {
      return [
        ...pre,
        {
          type: OperaType.URL_TYPE as keyof typeof OperaType,
          value: val.name,
          url: val.url,
          path: path,
        },
      ];
    }
    return pre;
  }, []);
}

const execOpera = (option: OptionType) => {
  switch (option.type) {
    case OperaType.URL_TYPE:
      open(option.url!);
      break;
    case OperaType.TRANSFORM_ENGLISH:
      open(
        `https://translate.google.com/?hl=zh-CN&sl=zh-CN&tl=en&text=${encodeURIComponent(
          option.keyword!
        )}&op=translate`
      );
      break;
    case OperaType.TRANSFORM_CHINESE:
      open(
        `https://translate.google.com/?sl=en&tl=zh-CN&text=${encodeURIComponent(
          option.keyword!
        )}&op=translate&hl=zh-CN`
      );
      break;

    default:
      break;
  }
};

function App() {
  const [value, onChange] = useState<string>("");
  const ref = useRef<InputRef>(null);
  const [options, setOptions] = useState<OptionType[]>([]);
  const resDataRef = useRef<OptionType[]>([]);

  const renderOptions = (options: OptionType[], value: string) => {
    return options.map((item) => {
      let label;
      switch (item.type) {
        case OperaType.URL_TYPE:
          const keywords = value.trim().startsWith('g ') ? value.trim().slice(2) : value.trim()
          label = (
            <div className="flex">
              <div className="center pr-10">
                <img width={20} height={20} src={goole} alt="google" />
              </div>
              <div className="direction-column">
                <div
                  dangerouslySetInnerHTML={{
                    __html: keywords
                      ? item.value.replace(
                          new RegExp(keywords, "gi"),
                          (a: string) => `<span class="high-light">${a}</span>`
                        )
                      : item.value,
                  }}
                ></div>
                <div className="underline text-10 gray">{item.url}</div>
              </div>
            </div>
          );
          break;
        case OperaType.URL_TYPE:
          break;

        default:
          label = item.value;
          break;
      }

      return {
        ...item,
        label,
      };
    });
  };

  useEffect(() => {
    const trimValue = value.trim().toLowerCase();
    if (trimValue === "") {
      // setOptions([]);
      // return;
    } else if (trimValue.startsWith("f ") || trimValue.startsWith("fc ")) {
      setOptions([
        {
          type: OperaType.TRANSFORM_CHINESE as keyof typeof OperaType,
          value: "谷歌翻译 翻译中文",
          keyword: value.trim().slice(2),
        },
      ]);
      return;
    } else if (trimValue.startsWith("fe ")) {
      setOptions([
        {
          type: OperaType.TRANSFORM_ENGLISH  as keyof typeof OperaType,
          value: "谷歌翻译 翻译英语",
          keyword: value.trim().slice(2),
        },
      ]);
      return;
    } else if (trimValue.startsWith("g ")) {
      const ops = resDataRef.current.filter((item) => {
        return (
          item.path!.includes("官方文档") &&
          item.value.toLowerCase().includes(trimValue.slice(2))
        );
      });
      setOptions(ops);
      return;
    }
    const ops = resDataRef.current.filter((item) =>
      item.value.toLowerCase().includes(trimValue)
    );

    setOptions(ops);
  }, [value]);

  useEffect(() => {
    ref.current!.input!.focus = () => {
      ref.current!.input!.onblur = () => {
        ref.current!.input!.onblur = null;
        invoke("minimize");
        onChange("");
      };
    };

    window.__resetInputValue = () => {
      onChange("");
    };
    (async () => {
      const s = (await invoke("get_apps")) as string;
      console.log(s.split(" ").filter(Boolean));
      document.body.appendChild(
        document.createTextNode(await invoke("get_apps"))
      );
      // resDataRef.current = formatData(data.roots.bookmark_bar.children)
      const bookmark = await invoke("get_bookmark");
      const bookmarkObj = JSON.parse(bookmark as string);

      resDataRef.current = formatData(bookmarkObj.roots.bookmark_bar.children as MarkBook[]);
    })();
  }, []);

  const onSelect = async (v) => {
    onChange("");
    execOpera(v);
    await invoke("minimize");
  };

  const onSearch = () => {};

  const onEnter = (e) => {
    if (e.key === "Enter") {
      if (options[0]) {
      }
    }
  };

  return (
    <div className="container">
      <AutoComplete
        open={true}
        onKeyDown={onEnter}
        value={value}
        onChange={(v) => onChange(v)}
        onSelect={(_, v) => onSelect(v)}
        options={renderOptions(options, value)}
        onSearch={onSearch}
        size="large"
        children={
          <Input
            onKeyDown={onEnter}
            size="large"
            ref={ref}
            style={{ backgroundColor: "#fff" }}
          />
        }
      />
    </div>
  );
}

export default App;
