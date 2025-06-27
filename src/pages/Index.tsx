
const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Bem-vindo ao seu Projeto
        </h1>
        <p className="text-gray-600 mb-6">
          Seu projeto foi limpo e está pronto para um novo desenvolvimento.
        </p>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">
              ✅ Banco de dados limpo
            </p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              🔧 Secrets do Supabase mantidos
            </p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-purple-700 text-sm">
              🚀 Pronto para começar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
