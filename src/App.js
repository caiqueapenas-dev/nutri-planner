// src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { Save, UserCircle, CalendarDays, Settings, Utensils, CheckCircle2 } from 'lucide-react';

import DailyTotalsChart from './components/DailyTotalsChart';
import FoodListItem from './components/FoodListItem';
import MealSection from './components/MealSection';
import SettingsModal from './components/SettingsModal';
import { firebaseConfig } from './firebaseConfig.js';

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const appId = firebaseConfig.projectId;

const FOOD_DATABASE = [
  { id: '1', name: 'Maçã', servingDescription: '1 média', servingInGrams: 182, calories: 95, protein: 0.5, carbs: 25, fat: 0.3, micronutrients: { "Vitamina C": "10mg (11% VD)", "Fibras": "4.4g (16% VD)" } },
  { id: '2', name: 'Banana', servingDescription: '1 média', servingInGrams: 118, calories: 105, protein: 1.3, carbs: 27, fat: 0.4, micronutrients: { "Vitamina B6": "0.4mg (22% VD)", "Potássio": "422mg (9% VD)" } },
  { id: '3', name: 'Peito de Frango Grelhado', servingDescription: 'porção de', servingInGrams: 100, calories: 165, protein: 31, carbs: 0, fat: 3.6, micronutrients: { "Niacina": "10mg (63% VD)", "Selênio": "25mcg (45% VD)" } },
  { id: '4', name: 'Arroz Branco Cozido', servingDescription: '1 xícara', servingInGrams: 158, calories: 205, protein: 4.3, carbs: 45, fat: 0.4, micronutrients: { "Manganês": "0.7mg (30% VD)" } },
  { id: '5', name: 'Feijão Preto Cozido', servingDescription: '1 xícara', servingInGrams: 172, calories: 227, protein: 15.2, carbs: 40.8, fat: 0.9, micronutrients: { "Folato": "256mcg (64% VD)", "Ferro": "3.6mg (20% VD)" } },
  { id: '6', name: 'Ovo Cozido', servingDescription: '1 grande', servingInGrams: 50, calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, micronutrients: { "Vitamina D": "44IU (6% VD)", "Colina": "147mg (27% VD)" } },
  { id: '7', name: 'Leite Integral', servingDescription: '1 xícara', servingInGrams: 240, calories: 149, protein: 7.7, carbs: 11.7, fat: 8, micronutrients: { "Cálcio": "276mg (21% VD)", "Vitamina B12": "1.1mcg (46% VD)" } },
  { id: '8', name: 'Pão Francês', servingDescription: '1 unidade', servingInGrams: 50, calories: 140, protein: 4.5, carbs: 28, fat: 1, micronutrients: { "Sódio": "250mg (11% VD)" } },
  { id: '9', name: 'Alface Crespa', servingDescription: '1 xícara desfiada', servingInGrams: 36, calories: 5, protein: 0.5, carbs: 1, fat: 0.1, micronutrients: { "Vitamina K": "29mcg (24% VD)", "Vitamina A": "970IU (32% VD)" } },
  { id: '10', name: 'Tomate', servingDescription: '1 médio', servingInGrams: 123, calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2, micronutrients: { "Vitamina C": "17mg (19% VD)", "Potássio": "292mg (6% VD)" } },
  { id: '11', name: 'Salmão Grelhado', servingDescription: 'porção de', servingInGrams: 100, calories: 208, protein: 20, carbs: 0, fat: 13, micronutrients: { "Vitamina D": "570IU (71% VD)", "Ômega-3": "2.3g" } },
  { id: '12', name: 'Batata Doce Cozida', servingDescription: '1 média', servingInGrams: 130, calories: 112, protein: 2, carbs: 26, fat: 0.1, micronutrients: { "Vitamina A": "18,443IU (369% VD)", "Manganês": "0.3mg (14% VD)" } },
  { id: '13', name: 'Brócolis Cozido', servingDescription: '1 xícara', servingInGrams: 156, calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6, micronutrients: { "Vitamina C": "101mg (112% VD)", "Vitamina K": "116mcg (97% VD)" } },
  { id: '14', name: 'Azeite de Oliva Extra Virgem', servingDescription: '1 colher de sopa', servingInGrams: 15, calories: 119, protein: 0, carbs: 0, fat: 13.5, micronutrients: { "Vitamina E": "1.9mg (13% VD)" } },
  { id: '15', name: 'Iogurte Natural Integral', servingDescription: '1 pote', servingInGrams: 170, calories: 104, protein: 8.5, carbs: 11.4, fat: 3.8, micronutrients: { "Cálcio": "296mg (23% VD)", "Fósforo": "233mg (19% VD)" } },
];

