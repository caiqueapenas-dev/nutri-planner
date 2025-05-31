// src/components/DailyTotalsChart.js

import React from 'react';
import { TrendingUp } from 'lucide-react';

function DailyTotalsChart({ totals, goals }) {
    const items = [
        { label: 'Calorias', value: totals.calories, target: goals.calories, unit: 'kcal', color: 'bg-red-500' },
        { label: 'Proteínas', value: totals.protein, target: goals.proteinGrams, unit: 'g', color: 'bg-blue-500' },
        { label: 'Carboidratos', value: totals.carbs, target: goals.carbsGrams, unit: 'g', color: 'bg-yellow-500' },
        { label: 'Gorduras', value: totals.fat, target: goals.fatGrams, unit: 'g', color: 'bg-green-500' },
    ];

    return (
        <div className="bg-white p-4 shadow-md rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <TrendingUp size={24} className="mr-2 text-indigo-600" /> Resumo Nutricional Diário
            </h2>
            {(goals.calories === 0 && goals.proteinGrams === 0) && <p className="text-sm text-orange-600 text-center mb-2">Defina suas metas nutricionais nas configurações para visualizar o progresso!</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map(item => {
                    const targetValue = item.target || 0;
                    const currentValue = item.value || 0;
                    const percentage = targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;
                    const displayPercentage = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;

                    return (
                        <div key={item.label} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="text-sm font-medium text-gray-600">{item.label}</h3>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${item.color} opacity-80`}>
                                    {currentValue.toFixed(item.unit === 'kcal' ? 0 : 1)} {item.unit}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                <div className={`${item.color} h-2.5 rounded-full transition-all duration-500 ease-out`} style={{ width: `${percentage}%` }} ></div>
                            </div>
                            <p className="text-xs text-gray-500 text-right">
                                Meta: {targetValue.toFixed(item.unit === 'kcal' ? 0 : 1)} {item.unit} ({displayPercentage.toFixed(0)}%)
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default DailyTotalsChart;