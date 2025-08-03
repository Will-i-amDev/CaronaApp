# 🚗 CaronaApp - Aplicativo de Carona comunitário

Um aplicativo mobile desenvolvido em React Native para conectar passageiros e motoristas, permitindo solicitar e oferecer caronas de forma simples e eficiente.

## 📱 Sobre o Projeto

O CaronaApp é um projeto desenvolvido como parte da disciplina de **Programação para Dispositivos Móveis em Android** do curso de Engenharia de Software. O objetivo é criar uma aplicação completa que demonstre os conceitos aprendidos em React Native, incluindo navegação, persistência de dados, integração com APIs e desenvolvimento de interfaces móveis.

### Funcionalidades Principais

- 🔐 **Sistema de Autenticação**: Login e registro de usuários (passageiros e motoristas)
- 📍 **Geolocalização**: Detecção automática da localização atual
- 🗺️ **Mapas Interativos**: Visualização de rotas e pontos de partida/destino
- 🚗 **Solicitação de Caronas**: Interface para passageiros solicitarem caronas
- 👨‍💼 **Gestão de Motoristas**: Sistema para motoristas gerenciarem corridas
- 💾 **Persistência Local**: Armazenamento de dados do usuário e sessão
- 🌐 **API REST**: Backend completo com banco de dados SQLite

## 🛠️ Tecnologias Utilizadas

### Frontend (Mobile App)
- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma de desenvolvimento e build
- **React Navigation** - Navegação entre telas
- **React Native Maps** - Integração com mapas
- **Expo Location** - Serviços de geolocalização
- **AsyncStorage** - Persistência local de dados
- **Axios** - Cliente HTTP para requisições

### Backend (API)
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite3** - Banco de dados relacional
- **CORS** - Middleware para requisições cross-origin

## 📁 Estrutura do Projeto

```
Carona-mobile/
├── App.js                          # Componente principal
├── package.json                    # Dependências do frontend
├── src/
│   ├── components/                 # Componentes reutilizáveis
│   │   └── mybutton/
│   ├── constants/                  # Constantes e configurações
│   │   ├── api.js                 # Configuração da API
│   │   ├── icons.js               # Ícones e imagens
│   │   └── dados.js               # Dados estáticos
│   ├── screens/                    # Telas da aplicação
│   │   ├── login/                 # Tela de login
│   │   ├── dashboard/             # Dashboard principal
│   │   ├── passenger/             # Interface do passageiro
│   │   ├── ride/                  # Lista de corridas
│   │   └── ...                    # Outras telas
│   └── routes.js                  # Configuração de navegação

servidor-api/
├── package.json                    # Dependências do backend
├── src/
│   ├── controllers/               # Controladores da API
│   │   ├── controller.auth.js     # Autenticação
│   │   └── controller.ride.js     # Gestão de corridas
│   ├── services/                  # Lógica de negócio
│   │   ├── service.auth.js
│   │   └── service.ride.js
│   ├── repositories/              # Acesso ao banco de dados
│   │   ├── repository.auth.js
│   │   └── repository.ride.js
│   ├── database/                  # Configuração do banco
│   │   ├── sqlite.js
│   │   ├── init-database.js
│   │   └── script-database.sql
│   └── index.js                   # Servidor Express
```

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (para emulador Android) ou Xcode (para iOS)

### Frontend (App Mobile)

1. **Instalar dependências:**
```bash
cd Carona-mobile
npm install
```

2. **Iniciar o projeto:**
```bash
npm start
# ou
expo start
```

3. **Executar no dispositivo/emulador:**
- Pressione `a` para abrir no Android
- Pressione `i` para abrir no iOS
- Escaneie o QR code com o app Expo Go

### Backend (API)

1. **Instalar dependências:**
```bash
cd servidor-api
npm install
```

2. **Inicializar o banco de dados:**
```bash
npm run init-db
```

3. **Iniciar o servidor:**
```bash
npm start
```

O servidor estará rodando em `http://localhost:3001`

## 📋 Funcionalidades Implementadas

