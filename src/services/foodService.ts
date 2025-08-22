// Food nutrition service using a combination of local data and APIs
// For now, we'll use a local database of common foods for demonstration

interface FoodItem {
  id?: string;
  name: string;
  brand?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g?: number;
  sugar_per_100g?: number;
  sodium_per_100g?: number;
  serving_weight_grams?: number;
}

// Common Italian foods database
const FOOD_DATABASE: FoodItem[] = [
  // Cereali e derivati
  { name: "Avena integrale", brand: "Quaker", calories_per_100g: 389, protein_per_100g: 16.9, carbs_per_100g: 66.3, fats_per_100g: 6.9, fiber_per_100g: 10.6 },
  { name: "Pasta di semola", brand: "Barilla", calories_per_100g: 371, protein_per_100g: 13.0, carbs_per_100g: 74.7, fats_per_100g: 1.5, fiber_per_100g: 3.2 },
  { name: "Riso integrale", calories_per_100g: 349, protein_per_100g: 7.5, carbs_per_100g: 72.2, fats_per_100g: 2.2, fiber_per_100g: 2.2 },
  { name: "Pane integrale", calories_per_100g: 247, protein_per_100g: 13.0, carbs_per_100g: 41.0, fats_per_100g: 4.0, fiber_per_100g: 7.0 },
  { name: "Farro", calories_per_100g: 340, protein_per_100g: 15.1, carbs_per_100g: 67.1, fats_per_100g: 2.5, fiber_per_100g: 6.8 },
  
  // Proteine animali
  { name: "Petto di pollo", calories_per_100g: 165, protein_per_100g: 31.0, carbs_per_100g: 0, fats_per_100g: 3.6 },
  { name: "Salmone", calories_per_100g: 208, protein_per_100g: 25.4, carbs_per_100g: 0, fats_per_100g: 12.4 },
  { name: "Tonno al naturale", brand: "Rio Mare", calories_per_100g: 103, protein_per_100g: 25.2, carbs_per_100g: 0, fats_per_100g: 0.6 },
  { name: "Uova", calories_per_100g: 155, protein_per_100g: 13.0, carbs_per_100g: 0.7, fats_per_100g: 11.0 },
  { name: "Manzo magro", calories_per_100g: 158, protein_per_100g: 26.4, carbs_per_100g: 0, fats_per_100g: 5.4 },
  
  // Latticini
  { name: "Yogurt greco 0%", brand: "Fage", calories_per_100g: 59, protein_per_100g: 10.3, carbs_per_100g: 3.6, fats_per_100g: 0.4 },
  { name: "Latte scremato", calories_per_100g: 36, protein_per_100g: 3.6, carbs_per_100g: 5.0, fats_per_100g: 0.2 },
  { name: "Ricotta vaccina", calories_per_100g: 146, protein_per_100g: 8.8, carbs_per_100g: 4.3, fats_per_100g: 10.9 },
  { name: "Parmigiano Reggiano", calories_per_100g: 387, protein_per_100g: 33.0, carbs_per_100g: 0, fats_per_100g: 28.0 },
  
  // Frutta
  { name: "Banana", calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 23.0, fats_per_100g: 0.3, fiber_per_100g: 2.6, sugar_per_100g: 12.2 },
  { name: "Mela", calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14.0, fats_per_100g: 0.2, fiber_per_100g: 2.4, sugar_per_100g: 10.4 },
  { name: "Arancia", calories_per_100g: 47, protein_per_100g: 0.9, carbs_per_100g: 12.0, fats_per_100g: 0.1, fiber_per_100g: 2.4, sugar_per_100g: 9.4 },
  { name: "Fragole", calories_per_100g: 32, protein_per_100g: 0.7, carbs_per_100g: 8.0, fats_per_100g: 0.3, fiber_per_100g: 2.0, sugar_per_100g: 4.9 },
  { name: "Kiwi", calories_per_100g: 61, protein_per_100g: 1.1, carbs_per_100g: 15.0, fats_per_100g: 0.5, fiber_per_100g: 3.0, sugar_per_100g: 9.0 },
  
  // Verdure
  { name: "Broccoli", calories_per_100g: 25, protein_per_100g: 3.0, carbs_per_100g: 5.0, fats_per_100g: 0.4, fiber_per_100g: 3.0 },
  { name: "Spinaci", calories_per_100g: 23, protein_per_100g: 2.9, carbs_per_100g: 3.6, fats_per_100g: 0.4, fiber_per_100g: 2.2 },
  { name: "Pomodori", calories_per_100g: 18, protein_per_100g: 0.9, carbs_per_100g: 3.9, fats_per_100g: 0.2, fiber_per_100g: 1.2, sugar_per_100g: 2.6 },
  { name: "Zucchine", calories_per_100g: 17, protein_per_100g: 1.2, carbs_per_100g: 3.1, fats_per_100g: 0.3, fiber_per_100g: 1.0 },
  { name: "Carote", calories_per_100g: 41, protein_per_100g: 0.9, carbs_per_100g: 10.0, fats_per_100g: 0.2, fiber_per_100g: 2.8, sugar_per_100g: 4.7 },
  
  // Legumi
  { name: "Fagioli cannellini", calories_per_100g: 91, protein_per_100g: 6.7, carbs_per_100g: 16.0, fats_per_100g: 0.5, fiber_per_100g: 6.2 },
  { name: "Lenticchie", calories_per_100g: 93, protein_per_100g: 6.9, carbs_per_100g: 16.0, fats_per_100g: 0.4, fiber_per_100g: 7.9 },
  { name: "Ceci", calories_per_100g: 100, protein_per_100g: 7.0, carbs_per_100g: 17.0, fats_per_100g: 1.4, fiber_per_100g: 5.8 },
  
  // Frutta secca e semi
  { name: "Mandorle", calories_per_100g: 579, protein_per_100g: 21.2, carbs_per_100g: 21.6, fats_per_100g: 49.9, fiber_per_100g: 12.5 },
  { name: "Noci", calories_per_100g: 654, protein_per_100g: 15.2, carbs_per_100g: 13.7, fats_per_100g: 65.2, fiber_per_100g: 6.7 },
  { name: "Semi di girasole", calories_per_100g: 584, protein_per_100g: 20.8, carbs_per_100g: 20.0, fats_per_100g: 51.5, fiber_per_100g: 8.6 },
  
  // Condimenti e oli
  { name: "Olio extravergine di oliva", calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fats_per_100g: 100 },
  { name: "Aceto balsamico", calories_per_100g: 88, protein_per_100g: 0.5, carbs_per_100g: 17.0, fats_per_100g: 0, sugar_per_100g: 14.9 },
  
  // Bevande
  { name: "Acqua", calories_per_100g: 0, protein_per_100g: 0, carbs_per_100g: 0, fats_per_100g: 0 },
  { name: "Caffè", calories_per_100g: 2, protein_per_100g: 0.1, carbs_per_100g: 0.3, fats_per_100g: 0 },
  { name: "Tè verde", calories_per_100g: 1, protein_per_100g: 0, carbs_per_100g: 0.3, fats_per_100g: 0 },
];