const INITIAL_MEAL_TYPES_CONFIG = [
  { key: 'breakfast', name: 'Café da Manhã', order: 1, isDefault: true },
  { key: 'lunch', name: 'Almoço', order: 2, isDefault: true },
  { key: 'dinner', name: 'Jantar', order: 3, isDefault: true },
  { key: 'snacks', name: 'Lanches', order: 4, isDefault: true },
];

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

const scaleNutrients = (food, inputGrams) => {
  const baseGrams = food.servingInGrams;
  if (!baseGrams || baseGrams === 0 || !inputGrams) return { ...food, enteredGrams: parseFloat(inputGrams) || 0, calories: 0, protein: 0, carbs: 0, fat: 0, scaledMicronutrients: {} };
  const factor = parseFloat(inputGrams) / baseGrams;
  const scaledFood = {
      ...food, enteredGrams: parseFloat(inputGrams),
      calories: (food.calories || 0) * factor, protein: (food.protein || 0) * factor,
      carbs: (food.carbs || 0) * factor, fat: (food.fat || 0) * factor,
      scaledMicronutrients: {},
  };
  if (food.micronutrients) {
      scaledFood.scaledMicronutrients = Object.fromEntries(
          Object.entries(food.micronutrients).map(([key, valueStr]) => {
              const numericPart = parseFloat(valueStr);
              if (!isNaN(numericPart)) {
                  const unitAndRest = valueStr.toString().substring(numericPart.toString().length);
                  return [key, `${(numericPart * factor).toFixed(1)}${unitAndRest}`];
              }
              return [key, valueStr];
          })
      );
  }
  return scaledFood;
};


