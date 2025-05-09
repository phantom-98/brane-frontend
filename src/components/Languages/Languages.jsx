import "./Languages.scss";
import {
  Globe,
  GlobeWhite,
  US,
  ES,
} from "../../assets/icons";
import { useContext } from "react";
import { DictionaryContext } from "../../contexts/DictionaryContext";

const Languages = ({border = true, margin = true, mode="dark"}) => {
  const { toggleLanguage, language } =
    useContext(DictionaryContext);

  const langList = [
    {
      label: "English",
      flag: <US/>,
      code: "en",
    },
    {
      label: "Español",
      flag: <ES/>,
      code: "es",
    },
  ];

  return (
    <div className={`languages-selector ${!border && "circle"}`} style={{ marginInline: margin ? "" : "0rem"}}>
      <div className="menu">
        {mode === 'dark' ? <Globe/> : <GlobeWhite/>}
      </div>
      <div className="dropdown">
        {langList.map((item, index) => (
          <div
            key={index}
            className="item"
            onClick={() => item.code !== language && toggleLanguage()}
          >
            {item.flag}
            <span className="label">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Languages;