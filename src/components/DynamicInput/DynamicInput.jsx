import React, { useEffect, useState } from "react";
import { KeyOutline, MailOutline, SearchOutline } from "../../assets/icons";

import "./DynamicInput.scss";

const DynamicInput = ({
  id,
  state,
  type = "text",
  placeholder,
  disabled = false,
  noIcon = false,
  label,
  multiline,
  price,
  number,
  max,
  min,
}) => {
  const [placeholderValue, setPlaceholderValue] = useState(placeholder);
  const [iconValue, setIconValue] = useState("");

  const value = state[0];
  const setValue = state[1];

  useEffect(() => {
    const defaultProps = {
      email: () => {
        !placeholder && setPlaceholderValue("Correo electrónico");
        setIconValue(<MailOutline />);
      },
      password: () => {
        !placeholder && setPlaceholderValue("Contraseña");
        setIconValue(<KeyOutline />);
      },
      search: () => {
        !placeholder && setPlaceholderValue("Buscar");
        setIconValue(<SearchOutline />);
      },
    };

    if (
      type !== "text" &&
      type !== "date" &&
      type !== "number" &&
      type !== "tel"
    ) {
      defaultProps[type]();
    }
  }, [type]); //eslint-disable-line

  return (
    <div
      className={`dynamic-input ${noIcon ? "no-icon" : ""} ${
        price ? "price" : ""
      }`}
    >
      {label && <label htmlFor={id}>{label}</label>}
      {!noIcon && iconValue}
      {multiline ? (
        <textarea
          id={id}
          name={id}
          autoComplete={label ? "off" : "on"}
          value={value[id]}
          placeholder={placeholder ? placeholder : placeholderValue}
          disabled={disabled}
          {...(max && {
            maxLength: max,
          })}
          onChange={(e) => {
            setValue({ ...value, [id]: e.target.value });
          }}
        />
      ) : (
        <input
          id={id}
          name={id}
          autoComplete={label ? "off" : "on"}
          type={type}
          value={value[id]}
          {...(max && {
            maxLength: max,
          })}
          {...(type === "date" &&
            (min
              ? {
                  min: new Date().toISOString().slice(0, 10),
                }
              : {
                  max: new Date().toISOString().slice(0, 10),
                }))}
          placeholder={placeholder ? placeholder : placeholderValue}
          {...((price || number) && { pattern: "[0-9]*", min: 0 })}
          onChange={(e) => {
            setValue((c) => {
              if (price) {
                if (e.target.validity.valid) {
                  return { ...value, [id]: e.target.value };
                } else {
                  return c;
                }
              } else {
                return { ...value, [id]: e.target.value };
              }
            });
          }}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default DynamicInput;