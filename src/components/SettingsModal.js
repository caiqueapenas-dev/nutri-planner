// src/components/SettingsModal.js

import React, { useState, useEffect } from 'react';
import { UserCog, Save, PlusCircle } from 'lucide-react';

const ACTIVITY_LEVELS = {
  sedentary: { label: 'Sedentário (pouco ou nenhum exercício)', factor: 1.2 },
  light: { label: 'Levemente Ativo (exercício leve 1-3 dias/semana)', factor: 1.375 },
  moderate: { label: 'Moderadamente Ativo (exercício moderado 3-5 dias/semana)', factor: 1.55 },
  active: { label: 'Muito Ativo (exercício intenso 6-7 dias/semana)', factor: 1.725 },
  extra_active: { label: 'Extremamente Ativo (exercício muito intenso e trabalho físico)', factor: 1.9 },
};

const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const calculateBMR = (gender, weight, height, age) => {
  if (!gender || !weight || !height || !age || parseFloat(weight) <=0 || parseFloat(height) <=0 || parseFloat(age) <=0) return 0;
  return gender === 'male'
    ? (10 * parseFloat(weight)) + (6.25 * parseFloat(height)) - (5 * parseFloat(age)) + 5
    : (10 * parseFloat(weight)) + (6.25 * parseFloat(height)) - (5 * parseFloat(age)) - 161;
};

const calculateBMI = (weight, height) => {
  if (!weight || !height || parseFloat(weight) <=0 || parseFloat(height) <=0) return 0;
  const heightInMeters = parseFloat(height) / 100;
  return parseFloat(weight) / (heightInMeters * heightInMeters);
};


