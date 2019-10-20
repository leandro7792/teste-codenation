import fs from "fs";
import sha1 from "sha1";
import FormData from "form-data";

import api from "./services/api";

const filepath = "tmp/answer.json";

(async () => {
  const { data } = await api.get(
    "/generate-data?token=dcef6f70ec645bf737fb83e8bb32b26dd48bd383"
  );

  fs.writeFileSync(filepath, JSON.stringify(data));

  const ascii = await data.cifrado
    .split("")
    .map(character => character.charCodeAt(0));

  const ascDecifrado = ascii.map(code => {
    if (code === 32 || code === 44 || code === 46) return code;

    const newValueCode = code - data.numero_casas;

    if (newValueCode < 97) return 122 - (96 - newValueCode);

    return newValueCode;
  });

  data.decifrado = ascDecifrado.reduce(
    (frase, asc) => frase + String.fromCharCode(asc),
    ""
  );

  data.resumo_criptografico = sha1(data.decifrado);

  fs.writeFileSync(filepath, JSON.stringify(data));

  fs.createReadStream(filepath);

  const formData = new FormData();
  formData.append("answer", fs.createReadStream(filepath), "answer.json");

  const response = await api.post(
    "/submit-solution?token=dcef6f70ec645bf737fb83e8bb32b26dd48bd383",
    formData,
    {
      headers: formData.getHeaders()
    }
  );

  console.log(response.data);
})();
