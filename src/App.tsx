import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import data from './configdata'
import { AutoComplete, Input } from 'antd'
import { open } from '@tauri-apps/api/shell';

function formatData(data) {
  return data.reduce((pre, val) => {

    if(val.type === 'folder' && Array.isArray(val.children)) {
      return [...pre, ...formatData(val.children)]
    }else if(val.type === 'url') {
      return [...pre, {
        value: val.name,
        url: val.url
      }]
    }

    return pre
  }, [])
}


console.log(formatData(data.roots.bookmark_bar.children))

const resData = formatData(data.roots.bookmark_bar.children);


function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [value, onChange] = useState("")
  const ref = useRef();
  const [options, setOptions] = useState([]);
  const [update, setUpdate] = useState({})
  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    // setGreetMsg(await invoke("greet", { name }));
  }

  const onSearch = (text) => {

  }

  useEffect(() => {
    if(value === "") {
      setOptions([])
      return
    }
    const ops = resData.filter(item => item.value.toLowerCase().includes(value.toLowerCase()))

    setOptions(ops)
  }, [value])

  useEffect(() => {
    console.log(ref.current);
    const r = document.getElementsByTagName('input')[0];
    ref.current.input.focus = () => {
      console.log(111);
      
      ref.current.input.onblur = () => {
        ref.current.input.onblur = null
        console.log('222', );
        invoke('minimize')
      }
    }

  }, [])

  const onSelect = async (v) => {
    console.log(v)
    onChange("")
    open(v.url)
    await invoke('minimize')
  }

  return (
    <div className="container" >
      <AutoComplete
        key={update}
        value={value}
        onChange={onChange}
        onSelect={(_, v) => onSelect(v)}
        onSearch={(text) => onSearch(text)}
        options={options}
        size="large"
    children={<Input size="large" ref={ref} style={{backgroundColor: '#fff'}} />}
      />
    </div>
  );
}

export default App;