function SettingsModal({ isOpen, onClose, userProfile, nutritionGoals, onSaveProfile, onSaveGoals, mealTypesConfig, onAddMealType, showNotification }) {
    const [profile, setProfile] = useState(userProfile);
    const [goals, setGoals] = useState(nutritionGoals);
    const [newMealName, setNewMealName] = useState('');

    useEffect(() => { setProfile(userProfile); }, [userProfile]);
    useEffect(() => { setGoals(nutritionGoals); }, [nutritionGoals]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleGoalsChange = (e) => {
        const { name, value } = e.target;
        setGoals(prev => ({ ...prev, [name]: value }));
    };
    
    const calculatedAge = profile.birthDate ? calculateAge(profile.birthDate) : 0;
    const bmr = calculateBMR(profile.gender, profile.weight, profile.height, calculatedAge);
    const tdee = bmr && profile.activityLevel && ACTIVITY_LEVELS[profile.activityLevel] ? (bmr * ACTIVITY_LEVELS[profile.activityLevel].factor) : 0;
    const bmi = calculateBMI(profile.weight, profile.height);

    const handleSaveAll = () => {
        const goalsToSave = {
            calories: parseFloat(goals.calories || 0),
            proteinGrams: parseFloat(goals.proteinGrams || 0),
            carbsGrams: parseFloat(goals.carbsGrams || 0),
            fatGrams: parseFloat(goals.fatGrams || 0),
        };
        const profileToSave = {
            ...profile,
            height: parseFloat(profile.height || 0),
            weight: parseFloat(profile.weight || 0),
        };

        onSaveProfile(profileToSave);
        onSaveGoals(goalsToSave);
        showNotification("Configurações salvas com sucesso!", "success");
    };

    const handleAddNewMeal = () => {
        if (newMealName.trim() === '') {
            showNotification("Nome da refeição não pode ser vazio.", "error");
            return;
        }
        if (mealTypesConfig.some(mt => mt.name.toLowerCase() === newMealName.trim().toLowerCase())) {
            showNotification("Já existe uma refeição com este nome.", "error");
            return;
        }
        onAddMealType(newMealName.trim());
        setNewMealName('');
    };
    
    const currentCalories = parseFloat(goals.calories || 0);
    const macroPercentages = {
        protein: currentCalories > 0 ? ((parseFloat(goals.proteinGrams || 0) * 4) / currentCalories) * 100 : 0,
        carbs: currentCalories > 0 ? ((parseFloat(goals.carbsGrams || 0) * 4) / currentCalories) * 100 : 0,
        fat: currentCalories > 0 ? ((parseFloat(goals.fatGrams || 0) * 9) / currentCalories) * 100 : 0,
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center"><UserCog size={28} className="mr-2 text-indigo-600"/>Configurações</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-red-600 text-3xl leading-none">&times;</button>
                </div>
                
                {/* Profile Section */}
                <section className="mb-8 p-4 border rounded-md">
                    <h3 className="text-xl font-semibold text-gray-700 mb-3">Meu Perfil</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-600">Nome</label><input type="text" name="name" value={profile.name || ''} onChange={handleProfileChange} className="mt-1 p-2 w-full border rounded-md"/></div>
                        <div><label className="block text-sm font-medium text-gray-600">Data de Nascimento</label><input type="date" name="birthDate" value={profile.birthDate || ''} onChange={handleProfileChange} className="mt-1 p-2 w-full border rounded-md"/></div>
                        <div><label className="block text-sm font-medium text-gray-600">Gênero</label><select name="gender" value={profile.gender || 'female'} onChange={handleProfileChange} className="mt-1 p-2 w-full border rounded-md"><option value="female">Feminino</option><option value="male">Masculino</option></select></div>
                        <div><label className="block text-sm font-medium text-gray-600">Altura (cm)</label><input type="number" name="height" value={profile.height || ''} onChange={handleProfileChange} placeholder="ex: 170" className="mt-1 p-2 w-full border rounded-md"/></div>
                        <div><label className="block text-sm font-medium text-gray-600">Peso Atual (kg)</label><input type="number" name="weight" value={profile.weight || ''} onChange={handleProfileChange} placeholder="ex: 65.5" className="mt-1 p-2 w-full border rounded-md"/></div>
                        <div><label className="block text-sm font-medium text-gray-600">Nível de Atividade</label><select name="activityLevel" value={profile.activityLevel || 'sedentary'} onChange={handleProfileChange} className="mt-1 p-2 w-full border rounded-md">{Object.entries(ACTIVITY_LEVELS).map(([key, val]) => (<option key={key} value={key}>{val.label}</option>))}</select></div>
                    </div>
                    <div className="mt-4 p-3 bg-indigo-50 rounded-md text-sm text-indigo-700">
                        <p>Idade: {calculatedAge > 0 ? `${calculatedAge} anos` : 'Preencha a data de nascimento'}</p>
                        <p>IMC: {bmi > 0 ? bmi.toFixed(1) : 'Preencha peso e altura'}</p>
                        <p>TMB (Metabolismo Basal): {bmr > 0 ? `${bmr.toFixed(0)} kcal` : 'Preencha os dados do perfil'}</p>
                        <p>GCD (Gasto Calórico Diário Estimado): {tdee > 0 ? `${tdee.toFixed(0)} kcal` : 'Preencha os dados do perfil'}</p>
                    </div>
                </section>
                
                {/* Goals Section */}
                <section className="mb-8 p-4 border rounded-md">
                     <h3 className="text-xl font-semibold text-gray-700 mb-3">Minhas Metas Diárias</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-600">Calorias (kcal)</label><input type="number" name="calories" value={goals.calories || ''} onChange={handleGoalsChange} placeholder="ex: 2000" className="mt-1 p-2 w-full border rounded-md"/></div>
                        <div><label className="block text-sm font-medium text-gray-600">Proteínas (g)</label><input type="number" name="proteinGrams" value={goals.proteinGrams || ''} onChange={handleGoalsChange} placeholder="ex: 120" className="mt-1 p-2 w-full border rounded-md"/> <span className="text-xs text-gray-500">{macroPercentages.protein.toFixed(0)}% das kcal</span></div>
                        <div><label className="block text-sm font-medium text-gray-600">Carboidratos (g)</label><input type="number" name="carbsGrams" value={goals.carbsGrams || ''} onChange={handleGoalsChange} placeholder="ex: 250" className="mt-1 p-2 w-full border rounded-md"/> <span className="text-xs text-gray-500">{macroPercentages.carbs.toFixed(0)}% das kcal</span></div>
                        <div><label className="block text-sm font-medium text-gray-600">Gorduras (g)</label><input type="number" name="fatGrams" value={goals.fatGrams || ''} onChange={handleGoalsChange} placeholder="ex: 60" className="mt-1 p-2 w-full border rounded-md"/> <span className="text-xs text-gray-500">{macroPercentages.fat.toFixed(0)}% das kcal</span></div>
                    </div>
                     <button onClick={() => setGoals(prev => ({...prev, calories: tdee > 0 ? Math.round(tdee) : 2000 }))} className="mt-2 text-sm text-indigo-600 hover:underline disabled:opacity-50" disabled={tdee <= 0}>Usar GCD como meta de calorias</button>
                </section>

                {/* Meal Management Section */}
                <section className="mb-6 p-4 border rounded-md">
                    <h3 className="text-xl font-semibold text-gray-700 mb-3">Gerenciar Tipos de Refeição</h3>
                    <div className="flex items-center space-x-2 mb-3">
                        <input type="text" value={newMealName} onChange={(e) => setNewMealName(e.target.value)} placeholder="Nome da nova refeição" className="p-2 border rounded-md flex-grow"/>
                        <button onClick={handleAddNewMeal} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md text-sm flex items-center"><PlusCircle size={16} className="mr-1"/>Adicionar</button>
                    </div>
                </section>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-8">
                    <button onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Fechar</button>
                    <button onClick={handleSaveAll} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md flex items-center"><Save size={18} className="mr-2"/>Salvar Tudo</button>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;