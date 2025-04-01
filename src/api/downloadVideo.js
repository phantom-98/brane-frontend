import { ORIGIN } from "./settings";
import { getFromLocal } from "../helpers/localStorage";

export const downloadVideo = async (id, name) => {
  const USER_JWT = getFromLocal("loggedUser") || null

  const url = `${ORIGIN}api/conferencia/descargar/${id}`;

  const headers = {
    method: "get",
    headers: { Authorization: `Bearer ${USER_JWT}` },
  };

  const response = await fetch(url, headers);
  if (response.ok) {
    const data = await response.blob();
    
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(data);
    a.download = name + '.webm';
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  }
  throw new Error("Error downloading video: " + response.statusText);
};