export class FoodService {
  static lookupByName(name: string) {
      throw new Error("Method not implemented.");
  }
  // Search using OpenFoodFacts API with better error handling
  static async searchFoods(query: string): Promise<FoodItem[]> {
    if (!query || query.length < 2) return [];
    
    try {
      // First try OpenFoodFacts API
      const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.products && Array.isArray(data.products) && data.products.length > 0) {
        return data.products.slice(0, 10).map((product: any) => ({
          name: product.product_name_it || product.product_name || product.generic_name_it || product.generic_name || 'Prodotto senza nome',
          brand: product.brands?.split(',')[0]?.trim() || undefined,
          calories_per_100g: parseFloat(product.nutriments?.['energy-kcal_100g']) || parseFloat(product.nutriments?.energy_100g) / 4.184 || 0,
          protein_per_100g: parseFloat(product.nutriments?.proteins_100g) || 0,
          carbs_per_100g: parseFloat(product.nutriments?.carbohydrates_100g) || 0,
          fats_per_100g: parseFloat(product.nutriments?.fat_100g) || 0,
          fiber_per_100g: parseFloat(product.nutriments?.fiber_100g) || undefined,
          sugar_per_100g: parseFloat(product.nutriments?.sugars_100g) || undefined,
          sodium_per_100g: parseFloat(product.nutriments?.sodium_100g) || undefined,
        })).filter((food: FoodItem) => food.name !== 'Prodotto senza nome' && food.calories_per_100g > 0);
      }
      
      // Fallback to local database if API fails or returns no results
      console.log('OpenFoodFacts API returned no results, using local database');
      return this.searchFoodsLocal(query);
      
    } catch (error) {
      console.error('Error searching foods from API:', error);
      // Fallback to local database
      return this.searchFoodsLocal(query);
    }
  }

  // Keep local search for fallback
  static searchFoodsLocal(query: string): FoodItem[] {
    if (!query || query.length < 2) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return FOOD_DATABASE.filter(food => 
      food.name.toLowerCase().includes(normalizedQuery) ||
      (food.brand && food.brand.toLowerCase().includes(normalizedQuery))
    ).slice(0, 20); // Limit results to 20 items
  }

  static getFoodByBarcode(barcode: string): Promise<FoodItem | null> {
    // This would integrate with a barcode API like OpenFoodFacts
    // For now, return a sample food item
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate API call
        const sampleFood: FoodItem = {
          name: "Prodotto scansionato",
          brand: "Brand Example",
          calories_per_100g: 250,
          protein_per_100g: 8.0,
          carbs_per_100g: 30.0,
          fats_per_100g: 12.0,
          fiber_per_100g: 3.0,
          sugar_per_100g: 5.0,
          sodium_per_100g: 0.5
        };
        resolve(sampleFood);
      }, 1000);
    });
  }

  static getPopularFoods(): FoodItem[] {
    // Return most commonly used foods
    return [
      FOOD_DATABASE.find(f => f.name === "Pasta di semola")!,
      FOOD_DATABASE.find(f => f.name === "Petto di pollo")!,
      FOOD_DATABASE.find(f => f.name === "Riso integrale")!,
      FOOD_DATABASE.find(f => f.name === "Banana")!,
      FOOD_DATABASE.find(f => f.name === "Yogurt greco 0%")!,
      FOOD_DATABASE.find(f => f.name === "Olio extravergine di oliva")!,
    ].filter(Boolean);
  }

  static getRecentFoods(): FoodItem[] {
    // This would come from user's recent entries
    // For now, return a sample of foods
    return [
      FOOD_DATABASE.find(f => f.name === "Avena integrale")!,
      FOOD_DATABASE.find(f => f.name === "Petto di pollo")!,
      FOOD_DATABASE.find(f => f.name === "Banana")!,
      FOOD_DATABASE.find(f => f.name === "Yogurt greco 0%")!,
    ].filter(Boolean);
  }

  static calculateNutrition(food: FoodItem, servingSize: number, servingUnit: string = 'g'): {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    sugar: number;
    sodium: number;
  } {
    const multiplier = servingSize / 100;
    
    return {
      calories: Math.round(food.calories_per_100g * multiplier * 10) / 10,
      protein: Math.round(food.protein_per_100g * multiplier * 10) / 10,
      carbs: Math.round(food.carbs_per_100g * multiplier * 10) / 10,
      fats: Math.round(food.fats_per_100g * multiplier * 10) / 10,
      fiber: Math.round((food.fiber_per_100g || 0) * multiplier * 10) / 10,
      sugar: Math.round((food.sugar_per_100g || 0) * multiplier * 10) / 10,
      sodium: Math.round((food.sodium_per_100g || 0) * multiplier * 10) / 10,
    };
  }
}

export type { FoodItem };