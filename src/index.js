import fs from "fs";
import sha1 from "sha1";
import FormData from "form-data";

import api from "./services/api";
const filepath = "tmp/answer.json";

(async () => {
  // busca o desafio
  const { data } = await api.get(
    "/generate-data?token=dcef6f70ec645bf737fb83e8bb32b26dd48bd383"
  );

  // salva na pasta temporaria
  fs.writeFileSync(filepath, JSON.stringify(data));

  // cria um array com os códigos ASCII de cada letra do campo cifrado do arquivo json
  const ascii = await data.cifrado
    .split("")
    .map(character => character.charCodeAt(0));

  // subtraio do código ascii as casas decimais
  const ascDecifrado = ascii.map(code => {
    // espaco, virgula e ponto
    if (code === 32 || code === 44 || code === 46) return code;

    const newValueCode = code - data.numero_casas;

    if (newValueCode < 97) return 122 - (96 - newValueCode);

    return newValueCode;
  });

  // converto o ascii decifrado em frase
  data.decifrado = ascDecifrado.reduce(
    (frase, asc) => frase + String.fromCharCode(asc),
    ""
  );

  // gero assinatura sha1
  data.resumo_criptografico = sha1(data.decifrado);

  // atualizao arquivo salvo
  fs.writeFileSync(filepath, JSON.stringify(data));

  // criar o post do arquivo para a entrega do teste
  const formData = new FormData();
  formData.append("answer", fs.createReadStream(filepath), "answer.json");

  const response = await api.post(
    "/submit-solution?token=dcef6f70ec645bf737fb83e8bb32b26dd48bd383",
    formData,
    {
      headers: formData.getHeaders()
    }
  );

  // exibido retorno no console
  console.log(response.data);
})();
