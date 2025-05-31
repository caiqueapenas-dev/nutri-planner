// src/components/FoodListItem.js

import React, { useState, useEffect } from 'react';
import { PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';

function FoodListItem({ food, onAddFood, mealTypesConfig, showNotification }) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMealKey, setSelectedMealKey] = useState(mealTypesConfig[0]?.key || '');
  const [inputGrams, setInputGrams] = useState(food.servingInGrams || 100);

  useEffect(() => {
    setInputGrams(food.servingInGrams || 100);
  }, [food]);

  useEffect(() => { 
    if (!mealTypesConfig.find(mt => mt.key === selectedMealKey) && mealTypesConfig.length > 0) {
        setSelectedMealKey(mealTypesConfig[0].key);
    } else if (mealTypesConfig.length === 0 && selectedMealKey !== '') {
        setSelectedMealKey('');
    }
  }, [mealTypesConfig, selectedMealKey]);

  const handleAdd = () => {
    const grams = parseFloat(inputGrams);
    if (grams <= 0) {
      showNotification("Por favor, insira uma quantidade válida em gramas.", "error");
      return;
    }
    if (!selectedMealKey) {
      showNotification("Por favor, crie uma refeição nas Configurações para poder adicionar alimentos.", "error");
      return;
    }
    onAddFood(food, selectedMealKey, grams);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 mb-3 shadow-sm bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold text-gray-800">{food.name}</h4>
          <p className="text-xs text-gray-500">{food.servingDescription} ({food.servingInGrams}g)</p>
          <p className="text-sm text-blue-600">{food.calories} kcal / {food.servingInGrams}g</p>
        </div>
        <button onClick={() => setShowDetails(!showDetails)} className="p-2 text-gray-600 hover:text-blue-600">
          {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      {showDetails && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600">Nutrientes por {food.servingInGrams}g: P: {food.protein}g, C: {food.carbs}g, G: {food.fat}g</p>
          <div className="mt-3 flex items-center space-x-2">
            <input type="number" value={inputGrams} onChange={(e) => setInputGrams(e.target.value)} min="1" className="w-20 p-2 border rounded-md text-sm"/>
            <span className="text-sm text-gray-600">gramas</span>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <select value={selectedMealKey} onChange={(e) => setSelectedMealKey(e.target.value)} className="p-2 border rounded-md text-sm" disabled={mealTypesConfig.length === 0}>
              {mealTypesConfig.length === 0 && <option value="">Nenhuma refeição configurada</option>}
              {mealTypesConfig.sort((a,b) => (a.order || 0) - (b.order || 0)).map(mealType => ( <option key={mealType.key} value={mealType.key}>{mealType.name}</option> ))}
            </select>
            <button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-md text-sm flex items-center" disabled={mealTypesConfig.length === 0}>
              <PlusCircle size={16} className="mr-1" /> Adicionar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodListItem;