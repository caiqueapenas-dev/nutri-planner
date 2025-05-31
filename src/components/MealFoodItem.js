// src/components/MealFoodItem.js

import React, { useState } from 'react';
import { XCircle, Info, MoveRight, Edit3, CheckCircle2 } from 'lucide-react';

function MealFoodItem({ foodItem, onRemoveFood, mealTypeKey, onUpdateFoodGrams, onMoveFood, mealTypesConfig }) {
  const [showMicros, setShowMicros] = useState(false);
  const [isEditingGrams, setIsEditingGrams] = useState(false);
  const [currentGrams, setCurrentGrams] = useState(foodItem.enteredGrams);
  const [showMoveOptions, setShowMoveOptions] = useState(false);

  const handleGramsSave = () => {
    const newGrams = parseFloat(currentGrams);
    if (newGrams > 0 && newGrams !== foodItem.enteredGrams) {
      onUpdateFoodGrams(mealTypeKey, foodItem.uniqueId, newGrams);
    }
    setIsEditingGrams(false);
  };

  const handleMove = (targetMealKey) => {
    onMoveFood(mealTypeKey, foodItem.uniqueId, targetMealKey);
    setShowMoveOptions(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 mb-2 shadow-sm bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h5 className="font-medium text-gray-800">{foodItem.name}</h5>
          {isEditingGrams ? (
            <div className="flex items-center space-x-1 mt-1">
              <input type="number" value={currentGrams} onChange={(e) => setCurrentGrams(e.target.value)} min="1" className="w-20 p-1 border rounded-md text-sm" autoFocus />
              <button onClick={handleGramsSave} className="p-1 text-green-600"><CheckCircle2 size={18}/></button>
              <button onClick={() => {setIsEditingGrams(false); setCurrentGrams(foodItem.enteredGrams);}} className="p-1 text-red-500"><XCircle size={18}/></button>
            </div>
          ) : (
            <p className="text-xs text-gray-500 flex items-center"> {foodItem.enteredGrams}g
              <button onClick={() => {setIsEditingGrams(true); setCurrentGrams(foodItem.enteredGrams);}} className="ml-2 p-0.5 text-blue-500 hover:text-blue-700"> <Edit3 size={12} /> </button>
            </p>
          )}
          <p className="text-sm text-blue-600">{foodItem.calories.toFixed(0)} kcal</p>
          <p className="text-xs text-gray-600"> P: {foodItem.protein.toFixed(1)}g, C: {foodItem.carbs.toFixed(1)}g, G: {foodItem.fat.toFixed(1)}g </p>
        </div>
        <div className="flex flex-col items-end space-y-1 relative">
            <button onClick={() => onRemoveFood(mealTypeKey, foodItem.uniqueId)} className="p-1 text-red-500 hover:text-red-700" title="Remover alimento"> <XCircle size={20} /> </button>
            {foodItem.scaledMicronutrients && Object.keys(foodItem.scaledMicronutrients).length > 0 && (
                 <button onClick={() => setShowMicros(!showMicros)} className="p-1 text-gray-500 hover:text-blue-600" title="Ver micronutrientes"> <Info size={18} /> </button>
            )}
            <button onClick={() => setShowMoveOptions(!showMoveOptions)} className="p-1 text-gray-500 hover:text-indigo-600" title="Mover para outra refeição" disabled={mealTypesConfig.filter(mt => mt.key !== mealTypeKey).length === 0}> <MoveRight size={18} /> </button>
            {showMoveOptions && mealTypesConfig.filter(mt => mt.key !== mealTypeKey).length > 0 && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10 py-1">
                    {mealTypesConfig.filter(mt => mt.key !== mealTypeKey).map(targetMeal => (
                        <button key={targetMeal.key} onClick={() => handleMove(targetMeal.key)} className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">
                            Mover para {targetMeal.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
      </div>
      {showMicros && foodItem.scaledMicronutrients && ( 
        <div className="mt-2 pt-2 border-t border-gray-100">
            <h6 className="text-xs font-semibold text-gray-700">Micronutrientes (para {foodItem.enteredGrams}g):</h6>
            <ul className="list-disc list-inside pl-1">
            {Object.entries(foodItem.scaledMicronutrients).map(([key, value]) => ( <li key={key} className="text-xs text-gray-500">{key}: {value}</li> ))}
            </ul>
        </div> 
      )}
    </div>
  );
}

export default MealFoodItem;