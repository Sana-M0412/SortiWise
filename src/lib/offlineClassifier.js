const OFFLINE_DATABASE = [
  {
    keywords: ['plastic bottle', 'water bottle', 'coke bottle', 'soda bottle', 'pet bottle', 'plastic'],
    itemName: 'Plastic PET Bottle',
    category: 'recyclable',
    confidence: 0.90,
    carbonFootprintKg: 0.08,
    disposalInstructions: ['Rinse out any remaining liquid.', 'Crush the bottle to save space.', 'Screw the cap back on.', 'Place in the blue recycling bin.'],
    reuseIdeas: ['Upcycle into a self-watering planter.', 'Use as a funnel for kitchen or garage tasks.', 'Create a bird feeder.'],
    alternatives: ['Use a reusable stainless steel water bottle.', 'Choose glass containers that are highly reusable.'],
    environmentalReasoning: 'PET plastic is highly recyclable, but virgin plastic production consumes petroleum. Recycling saves 70% of energy costs.',
    sustainabilityScore: 75
  },
  {
    keywords: ['paper', 'cardboard', 'box', 'newspaper', 'magazine', 'carton'],
    itemName: 'Cardboard / Paper Packaging',
    category: 'recyclable',
    confidence: 0.92,
    carbonFootprintKg: 0.05,
    disposalInstructions: ['Flatten the boxes to save container space.', 'Ensure the paper is dry and free of food grease.', 'Place in the paper recycling bin.'],
    reuseIdeas: ['Use cardboard sheets as a weed barrier in gardens.', 'Store files or use for moving boxes.', 'Upcycle for kids DIY craft projects.'],
    alternatives: ['Switch to digital reading/billing.', 'Use reusable bags or cloth wraps.'],
    environmentalReasoning: 'Paper fibers can be recycled 5-7 times. Flattening boxes ensures efficient collection routing, decreasing carbon footprints.',
    sustainabilityScore: 85
  },
  {
    keywords: ['can', 'aluminum', 'soda can', 'tin', 'metal', 'steel', 'foil'],
    itemName: 'Aluminum / Metal Can',
    category: 'recyclable',
    confidence: 0.95,
    carbonFootprintKg: 0.12,
    disposalInstructions: ['Rinse out any food or liquid residue.', 'Place inside the metal recycling bin.'],
    reuseIdeas: ['Use clean cans as pencil holders or desk organizers.', 'Create herb planters for your window sill.'],
    alternatives: ['Buy in bulk to reduce total packaging count.', 'Use reusable beverage containers.'],
    environmentalReasoning: 'Recycling aluminum saves 95% of the energy needed to make new aluminum from raw bauxite ore. It has an infinite recycling lifecycle.',
    sustainabilityScore: 90
  },
  {
    keywords: ['glass', 'jar', 'bottle glass', 'wine glass', 'beer glass'],
    itemName: 'Glass Jar / Bottle',
    category: 'recyclable',
    confidence: 0.94,
    carbonFootprintKg: 0.15,
    disposalInstructions: ['Rinse and remove metal lids (recycle lids separately).', 'Ensure the glass is not broken.', 'Place in the glass recycling bin.'],
    reuseIdeas: ['Wash and reuse for bulk food storage (spices, grains).', 'Create homemade candle holders or drinking glasses.'],
    alternatives: ['Choose reusable glass containers over single-use items.'],
    environmentalReasoning: 'Glass is 100% recyclable and can be recycled endlessly without loss in quality. Reusing jars directly is even more eco-friendly.',
    sustainabilityScore: 95
  },
  {
    keywords: ['apple', 'banana', 'peel', 'food', 'vegetable', 'fruit', 'scraps', 'coffee', 'tea', 'bread', 'organic'],
    itemName: 'Organic Food Scraps',
    category: 'compostable',
    confidence: 0.88,
    carbonFootprintKg: 0.02,
    disposalInstructions: ['Separate from plastics, stickers, and rubber bands.', 'Deposit in your home compost pile or green organic waste bin.'],
    reuseIdeas: ['Use vegetable scraps to make homemade stock.', 'Use banana peels to polish houseplants or fertilize soil.'],
    alternatives: ['Practice portion control to avoid food waste.', 'Plan meals in advance.'],
    environmentalReasoning: 'Food waste in landfills decays anaerobically, generating methane (a potent greenhouse gas). Composting turns waste into rich soil.',
    sustainabilityScore: 98
  },
  {
    keywords: ['battery', 'batteries', 'alkaline', 'cell', 'lithium'],
    itemName: 'Household Battery',
    category: 'hazardous',
    confidence: 0.95,
    carbonFootprintKg: 0.25,
    disposalInstructions: ['Do NOT throw in trash (risk of fire and chemical leaks).', 'Tape the terminals of lithium batteries.', 'Take to a designated hazardous waste drop-off or e-waste recycling center.'],
    reuseIdeas: ['No reuse options for depleted batteries (safety hazard).'],
    alternatives: ['Switch to high-quality rechargeable batteries (NiMH).', 'Use corded or solar-powered devices.'],
    environmentalReasoning: 'Batteries contain heavy metals like lead, mercury, and lithium that contaminate soil and water supplies if landfilled.',
    sustainabilityScore: 10
  },
  {
    keywords: ['bulb', 'light bulb', 'cfl', 'led', 'tube light'],
    itemName: 'Fluorescent / LED Light Bulb',
    category: 'hazardous',
    confidence: 0.91,
    carbonFootprintKg: 0.20,
    disposalInstructions: ['Wrap carefully to prevent breakage.', 'Deliver to a local e-waste or hardware store hazardous drop-off.'],
    reuseIdeas: ['Burned out bulbs should not be reused due to heavy metal coatings.'],
    alternatives: ['Use energy-efficient, long-lasting LED bulbs.', 'Maximize natural daylight.'],
    environmentalReasoning: 'CFL bulbs contain trace amounts of mercury gas, requiring special handling to protect workers and groundwater.',
    sustainabilityScore: 35
  },
  {
    keywords: ['phone', 'charger', 'laptop', 'cable', 'wire', 'keyboard', 'mouse', 'battery computer', 'electronic', 'remote'],
    itemName: 'Electronic Waste (E-Waste)',
    category: 'e-waste',
    confidence: 0.93,
    carbonFootprintKg: 1.5,
    disposalInstructions: ['Back up and wipe personal data.', 'Deliver to an authorized e-waste recycler or retail trade-in program.', 'Do NOT discard in garbage.'],
    reuseIdeas: ['Donate working electronics to local community centers or schools.', 'Sell old parts to repair shops.'],
    alternatives: ['Repair devices rather than upgrading.', 'Buy certified refurbished electronics.'],
    environmentalReasoning: 'E-waste represents 2% of landfill solid waste but accounts for 70% of toxic heavy metals, causing major bio-accumulation hazards.',
    sustainabilityScore: 40
  },
  {
    keywords: ['chip packet', 'wrapper', 'plastic bag', 'snack bag', 'packaging foil', 'styrofoam', 'diaper', 'mirror', 'soiled'],
    itemName: 'Non-Recyclable Mixed Waste',
    category: 'landfill',
    confidence: 0.85,
    carbonFootprintKg: 0.18,
    disposalInstructions: ['Place in the standard black landfill bin.', 'Ensure it is tied securely to prevent wind scatter.'],
    reuseIdeas: ['Clean plastic wrappers can be stuffed into plastic bottles to create "ecobricks".'],
    alternatives: ['Buy snacks in bulk sizes to minimize individual wrappers.', 'Select snacks packaged in recyclable paper.'],
    environmentalReasoning: 'Multi-layer plastics and metalized film cannot be separated cost-effectively, ending up in landfill where they degrade into microplastics.',
    sustainabilityScore: 15
  }
];

