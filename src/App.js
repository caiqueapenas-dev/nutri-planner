// src/App.js

// Importações de bibliotecas React e hooks essenciais
import React, { useState, useEffect, useCallback } from 'react';

// Importações de funções do Firebase para inicialização, autenticação e Firestore
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteField } from 'firebase/firestore';

// Importação de ícones da biblioteca lucide-react
import { Save, UserCircle, CalendarDays, Settings, Utensils, CheckCircle2, LogOut, PlusSquare, ChevronsDownUp, ChevronsUpDown } from 'lucide-react'; // Adicionados LogOut, PlusSquare, Chevrons

// Importação dos nossos componentes de UI separados
import DailyTotalsChart from './components/DailyTotalsChart';
import FoodListItem from './components/FoodListItem';
import MealSection from './components/MealSection'; // Este componente também será modificado
import SettingsModal from './components/SettingsModal';
import LoginScreen from './components/LoginScreen';

// Importação da configuração do Firebase que você criou
import { firebaseConfig } from './firebaseConfig.js';

// Inicializa o aplicativo Firebase com a configuração fornecida
const firebaseApp = initializeApp(firebaseConfig);
// Obtém a instância do serviço de Autenticação do Firebase
const auth = getAuth(firebaseApp);
// Obtém a instância do serviço Firestore (banco de dados)
const db = getFirestore(firebaseApp);

// Base de dados de alimentos (poderia vir de um arquivo JSON ou API no futuro)
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

// Configuração inicial dos tipos de refeição padrão
const INITIAL_MEAL_TYPES_CONFIG = [
  { key: 'breakfast', name: 'Café da Manhã', order: 1, isDefault: true },
  { key: 'lunch', name: 'Almoço', order: 2, isDefault: true },
  { key: 'dinner', name: 'Jantar', order: 3, isDefault: true },
  { key: 'snacks', name: 'Lanches', order: 4, isDefault: true },
];

// Níveis de atividade física e seus fatores multiplicadores para cálculo de GCD
const ACTIVITY_LEVELS = {
  sedentary: { label: 'Sedentário (pouco ou nenhum exercício)', factor: 1.2 },
  light: { label: 'Levemente Ativo (exercício leve 1-3 dias/semana)', factor: 1.375 },
  moderate: { label: 'Moderadamente Ativo (exercício moderado 3-5 dias/semana)', factor: 1.55 },
  active: { label: 'Muito Ativo (exercício intenso 6-7 dias/semana)', factor: 1.725 },
  extra_active: { label: 'Extremamente Ativo (exercício muito intenso e trabalho físico)', factor: 1.9 },
};

