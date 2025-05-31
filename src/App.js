// src/App.js

// Importações de bibliotecas React e hooks essenciais
import React, { useState, useEffect, useCallback } from 'react';

// Importações de funções do Firebase para inicialização, autenticação e Firestore
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, deleteField } from 'firebase/firestore';

// Importação de ícones da biblioteca lucide-react
import { Save, UserCircle, CalendarDays, Settings, Utensils, CheckCircle2 } from 'lucide-react';

// Importação dos nossos componentes de UI separados
import DailyTotalsChart from './components/DailyTotalsChart';
import FoodListItem from './components/FoodListItem';
import MealSection from './components/MealSection';
import SettingsModal from './components/SettingsModal';
import LoginScreen from './components/LoginScreen'; // Componente para a tela de login/identificação

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
const calculateAge = (birthDate) => {
  if (!birthDate) return 0; // Retorna 0 se não houver data de nascimento
  const today = new Date(); // Data atual
  const birth = new Date(birthDate); // Converte a string da data de nascimento para objeto Date
  let age = today.getFullYear() - birth.getFullYear(); // Diferença inicial em anos
  const monthDiff = today.getMonth() - birth.getMonth(); // Diferença em meses
  // Ajusta a idade se o aniversário deste ano ainda não ocorreu
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age; // Retorna a idade calculada
};

// Função auxiliar para calcular a Taxa Metabólica Basal (TMB) usando a fórmula de Mifflin-St Jeor
const calculateBMR = (gender, weight, height, age) => {
  // Valida as entradas para evitar erros de cálculo
  if (!gender || !weight || !height || !age || parseFloat(weight) <=0 || parseFloat(height) <=0 || parseFloat(age) <=0) return 0;
  // Aplica a fórmula de Mifflin-St Jeor baseada no gênero
  return gender === 'male'
    ? (10 * parseFloat(weight)) + (6.25 * parseFloat(height)) - (5 * parseFloat(age)) + 5
    : (10 * parseFloat(weight)) + (6.25 * parseFloat(height)) - (5 * parseFloat(age)) - 161;
};

// Função auxiliar para escalar os nutrientes de um alimento com base na quantidade em gramas inserida
const scaleNutrients = (food, inputGrams) => {
  const baseGrams = food.servingInGrams; // Gramas da porção de referência do alimento
  // Valida as entradas; se inválidas, retorna nutrientes zerados
  if (!baseGrams || baseGrams === 0 || !inputGrams || parseFloat(inputGrams) <=0) {
    return { ...food, enteredGrams: parseFloat(inputGrams) || 0, calories: 0, protein: 0, carbs: 0, fat: 0, scaledMicronutrients: {} };
  }
  const factor = parseFloat(inputGrams) / baseGrams; // Fator de escala
  // Cria um novo objeto com os nutrientes escalados
  const scaledFood = {
      ...food, // Mantém as propriedades originais do alimento (nome, id, etc.)
      enteredGrams: parseFloat(inputGrams), // Armazena a quantidade em gramas inserida
      // Calcula macronutrientes escalados
      calories: (food.calories || 0) * factor,
      protein: (food.protein || 0) * factor,
      carbs: (food.carbs || 0) * factor,
      fat: (food.fat || 0) * factor,
      scaledMicronutrients: {}, // Objeto para micronutrientes escalados
  };
  // Escala os micronutrientes se existirem
  if (food.micronutrients) {
      scaledFood.scaledMicronutrients = Object.fromEntries(
          Object.entries(food.micronutrients).map(([key, valueStr]) => {
              const numericPart = parseFloat(valueStr); // Tenta extrair a parte numérica do valor do micronutriente
              if (!isNaN(numericPart)) { // Se for um número válido
                  const unitAndRest = valueStr.toString().substring(numericPart.toString().length); // Pega a unidade e o resto da string
                  return [key, `${(numericPart * factor).toFixed(1)}${unitAndRest}`]; // Retorna o valor escalado com a unidade
              }
              return [key, valueStr]; // Se não for numérico, mantém o valor original
          })
      );
  }
  return scaledFood; // Retorna o objeto do alimento com nutrientes escalados
};