function App() {
  const [dailyPlan, setDailyPlan] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [userProfile, setUserProfile] = useState({ name: '', birthDate: '', gender: 'female', height: 0, weight: 0, activityLevel: 'sedentary' });
  const [nutritionGoals, setNutritionGoals] = useState({ calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 });
  const [mealTypesConfig, setMealTypesConfig] = useState([]);


  const showNotification = useCallback((message, type = 'success', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  }, []);
  
  // Auth Effect
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) { 
        setUserId(user.uid); 
      } else {
        signInAnonymously(auth).catch(e => {
            console.error("Anonymous sign-in failed", e);
            setError("Falha na autenticação. Você precisa habilitar o login anônimo no seu projeto Firebase.");
            setIsLoading(false);
        });
      }
    });
    return () => unsubAuth();
  }, []);

  // User Data & Config Loading Effect
  useEffect(() => {
    if (!userId) return;

    const loadUserData = async () => {
        try {
            // Linhas NOVAS e CORRIGIDAS:
            // Substitua as linhas problemáticas por estas:

            const profileRef = doc(db, `artifacts/${appId}/users/${userId}/userConfigurations/profile`);
            const goalsRef = doc(db, `artifacts/${appId}/users/${userId}/userConfigurations/nutritionGoals`);
            const mealConfigRef = doc(db, `artifacts/${appId}/users/${userId}/userConfigurations/mealConfiguration`);

            const [profileSnap, goalsSnap, mealConfigSnap] = await Promise.all([ getDoc(profileRef), getDoc(goalsRef), getDoc(mealConfigRef) ]);

            const loadedProfile = profileSnap.exists() ? profileSnap.data() : { name: '', birthDate: '', gender: 'female', height: 0, weight: 0, activityLevel: 'sedentary' };
            setUserProfile(loadedProfile);

            if (goalsSnap.exists()) {
                setNutritionGoals(goalsSnap.data());
            } else {
                const age = calculateAge(loadedProfile.birthDate);
                const bmr = calculateBMR(loadedProfile.gender, loadedProfile.weight, loadedProfile.height, age);
                const activityFactor = ACTIVITY_LEVELS[loadedProfile.activityLevel]?.factor || 1.2;
                const tdee = bmr ? (bmr * activityFactor) : 2000;
                setNutritionGoals({ 
                    calories: Math.round(tdee) || 2000, 
                    proteinGrams: Math.round((tdee * 0.20) / 4) || 100, 
                    carbsGrams: Math.round((tdee * 0.50) / 4) || 250, 
                    fatGrams: Math.round((tdee * 0.30) / 9) || 67 
                });
            }

            if (mealConfigSnap.exists() && mealConfigSnap.data().mealTypes && mealConfigSnap.data().mealTypes.length > 0) {
                setMealTypesConfig(mealConfigSnap.data().mealTypes);
            } else {
                setMealTypesConfig(INITIAL_MEAL_TYPES_CONFIG);
                await setDoc(mealConfigRef, { mealTypes: INITIAL_MEAL_TYPES_CONFIG });
            }
        } catch (e) { 
            console.error("Error loading user data:", e); 
            setError("Falha ao carregar dados. Verifique as regras de segurança do seu Firestore.");
            setMealTypesConfig(INITIAL_MEAL_TYPES_CONFIG);
        } finally {
            setAuthReady(true);
        }
    };
    loadUserData();
  }, [userId]);

  // Daily Meal Plan Loading Effect
  const loadPlan = useCallback(async (uid, date) => {
    if (!uid || !date || mealTypesConfig.length === 0) { setIsLoading(false); return; }
    setIsLoading(true); 
    try {
      const planRef = doc(db, `artifacts/${appId}/users/${uid}/mealPlans/${date}`);
      const docSnap = await getDoc(planRef);
      const loadedData = docSnap.exists() ? docSnap.data() : {};
      const newPlan = {};
      mealTypesConfig.forEach(mt => {
          newPlan[mt.key] = (loadedData[mt.key] || []).map(item => {
            if (item.enteredGrams && typeof item.calories === 'number') return item;
            const foodBase = FOOD_DATABASE.find(f => f.id === item.id);
            if (foodBase && item.enteredGrams) return { ...scaleNutrients(foodBase, item.enteredGrams), uniqueId: item.uniqueId };
            return { ...item, calories: 0, protein: 0, carbs: 0, fat: 0 };
          });
      });
      setDailyPlan(newPlan);
    } catch (err) { 
        console.error("Erro ao carregar plano:", err);
        setError("Não foi possível carregar o plano do dia."); 
        showNotification("Erro ao carregar plano.", 'error'); 
    } finally { 
        setIsLoading(false); 
    }
  }, [appId, mealTypesConfig, showNotification]);

  useEffect(() => {
    if (authReady && userId && currentDate) {
        loadPlan(userId, currentDate);
    } else if(authReady && !userId) {
        setIsLoading(false);
    }
  }, [authReady, userId, currentDate, loadPlan]);

  
  // --- HANDLERS (LOGIC) ---

  const handleSaveProfile = async (newProfile) => {
    if (!userId) return showNotification("Não foi possível salvar: usuário não autenticado.", "error");
    setUserProfile(newProfile);
    const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile`);
    try { await setDoc(profileRef, newProfile, { merge: true }); } 
    catch (e) { console.error("Error saving profile:", e); showNotification("Erro ao salvar perfil.", "error");}
  };

  const handleSaveGoals = async (newGoals) => {
    if (!userId) return showNotification("Não foi possível salvar: usuário não autenticado.", "error");
    setNutritionGoals(newGoals);
    const goalsRef = doc(db, `artifacts/${appId}/users/${userId}/nutritionGoals`);
    try { await setDoc(goalsRef, newGoals, { merge: true }); } 
    catch (e) { console.error("Error saving goals:", e); showNotification("Erro ao salvar metas.", "error");}
  };
  
  const handleSaveMealConfig = async (updatedConfig) => {
    if (!userId) return showNotification("Não foi possível salvar: usuário não autenticado.", "error");
    const sortedConfig = updatedConfig.sort((a,b) => (a.order || 0) - (b.order || 0));
    setMealTypesConfig(sortedConfig);
    const configRef = doc(db, `artifacts/${appId}/users/${userId}/mealConfiguration`);
    try { await setDoc(configRef, { mealTypes: sortedConfig }); }
    catch (e) { console.error("Error saving meal config:", e); showNotification("Erro ao salvar configuração de refeições.", "error");}
  };

  const savePlan = useCallback(async () => {
    if (!userId) return showNotification("Não foi possível salvar: usuário não autenticado.", "error");
    setIsSaving(true);
    const planRef = doc(db, `artifacts/${appId}/users/${userId}/mealPlans/${currentDate}`);
    try {
      const planToSave = {};
      mealTypesConfig.forEach(mt => {
        planToSave[mt.key] = (dailyPlan[mt.key] || []).map(item => ({
          id: item.id, name: item.name, enteredGrams: item.enteredGrams,
          calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat,
          scaledMicronutrients: item.scaledMicronutrients || {}, uniqueId: item.uniqueId,
        }));
      });
      await setDoc(planRef, planToSave);
      showNotification("Plano salvo com sucesso!", 'success');
    } catch (err) { console.error("Erro ao salvar plano:", err); showNotification("Erro ao salvar plano.", 'error'); } 
    finally { setIsSaving(false); }
  }, [userId, currentDate, dailyPlan, appId, mealTypesConfig, showNotification]);

  const handleAddFood = (food, mealKey, inputGrams) => {
    const scaledFoodItem = scaleNutrients(food, inputGrams);
    setDailyPlan(prevPlan => ({
      ...prevPlan,
      [mealKey]: [...(prevPlan[mealKey] || []), { ...scaledFoodItem, uniqueId: Date.now() + Math.random() }]
    }));
  };

  const handleRemoveFood = (mealKey, foodUniqueId) => {
    setDailyPlan(prevPlan => ({
      ...prevPlan,
      [mealKey]: (prevPlan[mealKey] || []).filter(item => item.uniqueId !== foodUniqueId)
    }));
  };

  const handleUpdateFoodGrams = (mealKey, foodUniqueId, newGrams) => {
    setDailyPlan(prevPlan => {
        const updatedMealItems = (prevPlan[mealKey] || []).map(item => {
            if (item.uniqueId === foodUniqueId) {
                const originalFoodFromDb = FOOD_DATABASE.find(dbFood => dbFood.id === item.id);
                if (originalFoodFromDb) {
                    return { ...scaleNutrients(originalFoodFromDb, newGrams), uniqueId: item.uniqueId };
                }
            }
            return item;
        }).filter(Boolean);
        return { ...prevPlan, [mealKey]: updatedMealItems };
    });
  };

  const handleMoveFood = (sourceMealKey, foodUniqueId, targetMealKey) => {
    setDailyPlan(prevPlan => {
        const sourceMeal = prevPlan[sourceMealKey] || [];
        const foodToMove = sourceMeal.find(item => item.uniqueId === foodUniqueId);
        if (!foodToMove) return prevPlan;

        const newSourceMealItems = sourceMeal.filter(item => item.uniqueId !== foodUniqueId);
        const newTargetMealItems = [...(prevPlan[targetMealKey] || []), foodToMove];
        
        return { ...prevPlan, [sourceMealKey]: newSourceMealItems, [targetMealKey]: newTargetMealItems };
    });
    showNotification("Alimento movido!", "success");
  };

  const handleAddMealType = (name) => {
    const newKey = name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    const newOrder = mealTypesConfig.length > 0 ? Math.max(...mealTypesConfig.map(mt => mt.order || 0)) + 1 : 1;
    const newMealType = { key: newKey, name, order: newOrder, isDefault: false };
    const updatedConfig = [...mealTypesConfig, newMealType];
    handleSaveMealConfig(updatedConfig);
  };

  const handleRenameMeal = (mealKey, newName) => {
    const updatedConfig = mealTypesConfig.map(mt => mt.key === mealKey ? { ...mt, name: newName } : mt);
    handleSaveMealConfig(updatedConfig);
  };

  const handleDeleteMeal = async (mealKeyToDelete) => {
    const updatedConfig = mealTypesConfig.filter(mt => mt.key !== mealKeyToDelete);
    await handleSaveMealConfig(updatedConfig);

    setDailyPlan(prevPlan => {
        const { [mealKeyToDelete]: _, ...restOfPlan } = prevPlan;
        return restOfPlan;
    });

    if (userId) {
        const planRef = doc(db, `artifacts/${appId}/users/${userId}/mealPlans/${currentDate}`);
        try {
            await updateDoc(planRef, { [mealKeyToDelete]: deleteField() });
            showNotification("Refeição excluída.", "success");
        } catch (e) {
            console.error("Error deleting meal field from Firestore plan:", e);
        }
    }
  };

  const handleDateChange = (event) => setCurrentDate(event.target.value);
  
  const totals = Object.values(dailyPlan).flat().reduce((acc, item) => {
    acc.calories += (item.calories || 0); acc.protein += (item.protein || 0);
    acc.carbs += (item.carbs || 0); acc.fat += (item.fat || 0);
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const filteredFoodDatabase = FOOD_DATABASE.filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Render Logic
  if (!authReady || isLoading) { 
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <p className="mt-2 text-lg font-semibold text-gray-700">{!authReady ? "Autenticando..." : "Carregando dados..."}</p>
      </div>);
  }
  
  if (error) { 
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 p-4">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Ocorreu um Erro</h2>
          <p className="text-red-600 text-center mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md"> Tentar Novamente </button>
      </div>);
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {notification && (
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white z-[100] flex items-center space-x-2 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          <CheckCircle2 size={20} />
          <span>{notification.message}</span>
        </div>
      )}

      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)}
        userProfile={userProfile}
        nutritionGoals={nutritionGoals}
        onSaveProfile={handleSaveProfile}
        onSaveGoals={handleSaveGoals}
        mealTypesConfig={mealTypesConfig}
        onAddMealType={handleAddMealType}
        showNotification={showNotification}
      />

      <header className="bg-white shadow-md p-4 sticky top-0 z-40">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center text-3xl font-bold text-green-600 mb-2 sm:mb-0"> <Utensils size={36} className="mr-2 text-green-500" /> NutriPlanner </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
                {userId && (<div className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full"> <UserCircle size={16} className="mr-1 text-gray-500" /> {userId.substring(0,10)}... </div>)}
                <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 text-gray-600 hover:text-indigo-600" title="Configurações"><Settings size={20}/></button>
                <div className="flex items-center space-x-1"> <CalendarDays size={20} className="text-green-600" /> <input type="date" value={currentDate} onChange={handleDateChange} className="p-2 border rounded-md text-sm"/> </div>
                <button onClick={savePlan} disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md text-sm disabled:opacity-50 flex items-center">
                    {isSaving ? "Salvando..." : <><Save size={16} className="mr-1" /> Salvar</>}
                </button>
            </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6">
        <DailyTotalsChart totals={totals} goals={nutritionGoals} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Banco de Alimentos</h2>
                <input type="text" placeholder="Buscar alimento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 mb-4 border rounded-lg shadow-sm"/>
                <div className="max-h-[calc(100vh-450px)] overflow-y-auto pr-2">
                    {filteredFoodDatabase.map(food => ( <FoodListItem key={food.id} food={food} onAddFood={handleAddFood} mealTypesConfig={mealTypesConfig} showNotification={showNotification} /> ))}
                </div>
            </div>

            <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-xl">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Plano para {new Date(currentDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                    {mealTypesConfig.length === 0 && <p className="text-center text-gray-500 py-8">Configure os tipos de refeição nas Configurações para começar.</p>}
                    {mealTypesConfig.map(mealConfig => (
                        <MealSection 
                            key={mealConfig.key} 
                            mealConfig={mealConfig}
                            foods={dailyPlan[mealConfig.key] || []} 
                            onRemoveFood={handleRemoveFood} 
                            onUpdateFoodGrams={handleUpdateFoodGrams}
                            onMoveFood={handleMoveFood}
                            mealTypesConfig={mealTypesConfig}
                            onRenameMeal={handleRenameMeal}
                            onDeleteMeal={handleDeleteMeal}
                        />
                    ))}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

export default App;