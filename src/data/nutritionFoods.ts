import type { MacroType } from '../types'

// Page 2 ("Food Lists — What?") of the Nutrition Kinesiology Complete
// Decision Tree (source: Nutrition chart .docx). Each subcategory's `items`
// are the chart's own bullet lines (kept as one tappable line each, matching
// the source — not split into every parenthetical example).
export type FoodListGroupId = MacroType | 'hydration'

export interface FoodSubcategory {
  id: string
  name: string
  items: string[]
}

export interface FoodListGroup {
  id: FoodListGroupId
  label: string
  subcategories: FoodSubcategory[]
}

export const FOOD_LISTS: FoodListGroup[] = [
  {
    id: 'protein',
    label: 'Proteins',
    subcategories: [
      { id: 'poultry', name: 'Poultry', items: ['Chicken', 'Turkey', 'Duck', 'Pheasant', 'Quail'] },
      { id: 'red-meat', name: 'Red Meat', items: ['Beef', 'Lamb', 'Veal', 'Venison', 'Bison'] },
      {
        id: 'fish-seafood',
        name: 'Fish & Seafood',
        items: [
          'White fish (cod, haddock, tilapia)',
          'Fatty fish (salmon, mackerel, sardines, trout)',
          'Tuna',
          'Shellfish (shrimp, prawns, crab, lobster)',
          'Molluscs (mussels, clams, oysters)',
        ],
      },
      { id: 'eggs', name: 'Eggs', items: ['Whole eggs', 'Egg whites', 'Egg yolks'] },
      {
        id: 'dairy',
        name: 'Dairy & Dairy Alternatives',
        items: [
          'Milk (cow, goat, sheep)',
          'Yogurt (plain, Greek)',
          'Kefir',
          'Cottage cheese',
          'Cheese (hard, soft, aged)',
        ],
      },
      {
        id: 'plant-proteins',
        name: 'Plant Proteins',
        items: [
          'Legumes (lentils, chickpeas, beans, peas)',
          'Soy products (tofu, tempeh, edamame, soy milk, miso)',
          'Seitan',
          'Quinoa',
          'Amaranth',
          'Buckwheat',
        ],
      },
      {
        id: 'nuts-seeds-protein',
        name: 'Nuts, Seeds & Seed Proteins',
        items: [
          'Nuts (almonds, walnuts, cashews, hazelnuts, pistachios, pecans, brazil nuts, macadamias)',
          'Seeds (pumpkin, sunflower, sesame, chia, flax, hemp)',
          'Nut butters (natural)',
          'Tahini',
        ],
      },
      { id: 'bones-broth', name: 'Bones & Broth', items: ['Bone broth (chicken, beef, fish)', 'Collagen', 'Gelatin'] },
    ],
  },
  {
    id: 'fats',
    label: 'Fats',
    subcategories: [
      {
        id: 'animal-fats',
        name: 'Animal Fats',
        items: ['Butter', 'Ghee', 'Lard', 'Tallow', 'Duck fat', 'Fish oil (cod liver oil)'],
      },
      {
        id: 'plant-oils',
        name: 'Plant Oils',
        items: [
          'Extra virgin olive oil',
          'Coconut oil',
          'Avocado oil',
          'Sesame oil',
          'Walnut oil',
          'Flaxseed oil',
          'Pumpkin seed oil',
          'Sunflower oil',
          'Grapeseed oil',
          'Macadamia nut oil',
        ],
      },
      {
        id: 'nuts-seeds-fat',
        name: 'Nuts & Seeds (Fat Sources)',
        items: [
          'Almonds',
          'Walnuts',
          'Cashews',
          'Hazelnuts',
          'Pecans',
          'Brazil nuts',
          'Pumpkin seeds',
          'Sunflower seeds',
          'Sesame seeds',
          'Chia seeds',
          'Flaxseeds',
          'Hemp seeds',
        ],
      },
      {
        id: 'other-fat-sources',
        name: 'Other Fat Sources',
        items: ['Avocado', 'Olives', 'Cacao butter', 'Coconut (meat)', 'Full-fat dairy (cheese, yogurt, cream)'],
      },
      {
        id: 'omega-sources',
        name: 'Omega Sources',
        items: ['Chia seeds', 'Flaxseeds', 'Hemp seeds', 'Walnuts', 'Fatty fish (salmon, sardines, mackerel)'],
      },
    ],
  },
  {
    id: 'carbohydrates',
    label: 'Carbohydrates',
    subcategories: [
      {
        id: 'grains-gluten',
        name: 'Grains (Gluten-Containing)',
        items: [
          'Rice (white, brown, basmati)',
          'Wheat (whole wheat, spelt, kamut, farro)',
          'Barley',
          'Rye',
          'Oats',
          'Couscous',
          'Bulgur',
        ],
      },
      {
        id: 'grains-gluten-free',
        name: 'Gluten-Free Grains & Pseudograins',
        items: ['Quinoa', 'Buckwheat', 'Amaranth', 'Millet', 'Sorghum', 'Teff'],
      },
      {
        id: 'starchy-vegetables',
        name: 'Starchy Vegetables',
        items: [
          'Potatoes (white, sweet)',
          'Sweet potatoes',
          'Yams',
          'Cassava',
          'Plantain',
          'Taro',
          'Pumpkin',
          'Acorn squash',
          'Butternut squash',
        ],
      },
      {
        id: 'legumes',
        name: 'Legumes',
        items: ['Lentils', 'Chickpeas', 'Black beans', 'Kidney beans', 'Pinto beans', 'White beans', 'Split peas', 'Peas'],
      },
      {
        id: 'fruits',
        name: 'Fruits',
        items: [
          'Apples',
          'Berries (blueberries, strawberries, raspberries, blackberries)',
          'Bananas',
          'Oranges',
          'Grapes',
          'Pineapple',
          'Mango',
          'Papaya',
          'Kiwi',
          'Pears',
        ],
      },
      {
        id: 'other-carbs',
        name: 'Other Carbs',
        items: ['Honey', 'Maple syrup', 'Dates', 'Coconut sugar', 'Molasses'],
      },
    ],
  },
  {
    id: 'hydration',
    label: 'Hydration & Fluids',
    subcategories: [
      { id: 'water', name: 'Water', items: ['Still water', 'Sparkling water', 'Mineral water (natural)'] },
      {
        id: 'herbal-teas',
        name: 'Herbal Teas',
        items: ['Chamomile', 'Peppermint', 'Ginger', 'Hibiscus', 'Rooibos', 'Green tea', 'Nettle', 'Dandelion'],
      },
      { id: 'broths', name: 'Broths', items: ['Bone broth (chicken, beef, fish)', 'Vegetable broth'] },
      {
        id: 'natural-fluids',
        name: 'Natural Fluids',
        items: [
          'Coconut water',
          'Aloe vera juice',
          'Fresh vegetable juices (carrot, cucumber, celery, beetroot)',
          'Fresh fruit juices (diluted)',
        ],
      },
      {
        id: 'plant-milks',
        name: 'Plant-Based Milks',
        items: ['Almond milk', 'Coconut milk', 'Oat milk', 'Soy milk', 'Cashew milk', 'Rice milk'],
      },
      {
        id: 'electrolyte-sources',
        name: 'Electrolyte Sources',
        items: [
          'Electrolyte water (natural)',
          'Coconut water',
          'Mineral water',
          'Broth',
          'Sea salt / Himalayan salt (in water)',
        ],
      },
      {
        id: 'other-fluids',
        name: 'Other Fluids',
        items: [
          'Kefir',
          'Kombucha (low sugar)',
          'Fermented drinks (water kefir, ginger beer)',
          'Apple cider vinegar (diluted)',
          'Lemon water',
        ],
      },
    ],
  },
]

// Stable id for a food line item, since the chart has no ids of its own —
// index-based and derived only from static data, so safe to persist.
export function foodItemId(groupId: FoodListGroupId, subcategoryId: string, itemIndex: number): string {
  return `${groupId}:${subcategoryId}:${itemIndex}`
}