// Componente principal da aplicação
function App() {
  // Estado para o plano alimentar diário (objetos de alimentos por tipo de refeição)
  const [dailyPlan, setDailyPlan] = useState({});
  // Estado para a data atual selecionada para o plano
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  // Estado para o UID do usuário autenticado anonimamente pelo Firebase
  const [firebaseAnonymousUid, setFirebaseAnonymousUid] = useState(null);
  // Estado para o identificador de perfil escolhido pelo usuário (o "username")
  const [currentProfileHandle, setCurrentProfileHandle] = useState(null);
  // Estado para controlar a exibição da tela de login/identificação
  const [showLoginScreen, setShowLoginScreen] = useState(true);
  // Estado para indicar se os dados estão sendo carregados
  const [isLoading, setIsLoading] = useState(true);
  // Estado para indicar se os dados estão sendo salvos
  const [isSaving, setIsSaving] = useState(false);
  // Estado para o termo de busca na lista de alimentos
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para indicar se a autenticação do Firebase está pronta
  const [authReady, setAuthReady] = useState(false);
  // Estado para armazenar mensagens de erro a serem exibidas ao usuário
  const [error, setError] = useState(null);
  // Estado para exibir notificações temporárias (sucesso, erro)
  const [notification, setNotification] = useState(null);
  // Estado para controlar a visibilidade do modal de configurações
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Estado para o perfil do usuário (dados pessoais)
  const [userProfile, setUserProfile] = useState({ name: '', birthDate: '', gender: 'female', height: 0, weight: 0, activityLevel: 'sedentary' });
  // Estado para as metas nutricionais do usuário
  const [nutritionGoals, setNutritionGoals] = useState({ calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 });
  // Estado para a configuração dos tipos de refeição (nomes, ordem)
  const [mealTypesConfig, setMealTypesConfig] = useState([]);

  // Hook useEffect para carregar o 'profileHandle' salvo no localStorage ao iniciar o app
  useEffect(() => {
    const savedHandle = localStorage.getItem('nutriPlannerProfileHandle'); // Tenta pegar o handle salvo
    if (savedHandle) { // Se encontrou um handle salvo
      setCurrentProfileHandle(savedHandle); // Define como o handle atual
      setShowLoginScreen(false); // Não mostra a tela de login
    } else {
      setShowLoginScreen(true); // Se não encontrou, precisa mostrar a tela de login
    }
  }, []); // Roda apenas uma vez, quando o componente é montado

  // Função para lidar com o "login" (quando o usuário insere o profileHandle)
  const handleLogin = (handle) => {
    const profileHandle = handle.trim().toLowerCase(); // Remove espaços e converte para minúsculas
    if (profileHandle) { // Se o handle não estiver vazio
      localStorage.setItem('nutriPlannerProfileHandle', profileHandle); // Salva no localStorage
      setCurrentProfileHandle(profileHandle); // Define como o handle atual
      setShowLoginScreen(false); // Esconde a tela de login
      // Os useEffects que dependem de `currentProfileHandle` serão acionados para carregar os dados.
    }
  };

  // Hook useCallback para criar uma função de notificação memorizada (evita recriações desnecessárias)
  const showNotification = useCallback((message, type = 'success', duration = 3000) => {
    setNotification({ message, type }); // Define a notificação
    setTimeout(() => setNotification(null), duration); // Limpa a notificação após 'duration'
  }, []); // Não tem dependências, então só é criada uma vez
  
  // Hook useEffect para lidar com a autenticação anônima do Firebase
  useEffect(() => {
    // Observador do estado de autenticação do Firebase
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) { // Se um usuário (anônimo ou outro) estiver logado
        setFirebaseAnonymousUid(user.uid); // Salva o UID anônimo do Firebase
        setAuthReady(true); // Indica que a autenticação está pronta
      } else { // Se não houver usuário logado
        // Tenta fazer login anonimamente
        signInAnonymously(auth)
          .then((userCredential) => {
            setFirebaseAnonymousUid(userCredential.user.uid); // Salva o UID após login anônimo bem-sucedido
            setAuthReady(true); // Indica que a autenticação está pronta
          })
          .catch(e => { // Se o login anônimo falhar
            console.error("Anonymous sign-in failed", e);
            setError("Falha na autenticação. Verifique as configurações do Firebase (login anônimo deve estar habilitado).");
            setIsLoading(false); // Para de carregar, pois não há como prosseguir sem autenticação
            setAuthReady(true); // Processo de auth tentado
          });
      }
    });
    return () => unsubAuth(); // Limpa o observador ao desmontar o componente
  }, []); // Roda apenas uma vez

  // Hook useEffect para carregar os dados do usuário (perfil, metas, configuração de refeições)
  useEffect(() => {
    // Só roda se tivermos um UID anônimo do Firebase E um profileHandle definido
    if (!firebaseAnonymousUid || !currentProfileHandle) {
      if (currentProfileHandle) setIsLoading(false); // Se temos handle mas não uid, paramos o loading para não ficar preso
      return;
    }

    const loadUserData = async () => {
      setIsLoading(true); // Começa a carregar os dados
      try {
        // Caminho para o documento que armazena todas as configurações e perfil do usuário
        // Usa a nova estrutura: profiles/{profileHandle}
        const userDocRef = doc(db, `profiles/${currentProfileHandle}`);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) { // Se o documento do usuário existir
          const data = userDocSnap.data();
          // Define os estados com os dados carregados, usando valores padrão se algum campo não existir
          setUserProfile(data.userProfile || { name: '', birthDate: '', gender: 'female', height: 0, weight: 0, activityLevel: 'sedentary' });
          setNutritionGoals(data.nutritionGoals || { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 });
          setMealTypesConfig(data.mealTypesConfig && data.mealTypesConfig.length > 0 ? data.mealTypesConfig : INITIAL_MEAL_TYPES_CONFIG);
        } else { // Se o documento do usuário não existir (primeiro acesso com este profileHandle)
          // Define valores padrão para tudo
          const defaultProfile = { name: '', birthDate: '', gender: 'female', height: 0, weight: 0, activityLevel: 'sedentary' };
          setUserProfile(defaultProfile);
          const age = calculateAge(defaultProfile.birthDate);
          const bmr = calculateBMR(defaultProfile.gender, defaultProfile.weight, defaultProfile.height, age);
          const activityFactor = ACTIVITY_LEVELS[defaultProfile.activityLevel]?.factor || 1.2;
          const tdee = bmr ? (bmr * activityFactor) : 2000; // Valor padrão para TDEE
          setNutritionGoals({ 
              calories: Math.round(tdee) || 2000, 
              proteinGrams: Math.round((tdee * 0.20) / 4) || 100, 
              carbsGrams: Math.round((tdee * 0.50) / 4) || 250, 
              fatGrams: Math.round((tdee * 0.30) / 9) || 67 
          });
          setMealTypesConfig(INITIAL_MEAL_TYPES_CONFIG);
          // Salva esses dados padrão no Firestore para este novo profileHandle
          await setDoc(userDocRef, {
            userProfile: defaultProfile,
            nutritionGoals: { /* o mesmo que foi setado acima */
                calories: Math.round(tdee) || 2000, 
                proteinGrams: Math.round((tdee * 0.20) / 4) || 100, 
                carbsGrams: Math.round((tdee * 0.50) / 4) || 250, 
                fatGrams: Math.round((tdee * 0.30) / 9) || 67 
            },
            mealTypesConfig: INITIAL_MEAL_TYPES_CONFIG
          });
        }
      } catch (e) { 
        console.error("Error loading user data:", e); 
        setError("Falha ao carregar dados do usuário. Verifique as regras de segurança do Firestore.");
        // Fallback para configurações padrão em caso de erro
        setUserProfile({ name: '', birthDate: '', gender: 'female', height: 0, weight: 0, activityLevel: 'sedentary' });
        setNutritionGoals({ calories: 2000, proteinGrams: 100, carbsGrams: 250, fatGrams: 67 });
        setMealTypesConfig(INITIAL_MEAL_TYPES_CONFIG);
      } finally {
        // setIsLoading(false); // O carregamento do plano diário definirá o isLoading final
      }
    };
    loadUserData();
  }, [firebaseAnonymousUid, currentProfileHandle]); // Roda quando firebaseAnonymousUid ou currentProfileHandle mudam

  // Hook useEffect para ajustar a estrutura do dailyPlan com base na mealTypesConfig
  useEffect(() => {
    setDailyPlan(prevDailyPlan => {
        const newPlanStructure = {};
        // Itera sobre a configuração de tipos de refeição ATUAL
        mealTypesConfig.forEach(mt => {
            // Mantém os dados da refeição se já existiam, ou inicializa como array vazio
            newPlanStructure[mt.key] = prevDailyPlan[mt.key] || [];
        });
        return newPlanStructure; // Retorna a nova estrutura do plano diário
    });
  }, [mealTypesConfig]); // Roda sempre que mealTypesConfig mudar

  // Hook useCallback para carregar o plano alimentar diário do Firestore
  const loadPlan = useCallback(async (profileHandleForPlan, date) => {
    // Só roda se tivermos um profileHandle, data e configuração de refeições
    if (!profileHandleForPlan || !date || mealTypesConfig.length === 0) { 
        setIsLoading(false); // Para de carregar se os pré-requisitos não forem atendidos
        return; 
    }
    setIsLoading(true); // Indica que o carregamento do plano começou
    setError(null); // Limpa erros anteriores
    try {
      // Caminho para o documento do plano diário, usando a nova estrutura
      const planRef = doc(db, `profiles/${profileHandleForPlan}/mealPlans/${date}`);
      const docSnap = await getDoc(planRef); // Busca o documento
      const loadedData = docSnap.exists() ? docSnap.data() : {}; // Pega os dados se o documento existir
      const newPlan = {};
      // Garante que a estrutura do plano carregado corresponda à configuração de refeições atual
      mealTypesConfig.forEach(mt => {
          newPlan[mt.key] = (loadedData[mt.key] || []).map(item => {
            // Valida e escala os nutrientes dos itens carregados, se necessário
            if (item.enteredGrams && typeof item.calories === 'number') return item; // Item já está no formato correto
            const foodBase = FOOD_DATABASE.find(f => f.id === item.id); // Encontra o alimento base
            if (foodBase && item.enteredGrams) return { ...scaleNutrients(foodBase, item.enteredGrams), uniqueId: item.uniqueId };
            return { ...item, calories: 0, protein: 0, carbs: 0, fat: 0 }; // Fallback para item inválido
          });
      });
      setDailyPlan(newPlan); // Define o plano diário carregado
    } catch (err) { 
        console.error("Erro ao carregar plano:", err);
        setError("Não foi possível carregar o plano do dia."); 
        showNotification("Erro ao carregar plano.", 'error'); 
    } finally { 
        setIsLoading(false); // Finaliza o carregamento, seja sucesso ou falha
    }
  }, [mealTypesConfig, showNotification]); // Depende da configuração de refeições e da função de notificação

  // Hook useEffect para carregar o plano diário quando as dependências mudam
  useEffect(() => {
    // Só carrega o plano se a autenticação estiver pronta, tivermos UID anônimo, data e profileHandle
    if (authReady && firebaseAnonymousUid && currentDate && currentProfileHandle) {
        loadPlan(currentProfileHandle, currentDate);
    } else if (authReady && !currentProfileHandle) {
        // Se autenticado mas sem profile handle, a tela de login deve estar visível. Não há plano para carregar.
        setIsLoading(false); 
    }
  }, [authReady, firebaseAnonymousUid, currentDate, loadPlan, currentProfileHandle]); // Roda quando estas dependências mudam


  // --- HANDLERS (Funções de Lógica para interações do usuário) ---

  // Salva o perfil do usuário, metas nutricionais e configuração de refeições em um único documento
  const saveUserConfiguration = async () => {
    if (!currentProfileHandle) return showNotification("Não foi possível salvar: identificador de perfil não definido.", "error");
    if (!firebaseAnonymousUid) return showNotification("Não foi possível salvar: usuário não autenticado.", "error");

    const userDocRef = doc(db, `profiles/${currentProfileHandle}`);
    try {
      await setDoc(userDocRef, {
        userProfile,
        nutritionGoals,
        mealTypesConfig
      }, { merge: true }); // Usa merge: true para não sobrescrever outros campos se existirem (ex: subcoleções)
      // A notificação de sucesso já é dada no modal de configurações.
    } catch (e) {
      console.error("Error saving user configuration:", e);
      showNotification("Erro ao salvar configurações gerais.", "error");
    }
  };

  // Handler para salvar o perfil do usuário (chamado pelo SettingsModal)
  const handleSaveProfile = async (newProfile) => {
    setUserProfile(newProfile); // Atualiza o estado local imediatamente
    await saveUserConfiguration(); // Chama a função unificada para salvar
  };

  // Handler para salvar as metas nutricionais (chamado pelo SettingsModal)
  const handleSaveGoals = async (newGoals) => {
    setNutritionGoals(newGoals); // Atualiza o estado local imediatamente
    await saveUserConfiguration(); // Chama a função unificada para salvar
  };
  
  // Handler para salvar a configuração de tipos de refeição (quando adiciona, renomeia, exclui)
  const handleSaveMealConfig = async (updatedConfig) => {
    const sortedConfig = updatedConfig.sort((a,b) => (a.order || 0) - (b.order || 0));
    setMealTypesConfig(sortedConfig); // Atualiza o estado local imediatamente
    await saveUserConfiguration(); // Chama a função unificada para salvar
  };

  // Handler para salvar o plano alimentar diário
  const savePlan = useCallback(async () => {
    if (!currentProfileHandle) return showNotification("Não foi possível salvar: identificador de perfil não definido.", "error");
    if (!firebaseAnonymousUid) return showNotification("Não foi possível salvar: usuário não autenticado.", "error");
    
    setIsSaving(true); // Indica que o salvamento começou
    // Caminho para o documento do plano diário na subcoleção 'mealPlans'
    const planRef = doc(db, `profiles/${currentProfileHandle}/mealPlans/${currentDate}`);
    try {
      const planToSave = {};
      // Garante que apenas os tipos de refeição configurados sejam salvos
      mealTypesConfig.forEach(mt => {
        planToSave[mt.key] = (dailyPlan[mt.key] || []).map(item => ({ // Mapeia para um formato limpo
          id: item.id, name: item.name, enteredGrams: item.enteredGrams,
          calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat,
          scaledMicronutrients: item.scaledMicronutrients || {}, uniqueId: item.uniqueId,
        }));
      });
      await setDoc(planRef, planToSave); // Salva o documento do plano
      showNotification("Plano salvo com sucesso!", 'success');
    } catch (err) { 
      console.error("Erro ao salvar plano:", err); 
      showNotification("Erro ao salvar plano.", 'error'); 
    } finally { 
      setIsSaving(false); // Finaliza o estado de salvamento
    }
  }, [currentProfileHandle, firebaseAnonymousUid, currentDate, dailyPlan, mealTypesConfig, showNotification]); // Dependências do useCallback

  // Handler para adicionar um alimento a uma refeição
  const handleAddFood = (food, mealKey, inputGrams) => {
    const scaledFoodItem = scaleNutrients(food, inputGrams); // Calcula os nutrientes escalados
    setDailyPlan(prevPlan => { // Atualiza o estado do dailyPlan
        const currentMealItems = prevPlan[mealKey] || []; // Pega os itens da refeição ou um array vazio
        return { 
          ...prevPlan, 
          [mealKey]: [...currentMealItems, { ...scaledFoodItem, uniqueId: Date.now() + Math.random() }] // Adiciona o novo item com um ID único
        };
    });
  };

  // Handler para remover um alimento de uma refeição
  const handleRemoveFood = (mealKey, foodUniqueId) => {
    setDailyPlan(prevPlan => ({
      ...prevPlan,
      [mealKey]: (prevPlan[mealKey] || []).filter(item => item.uniqueId !== foodUniqueId) // Filtra o item a ser removido
    }));
  };

  // Handler para atualizar a quantidade em gramas de um alimento na refeição
  const handleUpdateFoodGrams = (mealKey, foodUniqueId, newGrams) => {
    setDailyPlan(prevPlan => {
        const updatedMealItems = (prevPlan[mealKey] || []).map(item => {
            if (item.uniqueId === foodUniqueId) { // Encontra o item a ser atualizado
                const originalFoodFromDb = FOOD_DATABASE.find(dbFood => dbFood.id === item.id); // Pega os dados base do alimento
                if (originalFoodFromDb) {
                    // Re-escala os nutrientes com a nova quantidade e mantém o ID único
                    return { ...scaleNutrients(originalFoodFromDb, newGrams), uniqueId: item.uniqueId, id: item.id, name: item.name };
                }
            }
            return item; // Retorna o item inalterado se não for o alvo
        }).filter(Boolean); // Remove itens que possam ter se tornado nulos (caso de erro)
        return { ...prevPlan, [mealKey]: updatedMealItems };
    });
  };

  // Handler para mover um alimento de uma refeição para outra
  const handleMoveFood = (sourceMealKey, foodUniqueId, targetMealKey) => {
    setDailyPlan(prevPlan => {
        const sourceMeal = prevPlan[sourceMealKey] || [];
        const foodToMove = sourceMeal.find(item => item.uniqueId === foodUniqueId); // Encontra o alimento a ser movido
        if (!foodToMove) return prevPlan; // Se não encontrar, não faz nada

        const newSourceMealItems = sourceMeal.filter(item => item.uniqueId !== foodUniqueId); // Remove da refeição de origem
        const newTargetMealItems = [...(prevPlan[targetMealKey] || []), foodToMove]; // Adiciona à refeição de destino
        
        return { ...prevPlan, [sourceMealKey]: newSourceMealItems, [targetMealKey]: newTargetMealItems };
    });
    showNotification("Alimento movido!", "success");
  };

  // Handler para adicionar um novo tipo de refeição (via SettingsModal)
  const handleAddMealType = (name) => {
    const newKey = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now(); // Cria uma chave única e sanitizada
    const newOrder = mealTypesConfig.length > 0 ? Math.max(...mealTypesConfig.map(mt => mt.order || 0)) + 1 : 1; // Define a ordem
    const newMealType = { key: newKey, name: name.trim(), order: newOrder, isDefault: false }; // Cria o novo tipo de refeição
    const updatedConfig = [...mealTypesConfig, newMealType]; // Adiciona à configuração existente
    handleSaveMealConfig(updatedConfig); // Salva a nova configuração
    // O useEffect que depende de mealTypesConfig cuidará de adicionar a nova chave ao dailyPlan
  };

  // Handler para renomear um tipo de refeição
  const handleRenameMeal = (mealKey, newName) => {
    const updatedConfig = mealTypesConfig.map(mt => mt.key === mealKey ? { ...mt, name: newName.trim() } : mt); // Atualiza o nome na configuração
    handleSaveMealConfig(updatedConfig); // Salva
  };

  // Handler para excluir um tipo de refeição
  const handleDeleteMeal = async (mealKeyToDelete) => {
    // 1. Atualiza a configuração local e salva no Firestore
    const updatedConfig = mealTypesConfig.filter(mt => mt.key !== mealKeyToDelete);
    await handleSaveMealConfig(updatedConfig); // Espera a configuração ser salva

    // 2. Remove a chave da refeição do estado local `dailyPlan`
    setDailyPlan(prevPlan => {
        const { [mealKeyToDelete]: _, ...restOfPlan } = prevPlan; // Técnica de desestruturação para remover uma chave
        return restOfPlan;
    });

    // 3. Remove o campo da refeição do documento do plano diário ATUAL no Firestore
    if (currentProfileHandle && firebaseAnonymousUid) {
        const planRef = doc(db, `profiles/${currentProfileHandle}/mealPlans/${currentDate}`);
        try {
            await updateDoc(planRef, { [mealKeyToDelete]: deleteField() }); // Usa deleteField() para remover o campo
            showNotification("Refeição excluída com sucesso.", "success");
        } catch (e) {
            // Se o documento do plano do dia não existir, updateDoc falhará. Isso é esperado em alguns casos.
            if (e.code === 'not-found') {
                showNotification("Refeição removida da configuração (nenhum plano salvo para este dia).", "success");
            } else {
                console.error("Error deleting meal field from Firestore plan:", e);
                showNotification("Erro ao remover refeição do plano salvo no banco de dados.", "error");
            }
        }
    } else {
        showNotification("Refeição excluída da configuração.", "success");
    }
  };

  // Handler para mudança de data no seletor de data
  const handleDateChange = (event) => setCurrentDate(event.target.value);
  
  // Calcula os totais de macronutrientes do plano diário atual
  const totals = mealTypesConfig.reduce((acc, mealConfig) => {
    const mealKey = mealConfig.key; // Pega a chave da refeição da configuração
    if (dailyPlan[mealKey]) { // Se houver dados para esta refeição no plano
        dailyPlan[mealKey].forEach(item => { // Itera sobre os alimentos da refeição
            acc.calories += (item.calories || 0); 
            acc.protein += (item.protein || 0);
            acc.carbs += (item.carbs || 0); 
            acc.fat += (item.fat || 0);
        });
    }
    return acc; // Retorna o acumulador
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 }); // Objeto inicial para o acumulador

  // Filtra a base de alimentos com base no termo de busca
  const filteredFoodDatabase = FOOD_DATABASE.filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()));


  // --- Lógica de Renderização ---

  // 1. Se não há profileHandle, mostra a tela de login
  if (!currentProfileHandle) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // 2. Se a autenticação não estiver pronta ou os dados estiverem carregando, mostra tela de carregamento
  // Consideramos 'authReady' estar verdadeiramente pronto APÓS o currentProfileHandle estar definido E o firebaseAnonymousUid também.
  if (!authReady || !firebaseAnonymousUid || isLoading) { 
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <p className="mt-2 text-lg font-semibold text-gray-700">{!authReady || !firebaseAnonymousUid ? "Autenticando..." : "Carregando dados..."}</p>
      </div>);
  }
  
  // 3. Se houver um erro, mostra a tela de erro
  if (error) { 
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 p-4">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Ocorreu um Erro</h2>
          <p className="text-red-600 text-center mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md"> Tentar Novamente </button>
      </div>);
  }

  // 4. Se tudo estiver OK, renderiza a aplicação principal
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Componente para exibir notificações */}
      {notification && (
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white z-[100] flex items-center space-x-2 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          <CheckCircle2 size={20} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Modal de Configurações (controlado pelo estado isSettingsModalOpen) */}
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

      {/* Cabeçalho da Aplicação */}
      <header className="bg-white shadow-md p-4 sticky top-0 z-40">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
            {/* Título e Ícone */}
            <div className="flex items-center text-3xl font-bold text-green-600 mb-2 sm:mb-0"> 
              <Utensils size={36} className="mr-2 text-green-500" /> NutriPlanner 
            </div>
            {/* Controles do Cabeçalho */}
            <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Exibe o UID anônimo do Firebase (apenas para debug ou informação) */}
                {firebaseAnonymousUid && (<div className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full" title={`UID Anônimo: ${firebaseAnonymousUid}`}> 
                  <UserCircle size={16} className="mr-1 text-gray-500" /> {currentProfileHandle} 
                </div>)}
                {/* Botão para abrir o modal de configurações */}
                <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 text-gray-600 hover:text-indigo-600" title="Configurações"><Settings size={20}/></button>
                {/* Seletor de Data */}
                <div className="flex items-center space-x-1"> 
                  <CalendarDays size={20} className="text-green-600" /> 
                  <input type="date" value={currentDate} onChange={handleDateChange} className="p-2 border rounded-md text-sm"/> 
                </div>
                {/* Botão para Salvar Plano */}
                <button onClick={savePlan} disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md text-sm disabled:opacity-50 flex items-center">
                    {isSaving ? "Salvando..." : <><Save size={16} className="mr-1" /> Salvar</>}
                </button>
            </div>
        </div>
      </header>
      
      {/* Conteúdo Principal da Aplicação */}
      <main className="container mx-auto p-4 md:p-6">
        {/* Gráfico de Resumo Nutricional */}
        <DailyTotalsChart totals={totals} goals={nutritionGoals} />

        {/* Layout em Grid: Lista de Alimentos e Plano Diário */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna da Lista de Alimentos */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Banco de Alimentos</h2>
                {/* Campo de Busca */}
                <input type="text" placeholder="Buscar alimento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 mb-4 border rounded-lg shadow-sm"/>
                {/* Container da Lista de Alimentos com Scroll */}
                <div className="max-h-[calc(100vh-450px)] overflow-y-auto pr-2"> {/* Altura ajustada para scroll */}
                    {/* Mapeia e renderiza cada alimento filtrado */}
                    {filteredFoodDatabase.map(food => ( 
                      <FoodListItem key={food.id} food={food} onAddFood={handleAddFood} mealTypesConfig={mealTypesConfig} showNotification={showNotification} /> 
                    ))}
                </div>
            </div>

            {/* Coluna do Plano Diário */}
            <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-xl">
                    {/* Título com a Data Atual Formatada */}
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">Plano para {new Date(currentDate + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                    {/* Mensagem se não houver tipos de refeição configurados */}
                    {mealTypesConfig.length === 0 && <p className="text-center text-gray-500 py-8">Configure os tipos de refeição nas Configurações para começar.</p>}
                    {/* Mapeia e renderiza cada seção de refeição com base na configuração */}
                    {mealTypesConfig.sort((a,b) => (a.order || 0) - (b.order || 0)).map(mealConfig => (
                        <MealSection 
                            key={mealConfig.key} 
                            mealConfig={mealConfig}
                            foods={dailyPlan[mealConfig.key] || []} // Passa os alimentos da refeição específica
                            onRemoveFood={handleRemoveFood} 
                            onUpdateFoodGrams={handleUpdateFoodGrams}
                            onMoveFood={handleMoveFood}
                            mealTypesConfig={mealTypesConfig} // Passa a configuração de todas as refeições (para mover)
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

// Exporta o componente App como padrão
export default App;