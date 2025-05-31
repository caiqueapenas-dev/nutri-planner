// src/components/MealSection.js

import React, { useState } from 'react'; // useState ainda é usado para isEditingName
import MealFoodItem from './MealFoodItem';
import { ChevronDown, ChevronUp, Edit3, Trash2, CheckCircle2 } from 'lucide-react';

// A prop `isOpen` e `onToggleOpen` agora vêm do App.js
function MealSection({ 
    mealConfig, 
    foods, 
    isOpen, // NOVO: Recebe o estado de aberto/fechado
    onToggleOpen, // NOVO: Recebe a função para alternar o estado
    onRemoveFood, 
    onUpdateFoodGrams, 
    onMoveFood, 
    mealTypesConfig, 
    onRenameMeal, 
    onDeleteMeal 
}) {
  // const [isOpen, setIsOpen] = useState(true); // REMOVIDO: Este estado agora é gerenciado pelo App.js
  const [isEditingName, setIsEditingName] = useState(false); // Estado para controlar a edição do nome da refeição
  const [newName, setNewName] = useState(mealConfig.name); // Estado para o novo nome durante a edição
  
  // Calcula o total de calorias para esta seção de refeição
  const totalCalories = foods.reduce((sum, item) => sum + (item.calories || 0), 0);

  // Handler para salvar o novo nome da refeição
  const handleRename = () => {
    if (newName.trim() && newName.trim() !== mealConfig.name) { // Se o nome mudou e não está vazio
      onRenameMeal(mealConfig.key, newName.trim()); // Chama a função passada por props para renomear
    }
    setIsEditingName(false); // Sai do modo de edição
  };
  
  // Handler para excluir a refeição
  const handleDelete = () => {
    // Usa window.confirm para uma confirmação simples (idealmente seria um modal customizado)
    if (window.confirm(`Tem certeza que deseja excluir a refeição "${mealConfig.name}"? Todos os alimentos nela serão removidos permanentemente do plano atual.`)) {
        onDeleteMeal(mealConfig.key); // Chama a função passada por props para excluir
    }
  };

  return (
    <div className="mb-6 bg-gray-50 rounded-xl shadow-lg overflow-hidden">
      {/* Cabeçalho da Seção de Refeição */}
      <div className="w-full flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        {/* Lógica para exibir input de edição ou nome da refeição */}
        {isEditingName ? (
            <div className="flex-grow flex items-center">
                <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    className="p-1 rounded-md text-gray-800 text-lg font-semibold mr-2 flex-grow bg-white" 
                    autoFocus // Foca automaticamente no input ao entrar em modo de edição
                    onBlur={handleRename} // Salva ao perder o foco
                    onKeyPress={e => e.key === 'Enter' && handleRename()} // Salva ao pressionar Enter
                />
                <button onClick={handleRename} className="p-1 hover:text-green-300" title="Salvar nome"><CheckCircle2 size={20}/></button>
            </div>
        ) : (
            // Nome da refeição e total de calorias (clicável para abrir/fechar)
            <h3 
                className="text-lg font-semibold cursor-pointer hover:opacity-90 flex-grow" 
                onClick={onToggleOpen} // Chama a função de toggle passada por props
            >
                {mealConfig.name} ({totalCalories.toFixed(0)} kcal)
            </h3>
        )}
        {/* Botões de Ação (Editar, Excluir, Abrir/Fechar) */}
        <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Botão de renomear (só para refeições não padrão) */}
            {!mealConfig.isDefault && <button onClick={() => setIsEditingName(true)} className="p-1 hover:text-yellow-300" title="Renomear Refeição"><Edit3 size={18}/></button>}
            {/* Botão de excluir (só para refeições não padrão) */}
            {!mealConfig.isDefault && <button onClick={handleDelete} className="p-1 hover:text-red-300" title="Excluir Refeição"><Trash2 size={18}/></button>}
            {/* Botão para abrir/fechar a seção */}
            <button onClick={onToggleOpen} className="p-1" title={isOpen ? "Recolher" : "Expandir"}> 
                {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />} 
            </button>
        </div>
      </div>
      {/* Conteúdo da Seção de Refeição (lista de alimentos) */}
      {isOpen && ( // Renderiza o conteúdo apenas se a seção estiver aberta
        <div className="p-4">
          {/* Mensagem se não houver alimentos */}
          {foods.length === 0 ? ( <p className="text-sm text-gray-500 italic">Nenhum alimento adicionado.</p> ) : (
            // Mapeia e renderiza cada item de alimento na refeição
            foods.map((foodItem) => (
              <MealFoodItem 
                key={foodItem.uniqueId} 
                foodItem={foodItem} 
                onRemoveFood={onRemoveFood} 
                mealTypeKey={mealConfig.key} 
                onUpdateFoodGrams={onUpdateFoodGrams} 
                onMoveFood={onMoveFood} 
                mealTypesConfig={mealTypesConfig} 
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default MealSection;