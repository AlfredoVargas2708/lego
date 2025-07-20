const axios = require("axios");
const cheerio = require("cheerio");

// Configuración en un objeto para mejor organización
const config = {
  legoBaseUrl: "https://www.lego.com/service/building-instructions/",
  codeImageBaseUrl:
    "https://www.lego.com/cdn/product-assets/element.img.photoreal.192x192/",
  notFoundImage:
    "https://www.lego.com/cdn/cs/set/assets/blt25ecf37f37849299/one_missing_brick.webp?format=webply&fit=bounds&quality=75&width=500&height=500&dpr=1",
  notFoundLego: "https://www.lego.com/service/building-instructions/1",
};

// Función helper para contar repeticiones
const countOccurrences = (array) => {
  return array.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
};

// Función helper para obtener imagen LEGO
const fetchLegoImage = async (legoId) => {
  try {
    const url = legoId ? `${config.legoBaseUrl}${legoId}` : config.notFoundLego;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const imageElement = $('source[type="image/webp"]').first();
    if (!imageElement.length) return null;

    return imageElement.attr("srcset").split(",")[0].split(" ")[0];
  } catch (error) {
    console.error(`Error fetching LEGO image for ${legoId}:`, error.message);
    return null;
  }
};

// Función principal refactorizada
const scrapeLegoData = async (legoData) => {
  try {
    const legoSet = legoData.map((item) => item.lego);
    const codeSet = legoData.map((item) => item.pieza);

    const codeCount = countOccurrences(codeSet);
    const legoCount = countOccurrences(legoSet);

    const uniqueCodes = Object.keys(codeCount);
    const uniqueLegos = Object.keys(legoCount);

    const hasSingleCode = uniqueCodes.length === 1;
    const hasSingleLego = uniqueLegos.length === 1;
    const hasMultipleCodes = uniqueCodes.length > 1;
    const hasMultipleLegos = uniqueLegos.length > 1;

    // Procesamiento de imágenes de códigos
    const processCodeImages = () => {
      return uniqueCodes.map((code) => ({
        img: code
          ? `${config.codeImageBaseUrl}${code}.jpg`
          : config.notFoundImage,
        piece: code || "unknown",
      }));
    };

    // Procesamiento de imágenes LEGO
    const processLegoImages = async () => {
      const results = [];
      for (const legoId of uniqueLegos) {
        const imageUrl = legoId
          ? await fetchLegoImage(legoId)
          : config.notFoundImage;
        results.push({
          img: imageUrl || config.notFoundImage,
          lego: legoId || "unknown",
        });
      }
      return results;
    };

    // Lógica principal más clara
    if (hasSingleCode && hasSingleLego) {
      const codeImage = uniqueCodes[0]
        ? `${config.codeImageBaseUrl}${uniqueCodes[0]}.jpg`
        : config.notFoundImage;

      const legoImage = await fetchLegoImage(uniqueLegos[0]);

      return {
        codeImage: codeImage,
        legoImage: legoImage || config.notFoundImage,
      };
    } else if (hasSingleCode && hasMultipleLegos) {
      return {
        codeImage: uniqueCodes[0]
          ? `${config.codeImageBaseUrl}${uniqueCodes[0]}.jpg`
          : config.notFoundImage,
        legoImages: await processLegoImages(),
      };
    } else if (hasMultipleCodes && hasSingleLego) {
      return {
        legoImage:
          (await fetchLegoImage(uniqueLegos[0])) || config.notFoundImage,
        codeImages: processCodeImages(),
      };
    } else if (hasMultipleCodes && hasMultipleLegos) {
      return {
        codeImages: processCodeImages(),
        legoImages: await processLegoImages(),
      };
    }
  } catch (error) {
    console.error("Error in scrapeLegoData:", error);
    throw error; // Re-lanzar el error para manejo superior
  }
};

module.exports = { scrapeLegoData };