// Função auxiliar para calcular a idade a partir da data de nascimento
const calculateAge = (birthDate) => { /* ... (código mantido igual) ... */ 
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

// Função auxiliar para calcular a Taxa Metabólica Basal (TMB)
const calculateBMR = (gender, weight, height, age) => { /* ... (código mantido igual) ... */ 
  if (!gender || !weight || !height || !age || parseFloat(weight) <=0 || parseFloat(height) <=0 || parseFloat(age) <=0) return 0;
  return gender === 'male'
    ? (10 * parseFloat(weight)) + (6.25 * parseFloat(height)) - (5 * parseFloat(age)) + 5
    : (10 * parseFloat(weight)) + (6.25 * parseFloat(height)) - (5 * parseFloat(age)) - 161;
};

// Função auxiliar para escalar os nutrientes de um alimento
const scaleNutrients = (food, inputGrams) => { /* ... (código mantido igual) ... */ 
  const baseGrams = food.servingInGrams;
  if (!baseGrams || baseGrams === 0 || !inputGrams || parseFloat(inputGrams) <=0) {
    return { ...food, enteredGrams: parseFloat(inputGrams) || 0, calories: 0, protein: 0, carbs: 0, fat: 0, scaledMicronutrients: {} };
  }
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

// Componente principal da aplicação
function App() {
  // ESTADOS GLOBAIS DO APP
  const [dailyPlan, setDailyPlan] = useState({}); // Armazena os alimentos do plano diário, separados por refeição
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]); // Data selecionada para o plano
  const [firebaseAnonymousUid, setFirebaseAnonymousUid] = useState(null); // UID do Firebase Auth (login anônimo)
  const [currentProfileHandle, setCurrentProfileHandle] = useState(null); // Identificador do perfil do usuário (o "username")
  const [showLoginScreen, setShowLoginScreen] = useState(true); // Controla a exibição da tela de login
  const [isLoading, setIsLoading] = useState(true); // Indica se os dados estão carregando
  const [isSaving, setIsSaving] = useState(false); // Indica se os dados estão sendo salvos
  const [searchTerm, setSearchTerm] = useState(''); // Termo de busca para o banco de alimentos
  const [authReady, setAuthReady] = useState(false); // Indica se a autenticação do Firebase está pronta
  const [error, setError] = useState(null); // Armazena mensagens de erro
  const [notification, setNotification] = useState(null); // Para notificações temporárias
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // Controla o modal de configurações
  const [userProfile, setUserProfile] = useState({ name: '', birthDate: '', gender: 'female', height: 0, weight: 0, activityLevel: 'sedentary' }); // Perfil do usuário
  const [nutritionGoals, setNutritionGoals] = useState({ calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 }); // Metas nutricionais
  const [mealTypesConfig, setMealTypesConfig] = useState([]); // Configuração dos tipos de refeição
  const [newMealNameInput, setNewMealNameInput] = useState(''); // NOVO: Input para nome da nova refeição na página principal
  const [mealOpenStates, setMealOpenStates] = useState({}); // NOVO: Controla o estado (aberto/fechado) de cada seção de refeição

  // EFEITO PARA INICIALIZAR ESTADOS ABERTOS DAS REFEIÇÕES
  useEffect(() => {
    // Quando mealTypesConfig é carregado ou alterado, inicializa os estados de "aberto/fechado"
    // Todas as refeições começam recolhidas (false) por padrão
    const initialOpenStates = {};
    mealTypesConfig.forEach(mt => {
      initialOpenStates[mt.key] = false; // false = recolhido
    });
    setMealOpenStates(initialOpenStates);
  }, [mealTypesConfig]); // Roda quando mealTypesConfig muda


  // EFEITO PARA CARREGAR O profileHandle DO localStorage
  useEffect(() => {
    // Tenta pegar o profileHandle salvo no navegador do usuário
    const savedHandle = localStorage.getItem('nutriPlannerProfileHandle');
    if (savedHandle) { // Se existir um salvo
      setCurrentProfileHandle(savedHandle); // Define como o handle atual
      setShowLoginScreen(false); // Não mostra a tela de login
    } else { // Se não existir
      setShowLoginScreen(true); // Mostra a tela de login
      setIsLoading(false); // Importante para não ficar "carregando" indefinidamente se não houver handle
    }
    // Este efeito não depende de firebaseAnonymousUid, pois deve rodar antes para definir o handle
  }, []); // Roda apenas uma vez quando o app é montado

  // FUNÇÃO PARA LIDAR COM O "LOGIN" DO USUÁRIO (DEFINIÇÃO DO profileHandle)
  const handleLogin = (handle) => {
    const profileHandle = handle.trim().toLowerCase(); // Limpa espaços e converte para minúsculas
    if (profileHandle) { // Se um handle válido foi fornecido
      localStorage.setItem('nutriPlannerProfileHandle', profileHandle); // Salva no localStorage para persistência
      setCurrentProfileHandle(profileHandle); // Define como o handle atual no estado do app
      setShowLoginScreen(false); // Esconde a tela de login
      setIsLoading(true); // Define isLoading para true para carregar dados do novo perfil
      // Os useEffects que dependem de 'currentProfileHandle' (como loadUserData) serão acionados
    }
  };

  // FUNÇÃO PARA LIDAR COM O LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('nutriPlannerProfileHandle'); // Remove o handle do localStorage
    setCurrentProfileHandle(null); // Limpa o handle do estado
    setShowLoginScreen(true); // Mostra a tela de login novamente
    // Reseta os dados do usuário e do plano para um estado limpo
    setUserProfile({ name: '', birthDate: '', gender: 'female', height: 0, weight: 0, activityLevel: 'sedentary' });
    setNutritionGoals({ calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 });
    setMealTypesConfig(INITIAL_MEAL_TYPES_CONFIG); // Pode voltar para o padrão ou carregar se a tela de login permitir novo usuário
    setDailyPlan({}); // Limpa o plano diário
    setError(null); // Limpa erros
    showNotification("Você saiu do seu perfil.", "success");
  };

  // FUNÇÃO PARA EXIBIR NOTIFICAÇÕES
  const showNotification = useCallback((message, type = 'success', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  }, []);
  
  // EFEITO PARA AUTENTICAÇÃO ANÔNIMA COM FIREBASE
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseAnonymousUid(user.uid); // Define o UID anônimo do Firebase
        setAuthReady(true); // Autenticação Firebase está pronta
      } else {
        signInAnonymously(auth) // Tenta login anônimo
          .then((userCredential) => {
            setFirebaseAnonymousUid(userCredential.user.uid);
            setAuthReady(true);
          })
          .catch(e => {
            console.error("Anonymous sign-in failed", e);
            setError("Falha na autenticação Firebase. Verifique as configurações (login anônimo deve estar habilitado).");
            setIsLoading(false); // Para o carregamento se a auth falhar
            setAuthReady(true); // Tentativa de auth concluída (mesmo que falha)
          });
      }
    });
    return () => unsubAuth(); // Limpa o observador ao desmontar
  }, []);

  // EFEITO PARA CARREGAR DADOS DO USUÁRIO (PERFIL, METAS, CONFIG DE REFEIÇÕES)
  useEffect(() => {
    // Só executa se tivermos o UID anônimo E o profileHandle
    if (!firebaseAnonymousUid || !currentProfileHandle) {
        // Se temos profileHandle mas não UID anônimo (auth ainda processando), não faz nada e espera authReady
        // Se não temos profileHandle, a tela de login deve estar ativa.
        return; 
    }

    const loadUserData = async () => {
      // setIsLoading(true); // Já é true ou será definido por loadPlan
      try {
        const userDocRef = doc(db, `profiles/${currentProfileHandle}`); // Novo caminho
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserProfile(data.userProfile || { name: '', birthDate: '', gender: 'female', height: 0, weight: 0, activityLevel: 'sedentary' });
          setNutritionGoals(data.nutritionGoals || { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 });
          setMealTypesConfig(data.mealTypesConfig && data.mealTypesConfig.length > 0 ? data.mealTypesConfig : INITIAL_MEAL_TYPES_CONFIG);
        } else { // Novo perfil, define e salva padrões
          const defaultProfile = { name: currentProfileHandle, birthDate: '', gender: 'female', height: 0, weight: 0, activityLevel: 'sedentary' };
          setUserProfile(defaultProfile);
          const age = calculateAge(defaultProfile.birthDate);
          const bmr = calculateBMR(defaultProfile.gender, defaultProfile.weight, defaultProfile.height, age);
          const activityFactor = ACTIVITY_LEVELS[defaultProfile.activityLevel]?.factor || 1.2;
          const tdee = bmr && bmr > 0 ? (bmr * activityFactor) : 2000;
          const defaultGoals = { 
              calories: Math.round(tdee) || 2000, 
              proteinGrams: Math.round((tdee * 0.20) / 4) || 100, 
              carbsGrams: Math.round((tdee * 0.50) / 4) || 250, 
              fatGrams: Math.round((tdee * 0.30) / 9) || 67 
          };
          setNutritionGoals(defaultGoals);
          setMealTypesConfig(INITIAL_MEAL_TYPES_CONFIG);
          await setDoc(userDocRef, { userProfile: defaultProfile, nutritionGoals: defaultGoals, mealTypesConfig: INITIAL_MEAL_TYPES_CONFIG });
          showNotification(`Perfil "${currentProfileHandle}" criado com configurações padrão!`, "success");
        }
      } catch (e) { 
        console.error("Error loading user data:", e); 
        setError("Falha ao carregar dados do perfil. Verifique as regras de segurança do Firestore.");
        setUserProfile({ name: '', birthDate: '', gender: 'female', height: 0, weight: 0, activityLevel: 'sedentary' });
        setNutritionGoals({ calories: 2000, proteinGrams: 100, carbsGrams: 250, fatGrams: 67 });
        setMealTypesConfig(INITIAL_MEAL_TYPES_CONFIG);
      } finally {
        // O setIsLoading(false) será chamado pelo loadPlan, que depende desses dados
      }
    };
    if (authReady) { // Garante que a auth do Firebase está pronta antes de tentar carregar
        loadUserData();
    }
  }, [firebaseAnonymousUid, currentProfileHandle, authReady, showNotification]); // Adicionado authReady

  // EFEITO PARA SINCRONIZAR A ESTRUTURA DO dailyPlan COM mealTypesConfig
  useEffect(() => {
    setDailyPlan(prevDailyPlan => {
        const newPlanStructure = {};
        mealTypesConfig.forEach(mt => {
            newPlanStructure[mt.key] = prevDailyPlan[mt.key] || [];
        });
        // Remove chaves do dailyPlan que não existem mais em mealTypesConfig
        Object.keys(prevDailyPlan).forEach(key => {
            if (!mealTypesConfig.find(mt => mt.key === key)) {
                // Chave não existe mais, não precisa estar na nova estrutura
            } else if (!newPlanStructure[key]) { // Se por algum motivo não foi adicionada
                 newPlanStructure[key] = prevDailyPlan[key] || [];
            }
        });
        return newPlanStructure;
    });
  }, [mealTypesConfig]);

  // FUNÇÃO PARA CARREGAR O PLANO DIÁRIO
  const loadPlan = useCallback(async (profileHandleForPlan, date) => {
    if (!profileHandleForPlan || !date || mealTypesConfig.length === 0 || !authReady) { 
        setIsLoading(false); return; 
    }
    setIsLoading(true); setError(null);
    try {
      const planRef = doc(db, `profiles/${profileHandleForPlan}/mealPlans/${date}`); // Novo caminho
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
  }, [mealTypesConfig, showNotification, authReady]); // Adicionado authReady

  // EFEITO PARA CARREGAR O PLANO DIÁRIO QUANDO AS DEPENDÊNCIAS MUDAM
  useEffect(() => {
    if (authReady && firebaseAnonymousUid && currentDate && currentProfileHandle && mealTypesConfig.length > 0) {
        loadPlan(currentProfileHandle, currentDate);
    } else if (currentProfileHandle && mealTypesConfig.length === 0) {
        // Se temos profileHandle mas mealTypesConfig ainda não carregou (ou está vazio), não carregue o plano ainda
        // setIsLoading(true); // Mantém carregando até mealTypesConfig estar pronto
    } else if (!currentProfileHandle) {
      setIsLoading(false); // Se não há profileHandle, para de carregar
    }
  }, [authReady, firebaseAnonymousUid, currentDate, loadPlan, currentProfileHandle, mealTypesConfig]);


  // --- HANDLERS (Funções de Lógica para interações do usuário) ---

  // Salva o perfil do usuário, metas nutricionais e configuração de refeições
  const saveUserConfiguration = async () => {
    if (!currentProfileHandle || !firebaseAnonymousUid) return; // Verifica se há identificador e auth

    const userDocRef = doc(db, `profiles/${currentProfileHandle}`); // Novo caminho
    try {
      // Cria um objeto com os dados a serem salvos
      const dataToSave = {
        userProfile,
        nutritionGoals,
        mealTypesConfig // Salva a configuração de refeições junto
      };
      await setDoc(userDocRef, dataToSave, { merge: true }); // Salva, mesclando com dados existentes
      // A notificação de sucesso é geralmente dada pela função chamadora (handleSaveProfile, etc.)
    } catch (e) {
      console.error("Error saving user configuration:", e);
      showNotification("Erro ao salvar configurações gerais.", "error");
    }
  };

  // Handler para salvar o perfil do usuário (chamado pelo SettingsModal)
  const handleSaveProfile = async (newProfile) => {
    setUserProfile(newProfile); // Atualiza estado local
    await saveUserConfiguration(); // Salva no Firestore através da função unificada
    // showNotification("Perfil salvo!", "success"); // Movido para SettingsModal
  };

  // Handler para salvar as metas nutricionais (chamado pelo SettingsModal)
  const handleSaveGoals = async (newGoals) => {
    setNutritionGoals(newGoals); // Atualiza estado local
    await saveUserConfiguration(); // Salva no Firestore
    // showNotification("Metas salvas!", "success"); // Movido para SettingsModal
  };
  
  // Handler para salvar a configuração de tipos de refeição
  const handleSaveMealConfig = async (updatedConfig) => {
    const sortedConfig = updatedConfig.sort((a,b) => (a.order || 0) - (b.order || 0));
    setMealTypesConfig(sortedConfig); // Atualiza estado local
    await saveUserConfiguration(); // Salva no Firestore
    // A notificação será dada pela função que chamou (handleAddMealType, etc)
  };

  // Handler para salvar o plano alimentar diário
  const savePlan = useCallback(async () => {
    if (!currentProfileHandle || !firebaseAnonymousUid) return showNotification("Faça login para salvar.", "error");
    
    setIsSaving(true);
    const planRef = doc(db, `profiles/${currentProfileHandle}/mealPlans/${currentDate}`); // Novo caminho
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
  }, [currentProfileHandle, firebaseAnonymousUid, currentDate, dailyPlan, mealTypesConfig, showNotification]);

  // Handler para adicionar um alimento a uma refeição
  const handleAddFood = (food, mealKey, inputGrams) => { /* ... (código mantido igual) ... */ 
    const scaledFoodItem = scaleNutrients(food, inputGrams);
    setDailyPlan(prevPlan => {
        const currentMealItems = prevPlan[mealKey] || [];
        return { ...prevPlan, [mealKey]: [...currentMealItems, { ...scaledFoodItem, uniqueId: Date.now() + Math.random() }] }
    });
  };

  // Handler para remover um alimento de uma refeição
  const handleRemoveFood = (mealKey, foodUniqueId) => { /* ... (código mantido igual) ... */ 
    setDailyPlan(prevPlan => ({ ...prevPlan, [mealKey]: (prevPlan[mealKey] || []).filter(item => item.uniqueId !== foodUniqueId) }));
  };

  // Handler para atualizar a quantidade em gramas de um alimento
  const handleUpdateFoodGrams = (mealKey, foodUniqueId, newGrams) => { /* ... (código mantido igual) ... */ 
    setDailyPlan(prevPlan => {
        const updatedMealItems = (prevPlan[mealKey] || []).map(item => {
            if (item.uniqueId === foodUniqueId) {
                const originalFoodFromDb = FOOD_DATABASE.find(dbFood => dbFood.id === item.id);
                if (originalFoodFromDb) {
                    return { ...scaleNutrients(originalFoodFromDb, newGrams), uniqueId: item.uniqueId, id: item.id, name: item.name };
                }
            }
            return item;
        }).filter(Boolean);
        return { ...prevPlan, [mealKey]: updatedMealItems };
    });
  };

  // Handler para mover um alimento entre refeições
  const handleMoveFood = (sourceMealKey, foodUniqueId, targetMealKey) => { /* ... (código mantido igual) ... */ 
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

  // Handler para adicionar um novo tipo de refeição (usado pelo botão na página principal E no modal)
  const handleAddMealType = (name) => {
    if (!name || name.trim() === '') {
        showNotification("O nome da refeição não pode ser vazio.", "error");
        return;
    }
    if (mealTypesConfig.some(mt => mt.name.toLowerCase() === name.trim().toLowerCase())) {
        showNotification("Já existe uma refeição com este nome.", "error");
        return;
    }
    const newKey = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    const newOrder = mealTypesConfig.length > 0 ? Math.max(...mealTypesConfig.map(mt => mt.order || 0)) + 1 : 1;
    const newMealType = { key: newKey, name: name.trim(), order: newOrder, isDefault: false };
    const updatedConfig = [...mealTypesConfig, newMealType];
    handleSaveMealConfig(updatedConfig); // Salva a nova configuração (que também atualiza o estado)
    setNewMealNameInput(''); // Limpa o input da página principal se estiver usando ele
    showNotification(`Refeição "${name.trim()}" adicionada!`, "success");
  };

  // Handler para renomear um tipo de refeição
  const handleRenameMeal = (mealKey, newName) => { /* ... (código mantido igual, já chama handleSaveMealConfig) ... */ 
    const updatedConfig = mealTypesConfig.map(mt => mt.key === mealKey ? { ...mt, name: newName.trim() } : mt);
    handleSaveMealConfig(updatedConfig);
  };

  // Handler para excluir um tipo de refeição
  const handleDeleteMeal = async (mealKeyToDelete) => { /* ... (código mantido igual, já chama handleSaveMealConfig) ... */ 
    const updatedConfig = mealTypesConfig.filter(mt => mt.key !== mealKeyToDelete);
    await handleSaveMealConfig(updatedConfig);

    setDailyPlan(prevPlan => {
        const { [mealKeyToDelete]: _, ...restOfPlan } = prevPlan;
        return restOfPlan;
    });

    if (currentProfileHandle && firebaseAnonymousUid) {
        const planRef = doc(db, `profiles/${currentProfileHandle}/mealPlans/${currentDate}`);
        try {
            await updateDoc(planRef, { [mealKeyToDelete]: deleteField() });
            // Notificação já é dada por handleSaveMealConfig ou uma genérica
        } catch (e) {
            if (e.code !== 'not-found') { // Comum se o plano do dia ainda não existe
                 console.error("Error deleting meal field from Firestore plan:", e);
            }
        }
    }
    showNotification("Refeição excluída da configuração.", "success");
  };

  // Handler para mudança de data
  const handleDateChange = (event) => setCurrentDate(event.target.value);

  // FUNÇÕES PARA CONTROLAR EXPANSÃO/RECOLHIMENTO DE TODAS AS REFEIÇÕES
  const toggleAllMeals = (expand) => {
    const newOpenStates = {};
    mealTypesConfig.forEach(mt => {
      newOpenStates[mt.key] = expand;
    });
    setMealOpenStates(newOpenStates);
  };

  // Handler para abrir/fechar UMA seção de refeição específica (chamado por MealSection)
  const handleToggleMealSection = (mealKey) => {
    setMealOpenStates(prev => ({
      ...prev,
      [mealKey]: !prev[mealKey] // Inverte o estado atual da refeição específica
    }));
  };
  
  // Calcula os totais de macronutrientes
  const totals = Object.values(dailyPlan).flat().reduce((acc, item) => { /* ... (código mantido igual) ... */ 
    acc.calories += (item.calories || 0); acc.protein += (item.protein || 0);
    acc.carbs += (item.carbs || 0); acc.fat += (item.fat || 0);
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Filtra a base de alimentos
  const filteredFoodDatabase = FOOD_DATABASE.filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()));


  // --- LÓGICA DE RENDERIZAÇÃO ---

  // 1. Se não há profileHandle (usuário não "logado" com um identificador)
  if (!currentProfileHandle) {
    return <LoginScreen onLogin={handleLogin} />; // Mostra a tela de login
  }

  // 2. Se a autenticação Firebase não estiver pronta OU não tivermos o UID anônimo OU estiver carregando dados
  if (!authReady || !firebaseAnonymousUid || isLoading) { 
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
          {/* Animação de carregamento ou texto simples */}
          <svg className="animate-spin h-10 w-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="ml-3 text-lg font-semibold text-gray-700">
            {!authReady || !firebaseAnonymousUid ? "Autenticando..." : "Carregando dados..."}
          </p>
      </div>);
  }
  
  // 3. Se houver um erro
  if (error) { 
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 p-4">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Ocorreu um Erro</h2>
          <p className="text-red-600 text-center mb-4">{error}</p>
          {/* Botão para tentar recarregar a página */}
          <button onClick={() => window.location.reload()} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md"> Tentar Novamente </button>
      </div>);
  }

  // 4. Renderização principal do aplicativo
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Componente para exibir notificações */}
      {notification && ( /* ... (código mantido igual) ... */ 
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white z-[100] flex items-center space-x-2 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          <CheckCircle2 size={20} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Modal de Configurações */}
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)}
        userProfile={userProfile}
        nutritionGoals={nutritionGoals}
        onSaveProfile={handleSaveProfile} // Passa a função correta
        onSaveGoals={handleSaveGoals}   // Passa a função correta
        mealTypesConfig={mealTypesConfig}
        onAddMealType={handleAddMealType} // Passa a função para adicionar refeição pelo modal
        showNotification={showNotification}
      />

      {/* Cabeçalho da Aplicação */}
      <header className="bg-white shadow-md p-4 sticky top-0 z-40">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center text-3xl font-bold text-green-600 mb-2 sm:mb-0"> 
              <Utensils size={36} className="mr-2 text-green-500" /> NutriPlanner 
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Exibe o profileHandle atual */}
                {currentProfileHandle && (<div className="flex items-center text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full" title={`Perfil atual: ${currentProfileHandle}`}> 
                  <UserCircle size={18} className="mr-2 text-gray-500" /> {currentProfileHandle} 
                </div>)}
                {/* Botão de Configurações */}
                <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 text-gray-600 hover:text-indigo-600" title="Configurações"><Settings size={20}/></button>
                {/* Seletor de Data */}
                <div className="flex items-center space-x-1"> 
                  <CalendarDays size={20} className="text-green-600" /> 
                  <input type="date" value={currentDate} onChange={handleDateChange} className="p-2 border rounded-md text-sm"/> 
                </div>
                {/* Botão de Salvar Plano */}
                <button onClick={savePlan} disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md text-sm disabled:opacity-50 flex items-center">
                    {isSaving ? "Salvando..." : <><Save size={16} className="mr-1" /> Salvar Plano</>}
                </button>
                {/* NOVO: Botão de Logout */}
                <button onClick={handleLogout} className="p-2 text-red-500 hover:text-red-700" title="Sair do Perfil"><LogOut size={20}/></button>
            </div>
        </div>
      </header>
      
      {/* Conteúdo Principal */}
      <main className="container mx-auto p-4 md:p-6">
        {/* Gráfico de Resumo */}
        <DailyTotalsChart totals={totals} goals={nutritionGoals} />

        {/* Layout em Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna da Lista de Alimentos (Banco de Alimentos) */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Banco de Alimentos</h2>
                <input type="text" placeholder="Buscar alimento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 mb-4 border rounded-lg shadow-sm"/>
                <div className="max-h-[calc(100vh-450px)] overflow-y-auto pr-2">
                    {filteredFoodDatabase.map(food => ( 
                      <FoodListItem key={food.id} food={food} onAddFood={handleAddFood} mealTypesConfig={mealTypesConfig} showNotification={showNotification} /> 
                    ))}
                </div>
            </div>

            {/* Coluna do Plano Diário (Refeições) */}
            <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-xl">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Plano para {new Date(currentDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                    
                    {/* NOVO: Botões para Expandir/Recolher Todas e Adicionar Refeição */}
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <button onClick={() => toggleAllMeals(true)} className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-md flex items-center"><ChevronsDownUp size={16} className="mr-1.5"/>Expandir Todas</button>
                        <button onClick={() => toggleAllMeals(false)} className="text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-md flex items-center"><ChevronsUpDown size={16} className="mr-1.5"/>Recolher Todas</button>
                        <div className="flex-grow flex items-center space-x-2">
                            <input 
                                type="text" 
                                value={newMealNameInput}
                                onChange={(e) => setNewMealNameInput(e.target.value)}
                                placeholder="Nome da nova refeição"
                                className="p-2 border rounded-md text-sm flex-grow min-w-[150px]"
                            />
                            <button 
                                onClick={() => handleAddMealType(newMealNameInput)} 
                                className="text-sm bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md flex items-center"
                            >
                                <PlusSquare size={16} className="mr-1.5"/>Adicionar Refeição
                            </button>
                        </div>
                    </div>

                    {/* Mensagem se não houver tipos de refeição configurados */}
                    {mealTypesConfig.length === 0 && <p className="text-center text-gray-500 py-8">Adicione um tipo de refeição para começar.</p>}
                    {/* Mapeia e renderiza cada seção de refeição */}
                    {mealTypesConfig.sort((a,b) => (a.order || 0) - (b.order || 0)).map(mealConfig => (
                        <MealSection 
                            key={mealConfig.key} 
                            mealConfig={mealConfig}
                            foods={dailyPlan[mealConfig.key] || []}
                            isOpen={mealOpenStates[mealConfig.key] || false} // Passa o estado de aberto/fechado
                            onToggleOpen={() => handleToggleMealSection(mealConfig.key)} // Passa a função para alternar
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