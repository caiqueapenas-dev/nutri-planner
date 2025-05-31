// src/components/LoginScreen.js
import React, { useState }
from 'react';
import { Utensils, LogIn } from 'lucide-react';

function LoginScreen({ onLogin }) {
  const [inputHandle, setInputHandle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputHandle.trim()) {
      onLogin(inputHandle.trim().toLowerCase()); // Salvar em minúsculas para consistência
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-lime-50 to-emerald-100 p-6">
      <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-md text-center">
        <Utensils size={64} className="mx-auto text-green-500 mb-6" />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Bem-vindo ao NutriPlanner!
        </h1>
        <p className="text-gray-600 mb-8">
          Digite um nome de usuário (identificador) para seu perfil.
          Isso permitirá salvar e carregar suas configurações e planos.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="profileHandle" className="sr-only">
              Nome de Usuário
            </label>
            <input
              type="text"
              id="profileHandle"
              value={inputHandle}
              onChange={(e) => setInputHandle(e.target.value)}
              placeholder="Ex: carlos, meuplano123"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center justify-center space-x-2"
          >
            <LogIn size={20} />
            <span>Acessar ou Criar Perfil</span>
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-8">
          Lembre-se: este nome de usuário é público. Não use informações sensíveis.
        </p>
      </div>
    </div>
  );
}

export default LoginScreen;