const DEFAULT_FALLBACK = {
  itemName: 'Unidentified Waste Item',
  category: 'landfill',
  confidence: 0.50,
  carbonFootprintKg: 0.10,
  disposalInstructions: ['Dispose in the regular trash bin.', 'When in doubt, land-fill to prevent recycling bin contamination.'],
  reuseIdeas: ['Consider if the item can serve as a storage container or crafting scrap.'],
  alternatives: ['Look for biodegradable or recyclable packing choices next time.'],
  environmentalReasoning: 'Unidentified materials are placed in landfills to prevent contamination of single-stream recycling channels.',
  sustainabilityScore: 50
};

// Search the offline keywords for a match
export function classifyOffline(textQuery = '', language = 'en') {
  const query = textQuery.toLowerCase().trim();
  if (!query) return DEFAULT_FALLBACK;

  // Try to find matching item in database
  for (const item of OFFLINE_DATABASE) {
    for (const key of item.keywords) {
      if (query.includes(key)) {
        // Return translated version if needed (here we mock/simulate)
        let itemResult = { ...item };
        if (language === 'kn') {
          itemResult.itemName = `ಕನ್ನಡ: ${item.itemName}`;
          itemResult.environmentalReasoning = `ಕನ್ನಡ ವಿವರಣೆ: ${item.environmentalReasoning}`;
        } else if (language === 'hi') {
          itemResult.itemName = `हिंदी: ${item.itemName}`;
          itemResult.environmentalReasoning = `हिंदी विवरण: ${item.environmentalReasoning}`;
        }
        return itemResult;
      }
    }
  }

  // Fallback to basic rule guessing based on single words
  if (query.includes('organic') || query.includes('peel') || query.includes('scrap') || query.includes('food')) {
    return OFFLINE_DATABASE[4]; // Food Scraps
  }
  if (query.includes('bottle') || query.includes('cup') || query.includes('box') || query.includes('container') || query.includes('paper')) {
    return OFFLINE_DATABASE[0]; // Plastic/Paper Bottle
  }
  if (query.includes('electronic') || query.includes('wire') || query.includes('cable') || query.includes('computer')) {
    return OFFLINE_DATABASE[7]; // E-waste
  }

  return DEFAULT_FALLBACK;
}
