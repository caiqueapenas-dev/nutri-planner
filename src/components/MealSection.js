// src/components/MealSection.js

import React, { useState } from 'react';
import MealFoodItem from './MealFoodItem';
import { ChevronDown, ChevronUp, Edit3, Trash2, CheckCircle2 } from 'lucide-react';

function MealSection({ mealConfig, foods, onRemoveFood, onUpdateFoodGrams, onMoveFood, mealTypesConfig, onRenameMeal, onDeleteMeal }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(mealConfig.name);
  const totalCalories = foods.reduce((sum, item) => sum + (item.calories || 0), 0);

  const handleRename = () => {
    if (newName.trim() && newName.trim() !== mealConfig.name) {
      onRenameMeal(mealConfig.key, newName.trim());
    }
    setIsEditingName(false);
  };
  
  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir a refeição "${mealConfig.name}"? Todos os alimentos nela serão removidos permanentemente do plano atual.`)) {
        onDeleteMeal(mealConfig.key);
    }
  };

  return (
    <div className="mb-6 bg-gray-50 rounded-xl shadow-lg overflow-hidden">
      <div className="w-full flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        {isEditingName ? (
            <div className="flex-grow flex items-center">
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="p-1 rounded-md text-gray-800 text-lg font-semibold mr-2 flex-grow bg-white" autoFocus onBlur={handleRename} onKeyPress={e => e.key === 'Enter' && handleRename()}/>
                <button onClick={handleRename} className="p-1 hover:text-green-300"><CheckCircle2 size={20}/></button>
            </div>
        ) : (
            <h3 className="text-lg font-semibold cursor-pointer hover:opacity-90 flex-grow" onClick={() => setIsOpen(!isOpen)}>{mealConfig.name} ({totalCalories.toFixed(0)} kcal)</h3>
        )}
        <div className="flex items-center space-x-2 flex-shrink-0">
            {!mealConfig.isDefault && <button onClick={() => setIsEditingName(true)} className="p-1 hover:text-yellow-300" title="Renomear Refeição"><Edit3 size={18}/></button>}
            {!mealConfig.isDefault && <button onClick={handleDelete} className="p-1 hover:text-red-300" title="Excluir Refeição"><Trash2 size={18}/></button>}
            <button onClick={() => setIsOpen(!isOpen)} className="p-1"> {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />} </button>
        </div>
      </div>
      {isOpen && (
        <div className="p-4">
          {foods.length === 0 ? ( <p className="text-sm text-gray-500 italic">Nenhum alimento adicionado.</p> ) : (
            foods.map((foodItem) => (
              <MealFoodItem key={foodItem.uniqueId} foodItem={foodItem} onRemoveFood={onRemoveFood} mealTypeKey={mealConfig.key} onUpdateFoodGrams={onUpdateFoodGrams} onMoveFood={onMoveFood} mealTypesConfig={mealTypesConfig} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default MealSection;