const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get("/", async (req, res) => {
    const { lat, lng } = req.query;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    console.error("No results found:", data);
    return res.json({ locationName: "Unknown Location" });
  }

  // Loop through all results to find the best match
  let city = null;
  let country = null;

  for (const result of data.results) {
    const components = result.address_components;

    if (!city) {
      const cityComp = components.find(comp =>
        comp.types.includes("locality") ||
        comp.types.includes("administrative_area_level_1") ||
        comp.types.includes("administrative_area_level_2")
      );
      if (cityComp) city = cityComp.long_name;
    }

    if (!country) {
      const countryComp = components.find(comp => comp.types.includes("country"));
      if (countryComp) country = countryComp.long_name;
    }

    if (city && country) break;
  }

  // Fallback to plus_code if no city/country found
  if (!city && !country && data.plus_code?.compound_code) {
    const compound = data.plus_code.compound_code;
    const fallbackName = compound.split(" ").slice(1).join(" ");
    console.log(`Fallback using plus_code: ${fallbackName}`);
    return res.json({ locationName: fallbackName });
  }

  let locationName = "Unknown Location";
  if (city && country) locationName = `${city}, ${country}`;
  else if (country) locationName = country;

  console.log(`Reverse-geocoded: ${locationName}`);
  res.json({ locationName });
});
  
module.exports = router;
  