### Sistema de Autenticação
- ✅ Login de usuários
- ✅ Registro de passageiros
- ✅ Registro de motoristas
- ✅ Recuperação de senha
- ✅ Gerenciamento de sessão com tokens

### Interface do Passageiro
- ✅ Detecção automática da localização
- ✅ Seleção de destino com sugestões
- ✅ Visualização de rota no mapa
- ✅ Solicitação de carona
- ✅ Acompanhamento do status da corrida
- ✅ Cancelamento de carona

### Interface do Motorista
- ✅ Visualização de corridas disponíveis
- ✅ Aceitar/rejeitar corridas
- ✅ Gerenciamento de corridas ativas
- ✅ Finalização de corridas

### Persistência de Dados
- ✅ AsyncStorage para dados locais
- ✅ SQLite para banco de dados
- ✅ Tokens de autenticação
- ✅ Cache de endereços do usuário

### Integração com APIs
- ✅ API REST completa
- ✅ Geocodificação de endereços
- ✅ Interceptors para autenticação
- ✅ Tratamento de erros

## 🎯 Conceitos Aplicados da Disciplina

### React Native e Componentes
- **Componentes nativos**: View, Text, TextInput, TouchableOpacity, etc.
- **Navegação**: Stack Navigator com React Navigation
- **Estilização**: StyleSheet com design responsivo
- **Estado**: useState e useEffect para gerenciamento de estado

### Persistência de Dados
- **AsyncStorage**: Armazenamento local de tokens e dados do usuário
- **Banco Relacional**: SQLite com estrutura de tabelas bem definida
- **Integração**: Conexão entre frontend e backend

### Conexão Remota
- **API REST**: Endpoints completos para CRUD de corridas e usuários
- **Autenticação**: Sistema de tokens com interceptors
- **Geolocalização**: Integração com serviços de localização

### Arquitetura
- **MVC**: Separação clara entre Model, View e Controller
- **Camadas**: Controllers → Services → Repositories → Database
- **Componentização**: Reutilização de componentes

## 🔧 Configurações Importantes

### API Base URL
No arquivo `src/constants/api.js`, configure o IP da sua máquina:
```javascript
baseURL: "http://SEU_IP_AQUI:3001"
```

### Permissões
O app solicita permissões para:
- Localização (obrigatória para funcionamento)
- Acesso à câmera (opcional)

## 📱 Telas da Aplicação

1. **Splash Screen** - Tela inicial com logo
2. **Login** - Autenticação de usuários
3. **Registro** - Cadastro de passageiros e motoristas
4. **Dashboard** - Menu principal com opções
5. **Passageiro** - Interface para solicitar caronas
6. **Motorista** - Interface para gerenciar corridas
7. **Detalhes da Corrida** - Informações específicas

## 🐛 Problemas Conhecidos

- A geolocalização pode demorar alguns segundos na primeira execução
- Em alguns dispositivos, pode ser necessário ativar o GPS manualmente
- O app funciona melhor em dispositivos físicos do que em emuladores

## 🔮 Melhorias Futuras

### Funcionalidades
- [ ] Chat entre passageiro e motorista
- [ ] Notificações push
- [ ] Histórico de corridas
- [ ] Sistema de avaliações
- [ ] Pagamento integrado

### Técnicas
- [ ] Implementar Redux para gerenciamento de estado
- [ ] Adicionar testes automatizados
- [ ] Migrar para TypeScript
- [ ] Implementar offline first
- [ ] Adicionar animações mais fluidas

## 👨‍🎓 Sobre o Desenvolvedor

Este projeto foi desenvolvido por mim **um estudante de Engenharia de Software** como parte da disciplina de Programação para Dispositivos Móveis em Android. O objetivo foi aplicar os conceitos aprendidos em sala de aula em um projeto prático e funcional.

### Aprendizados
- Desenvolvimento mobile com React Native
- Integração com APIs REST
- Persistência de dados em aplicações móveis
- Arquitetura de aplicações
- Gerenciamento de estado
- Geolocalização e mapas

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e sem fins lucrativos como parte da disciplina de Engenharia de Software.

---

**Desenvolvido com ❤️ para aprender React Native e desenvolvimento mobile!** 
