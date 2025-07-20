const axios = require("axios");
const cheerio = require("cheerio");
let legoUrl = "https://www.lego.com/es-es/service/building-instructions/";
let codeUrl =
  "https://www.lego.com/cdn/product-assets/element.img.photoreal.192x192/code.jpg";

const scrapping = async (legoData) => {
  try {
    const legoSet = legoData.map((lego) => lego.lego);
    const codeSet = legoData.map((lego) => lego.pieza);

    const conteoCode = contarRepeticiones(codeSet);
    const conteoLego = contarRepeticiones(legoSet);

    if (
      Object.keys(conteoCode).length === 1 &&
      Object.keys(conteoLego).length > 1
    ) {
      const codeImages = codeUrl.replace("code", Object.keys(conteoCode));

      const legoUrls = [];
      const legoImages = [];

      for (let i = 0; i < Object.keys(conteoLego).length; i++) {
        legoUrls.push(legoUrl + Object.keys(conteoLego)[i]);
      }

      for (let i = 0; i < legoUrls.length; i++) {
        const { data } = await axios.get(legoUrls[i]);
        const $ = cheerio.load(data);

        const images = $('source[type="image/webp"]')[0]
          .attribs["srcset"].split(",")[0]
          .split(" ")[0];

        legoImages.push(images);
      }

      return { codeImages, legoImages };
    } else if (
      Object.keys(conteoLego).length === 1 &&
      Object.keys(conteoCode).length > 1
    ) {
      legoUrl = legoUrl + Object.keys(conteoLego)[0];

      const { data } = await axios.get(legoUrl);
      const $ = cheerio.load(data);

      const images = $('source[type="image/webp"]')[0]
        .attribs["srcset"].split(",")[0]
        .split(" ")[0];

      const legoImage = images;

      let codeImages = [];

      for (let i = 0; i < Object.keys(conteoCode).length; i++) {
        codeImages.push(codeUrl.replace("code", Object.keys(conteoCode)[i]));
      }

      return { legoImage, codeImages };
    } else if (
      (Object.keys(conteoCode).length === 1 &&
        Object.keys(conteoLego).length) === 1
    ) {
      codeUrl = codeUrl.replace("code", Object.keys(conteoCode));
      legoUrl = legoUrl + Object.keys(conteoLego)[0];

      const { data } = await axios.get(legoUrl);
      const $ = cheerio.load(data);

      const images = $('source[type="image/webp"]')[0]
        .attribs["srcset"].split(",")[0]
        .split(" ")[0];

      const legoImage = images;

      return { codeUrl, legoImage };
    }
  } catch (error) {
    console.error("Error in scrapping:", error);
  }
};

const contarRepeticiones = (array) => {
  return array.reduce((contador, item) => {
    contador[item] = (contador[item] || 0) + 1;
    return contador;
  }, {});
};

module.exports = { scrapping };
