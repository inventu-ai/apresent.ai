export type Language = 'pt-BR' | 'en-US' | 'es-ES';

export interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    loading: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    search: string;
    create: string;
    update: string;
    remove: string;
    confirm: string;
    yes: string;
    no: string;
    required: string;
    optional: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    tryAgain: string;
    currentImage: string;
    cmdEnterToSubmit: string;
  };
  auth: {
    signIn: string;
    signOut: string;
    signUp: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    resetPassword: string;
    loginSuccess: string;
    loginError: string;
    logoutSuccess: string;
    accountCreated: string;
    invalidCredentials: string;
    passwordResetSent: string;
    loginModal: {
      title: string;
      subtitle: string;
      benefits: {
        aiSlides: string;
        secureStorage: string;
        unlimitedThemes: string;
      };
      continueWithGoogle: string;
      createFreeAccount: string;
      alreadyHaveAccount: string;
      or: string;
      freeToStart: string;
      loggingIn: string;
    };
  };
  profile: {
    title: string;
    accountSettings: string;
    personalInfo: string;
    name: string;
    surname: string;
    fullName: string;
    language: string;
    notifications: string;
    deleteAccount: string;
    confirmDelete: string;
    settingsSaved: string;
    settingsError: string;
    yourCredits: string;
    creditsRemaining: string;
    resetIn: string;
    upgradeCredits: string;
    unlimitedCredits: string;
    manageAccount: string;
    backToSlides: string;
    youHaveMaxPlan: string;
    creditReset: string;
    creditResetInfo: string;
    nextReset: string;
    resetCycle: string;
    resetType: string;
    automatic: string;
    every30Days: string;
    dataNotAvailable: string;
    loading: string;
    used: string;
    viewHistory: string;
    howItWorks: string;
    creditsResetEvery30Days: string;
    resetHappensAfterLimit: string;
    unusedCreditsNotAccumulated: string;
    resetHistoryMaintained: string;
    days: string;
    dangerZone: string;
    irreversibleActions: string;
    deleteAccountAction: string;
    cannotBeUndone: string;
    deleteMyAccount: string;
    attention: string;
    considerBackup: string;
    allPresentationsDeleted: string;
    generatedImagesRemoved: string;
    creditHistoryLost: string;
    customThemesDeleted: string;
    actionIsIrreversible: string;
  };
  presentation: {
    create: string;
    createNew: string;
    myPresentations: string;
    generateButton: string;
    title: string;
    description: string;
    imageTools: {
      zoomOut: string;
      zoomIn: string;
      center: string;
      reset: string;
      done: string;
      dragToAdjust: string;
      noImageAvailable: string;
    };
    regenerateSlide: string;
    generateSlideWithAI: string;
    slides: string;
    themes: string;
    language: string;
    style: string;
    generatePresentation: string;
    generating: string;
    selectTheme: string;
    selectModel: string;
    quality: string;
    aspectRatio: string;
    numberOfSlides: string;
    presentationGenerated: string;
    presentationError: string;
    slideGenerated: string;
    slideError: string;
    addSlide: string;
    deleteSlide: string;
    duplicateSlide: string;
    moveSlide: string;
    editSlide: string;
    preview: string;
    present: string;
    export: string;
    share: string;
    download: string;
    editImage: string;
    generateImage: string;
    imageGenerated: string;
    imageError: string;
    editingImage: string;
    imageEdited: string;
    insufficientCredits: string;
    creditsRequired: string;
    creditsAvailable: string;
    creditsModal: {
      title: string;
      currentStatus: string;
      action: string;
      required: string;
      available: string;
      missing: string;
      credits: string;
      whatYouCanDo: string;
      waitNextMonth: string;
      creditsRenewIn: string;
      upgradeYourPlan: string;
      freePlanCredits: string;
      proPlanCredits: string;
      premiumPlanCredits: string;
      understood: string;
      upgrade: string;
      alreadyBestPlan: string;
    };
    back: string;
    prompt: string;
    slide: string;
    regenerateOutline: string;
    regenerating: string;
    outline: string;
    generatingOutline: string;
    regenerateTopic: string;
    regeneratingTopic: string;
    topicRegenerated: string;
    topicRegenerationError: string;
    addCard: string;
    cardsTotal: string;
    customizeTheme: string;
    themeLayout: string;
    moreThemes: string;
    imageGenerationModel: string;
    presentationStyle: string;
      modelInfo: {
        speed: string;
        bestFor: string;
        description: string;
        speedLabel: string;
      };
      modelDescriptions: {
        "ideogram-v2-turbo": string;
        "google-imagen-3-fast": string;
        "ideogram-v3-turbo": string;
        "google-imagen-3": string;
        "dall-e-3": string;
        "ideogram-v3-quality": string;
        "google-imagen-4": string;
        "gpt-image-1": string;
      };
      modelBestFor: {
        rapidIdeation: string;
        texts: string;
        colors: string;
        artisticStyle: string;
        people: string;
        photorealism: string;
        highQuality: string;
        realisticStyle: string;
        ultraRealisticImages: string;
        details: string;
      };
    loadingPresentationOutline: string;
    pleaseWaitMoment: string;
    cardColor: string;
    contentAlignment: string;
    cardLayout: string;
    cardWidth: string;
    slideTitle: string;
    slideText: string;
    imagePrompt: string;
    imageModel: string;
    generateNew: string;
    regenerate: string;
    loadingPresentation: string;
    gettingSlidesReady: string;
    presentationTheme: string;
    chooseThemeForPresentation: string;
    createNewTheme: string;
    myThemes: string;
    builtInThemes: string;
    darkMode: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    headingColor: string;
    mutedColor: string;
    headingFont: string;
    bodyFont: string;
    uploadLogo: string;
    addLogoToCustomize: string;
    themeLogo: string;
    finishYourTheme: string;
    themeName: string;
    enterThemeName: string;
    themeDescription: string;
    enterThemeDescription: string;
    presentationStyles: {
      professional: string;
      creative: string;
      minimal: string;
      bold: string;
      elegant: string;
    };
      themeDescriptions: {
        modern: string;
        professional: string;
        futuristic: string;
        classic: string;
        dark: string;
        highContrast: string;
        boldPassionate: string;
        warm: string;
        natural: string;
      };
      themeNames: {
        daktilo: string;
        cornflower: string;
        orbit: string;
        piano: string;
        mystique: string;
        gammaDark: string;
        crimson: string;
        sunset: string;
        forest: string;
      };
    themeModal: {
      youHaventCreated: string;
      createFirstTheme: string;
      chooseBaseTheme: string;
      startFromScratch: string;
      createBlankTheme: string;
      yourThemePreview: string;
      themePreviewDescription: string;
      primaryButton: string;
      secondaryButton: string;
      baseTheme: string;
      colors: string;
      typography: string;
      logo: string;
      finish: string;
      continue: string;
    };
    colorLabels: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      backgroundColor: string;
      textColor: string;
      headingColor: string;
      mutedColor: string;
    };
      fontLabels: {
        headingFont: string;
        bodyFont: string;
        heading: string;
        body: string;
      };
    logoUpload: {
      uploadLogo: string;
      addLogoDescription: string;
      themeLogo: string;
    };
    finishTheme: {
      finishYourTheme: string;
      themeName: string;
      enterThemeName: string;
      description: string;
      enterThemeDescription: string;
    };
  };
  userMenu: {
    changeTheme: string;
    profile: string;
    logOut: string;
    unlimited: string;
    credits: string;
    resetIn: string;
    day: string;
    days: string;
  };
  navigation: {
    dashboard: string;
    presentations: string;
    profile: string;
    settings: string;
    help: string;
    documentation: string;
  };
  plans: {
    free: string;
    pro: string;
    premium: string;
    upgrade: string;
    currentPlan: string;
    features: string;
    unlimited: string;
    popular: string;
    mostPowerful: string;
    upgradeSuccess: string;
    upgradeError: string;
    monthlyCredits: string;
    maxCards: string;
    basicImage: string;
    advancedImage: string;
    premiumImage: string;
    prioritySupport: string;
    customThemes: string;
    earlyAccess: string;
    whiteLabel: string;
  };
  errors: {
    generic: string;
    network: string;
    unauthorized: string;
    notFound: string;
    serverError: string;
    validationError: string;
    fileTooBig: string;
    invalidFormat: string;
    uploadFailed: string;
    saveFailed: string;
    loadFailed: string;
  };
  images: {
    uploadImage: string;
    changeAvatar: string;
    selectImage: string;
    imageUploaded: string;
    uploadError: string;
    copyImage: string;
    copyUrl: string;
    downloadImage: string;
    imageCopied: string;
    urlCopied: string;
    downloadStarted: string;
    maxFileSize: string;
    supportedFormats: string;
    editDescription: string;
    editingWithAI: string;
    aiWillEdit: string;
    costPerEdit: string;
    editPromptPlaceholder: string;
  };
  imageContextMenu: {
    editImage: string;
    askAI: string;
    adjustImage: string;
    copy: string;
    copyImageUrl: string;
    openInNewTab: string;
    downloadImage: string;
    removeImage: string;
  };
  presentationsDashboard: {
    yourPresentations: string;
    createNewPresentation: string;
    select: string;
    cancel: string;
    selectAll: string;
    deselectAll: string;
    delete: string;
    failedToLoad: string;
    noPresentationsFound: string;
    deleteConfirmTitle: string;
    deleteConfirmDescription: string;
    item: string;
    items: string;
    success: string;
    deletedMessage: string;
    error: string;
    deleteFailedMessage: string;
  };
  home: {
    inputPlaceholder: string;
  };
  credits: {
    accountBalance: string;
    unlimitedCredits: string;
    creditsAllowAI: string;
    howManyCosts: string;
    createPresentation: string;
    generateImage: string;
    editImage: string;
    generateSlide: string;
    regenerateTopic: string;
    generateCard: string;
    howToGetMore: string;
    unlimitedWithPlan: string;
    viewPlans: string;
    error: string;
  };
}

export const translations: Record<Language, Translations> = {
  'pt-BR': {
    common: {
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      loading: 'Carregando...',
      back: 'Voltar',
      next: 'Próximo',
      previous: 'Anterior',
      close: 'Fechar',
      search: 'Pesquisar',
      create: 'Criar',
      update: 'Atualizar',
      remove: 'Remover',
      confirm: 'Confirmar',
      yes: 'Sim',
      no: 'Não',
      required: 'Obrigatório',
      optional: 'Opcional',
      success: 'Sucesso',
      error: 'Erro',
      warning: 'Aviso',
      info: 'Informação',
      tryAgain: 'Tente novamente',
      currentImage: 'Imagem atual',
      cmdEnterToSubmit: 'Pressione Cmd/Ctrl + Enter para editar rapidamente',
    },
    auth: {
      signIn: 'Entrar',
      signOut: 'Sair',
      signUp: 'Cadastrar',
      email: 'E-mail',
      password: 'Senha',
      confirmPassword: 'Confirmar senha',
      forgotPassword: 'Esqueci minha senha',
      resetPassword: 'Redefinir senha',
      loginSuccess: 'Login realizado com sucesso',
      loginError: 'Erro ao fazer login',
      logoutSuccess: 'Logout realizado com sucesso',
      accountCreated: 'Conta criada com sucesso',
      invalidCredentials: 'Credenciais inválidas',
      passwordResetSent: 'E-mail de redefinição enviado',
      loginModal: {
        title: 'Quase lá! ✨',
        subtitle: 'Para gerar sua apresentação sobre "{prompt}", você precisa fazer login rapidinho.',
        benefits: {
          aiSlides: 'Criação de slides com IA em segundos',
          secureStorage: 'Suas apresentações salvas com segurança',
          unlimitedThemes: 'Temas e personalizações ilimitadas',
        },
        continueWithGoogle: 'Continuar com Google',
        createFreeAccount: 'Criar conta grátis',
        alreadyHaveAccount: 'Já tenho uma conta',
        or: 'ou',
        freeToStart: '100% gratuito para começar • Sem cartão de crédito',
        loggingIn: 'Entrando...',
      },
    },
    profile: {
      title: 'Perfil',
      accountSettings: 'Configurações da Conta',
      personalInfo: 'Informações Pessoais',
      name: 'Nome',
      surname: 'Sobrenome',
      fullName: 'Nome completo',
      language: 'Idioma',
      notifications: 'E-mails e notificações',
      deleteAccount: 'Excluir minha conta',
      confirmDelete: 'Confirmar exclusão',
      settingsSaved: 'Configurações salvas com sucesso!',
      settingsError: 'Erro ao salvar configurações',
      yourCredits: 'Seus Créditos',
      creditsRemaining: 'créditos restantes',
      resetIn: 'Reset em',
      upgradeCredits: 'Aumente seus créditos',
      unlimitedCredits: 'Créditos aumentados!',
      manageAccount: 'Gerencie suas configurações de conta e preferências',
      backToSlides: 'Voltar para criar slides',
      youHaveMaxPlan: 'Você já tem o melhor plano!',
      creditReset: 'Reset de Créditos',
      creditResetInfo: 'Informações sobre o ciclo de renovação dos seus créditos',
      nextReset: 'Próximo Reset',
      resetCycle: 'Ciclo de Reset',
      resetType: 'Tipo de Reset',
      automatic: 'Automático',
      every30Days: 'A cada 30 dias',
      dataNotAvailable: 'Data não disponível',
      loading: 'Carregando...',
      used: 'usado',
      viewHistory: 'Ver Histórico',
      howItWorks: 'Como funciona:',
      creditsResetEvery30Days: 'Os créditos são resetados automaticamente a cada 30 dias',
      resetHappensAfterLimit: 'O reset acontece quando você usa o sistema após a data limite',
      unusedCreditsNotAccumulated: 'Créditos não utilizados não são acumulados',
      resetHistoryMaintained: 'O histórico de todos os resets é mantido',
      days: 'dias',
      dangerZone: 'Zona de Perigo',
      irreversibleActions: 'Ações irreversíveis relacionadas à sua conta',
      deleteAccountAction: 'Excluir conta',
      cannotBeUndone: 'Esta ação não pode ser desfeita. Todos os seus dados, apresentações, imagens e configurações serão permanentemente removidos.',
      deleteMyAccount: 'Excluir minha conta',
      attention: 'Atenção:',
      considerBackup: 'Considere fazer backup de suas apresentações importantes antes de excluir sua conta.',
      allPresentationsDeleted: 'Todas as apresentações serão excluídas',
      generatedImagesRemoved: 'Imagens geradas serão removidas',
      creditHistoryLost: 'Histórico de créditos será perdido',
      customThemesDeleted: 'Temas customizados serão deletados',
      actionIsIrreversible: 'Esta ação é irreversível',
    },
    userMenu: {
      changeTheme: 'Mudar Tema',
      profile: 'Perfil',
      logOut: 'Sair',
      unlimited: 'Aumentados!',
      credits: 'créditos',
      resetIn: 'Reset em',
      day: 'dia',
      days: 'dias',
    },
    presentation: {
      create: 'Criar',
      createNew: 'Criar nova apresentação',
      myPresentations: 'Minhas apresentações',
      generateButton: 'Gerar apresentação',
      title: 'Título',
      imageTools: {
        zoomOut: 'Diminuir zoom',
        zoomIn: 'Aumentar zoom',
        center: 'Centralizar',
        reset: 'Resetar',
        done: 'Concluído',
        dragToAdjust: 'Arraste para ajustar a posição',
        noImageAvailable: 'Nenhuma imagem disponível',
      },
      regenerateSlide: 'Regenerar slide',
      generateSlideWithAI: 'Gerar slide com IA',
      description: 'Descrição',
      slides: 'Slides',
      themes: 'Temas',
      language: 'Idioma',
      style: 'Estilo',
      generatePresentation: 'Gerar apresentação',
      generating: 'Gerando...',
      selectTheme: 'Selecionar tema',
      selectModel: 'Selecionar modelo',
      quality: 'Qualidade',
      aspectRatio: 'Proporção',
      numberOfSlides: 'Número de slides',
      presentationGenerated: 'Apresentação gerada com sucesso',
      presentationError: 'Erro ao gerar apresentação',
      slideGenerated: 'Slide gerado com sucesso',
      slideError: 'Erro ao gerar slide',
      addSlide: 'Adicionar slide',
      deleteSlide: 'Excluir slide',
      duplicateSlide: 'Duplicar slide',
      moveSlide: 'Mover slide',
      editSlide: 'Editar slide',
      preview: 'Visualizar',
      present: 'Apresentar',
      export: 'Exportar',
      share: 'Compartilhar',
      download: 'Baixar',
      editImage: 'Editar Imagem',
      generateImage: 'Gerar imagem',
      imageGenerated: 'Imagem gerada com sucesso',
      imageError: 'Erro ao gerar imagem',
      editingImage: 'Editando imagem...',
      imageEdited: 'Imagem editada com sucesso',
      insufficientCredits: 'Créditos insuficientes',
      creditsRequired: 'Necessário',
      creditsAvailable: 'disponível',
      creditsModal: {
        title: 'Créditos Insuficientes',
        currentStatus: 'Status Atual',
        action: 'Ação',
        required: 'Necessário',
        available: 'Disponível',
        missing: 'Faltam',
        credits: 'créditos',
        whatYouCanDo: 'O que você pode fazer:',
        waitNextMonth: 'Aguardar próximo mês',
        creditsRenewIn: 'Seus créditos serão renovados em',
        upgradeYourPlan: 'Fazer upgrade do plano',
        freePlanCredits: 'Plano Pro: 2.000 créditos/mês',
        proPlanCredits: 'Plano Premium: Créditos aumentados!',
        premiumPlanCredits: 'Você já tem o melhor plano!',
        understood: 'Entendi',
        upgrade: 'Fazer Upgrade',
        alreadyBestPlan: 'Você já tem o melhor plano!'
      },
      back: 'Voltar',
      prompt: 'Prompt',
      slide: 'slide',
    regenerateOutline: 'Regenerar Estrutura',
    regenerating: 'Regenerando...',
    outline: 'Estrutura',
    generatingOutline: 'Gerando estrutura...',
    regenerateTopic: 'Regenerar Tópico',
    regeneratingTopic: 'Regenerando tópico...',
    topicRegenerated: 'Tópico regenerado com sucesso',
    topicRegenerationError: 'Erro ao regenerar tópico',
      addCard: 'Adicionar card',
      cardsTotal: 'cartões no total',
      customizeTheme: 'Personalizar Tema',
      themeLayout: 'Tema e Layout',
      moreThemes: 'Mais Temas',
      imageGenerationModel: 'Modelo de Geração de Imagem',
      presentationStyle: 'Estilo da Apresentação',
      modelInfo: {
        speed: 'Velocidade',
        bestFor: 'Melhor para',
        description: 'Descrição',
        speedLabel: 'Velocidade de geração',
      },
      modelDescriptions: {
        "ideogram-v2-turbo": "Boa compreensão de prompt e renderização de texto.",
        "google-imagen-3-fast": "Modelo mais rápido, funciona bem com instruções e prompts detalhados",
        "ideogram-v3-turbo": "Modelo mais rápido do Ideogram e mais realismo que o v2",
        "google-imagen-3": "Modelo de alta qualidade, excelente em fotorrealismo, detalhes, menos artefatos e renderização de texto, com capacidades de edição",
        "dall-e-3": "Modelo de geração anterior da OpenAI, cria imagens altamente estilizadas",
        "ideogram-v3-quality": "Modelo de maior qualidade do Ideogram",
        "google-imagen-4": "Modelo recente do Google, alta qualidade de imagem",
        "gpt-image-1": "Ótimo para prompts complexos e detalhes",
      },
      modelBestFor: {
        rapidIdeation: "Ideação rápida",
        texts: "Textos",
        colors: "Cores",
        artisticStyle: "Estilo artístico",
        people: "Pessoas",
        photorealism: "Fotorrealismo",
        highQuality: "Alta qualidade",
        realisticStyle: "Estilo realista",
        ultraRealisticImages: "Imagens ultra realistas",
        details: "Detalhes",
      },
      loadingPresentationOutline: 'Carregando Estrutura da Apresentação',
      pleaseWaitMoment: 'Por favor, aguarde um momento...',
      cardColor: 'Cor do card',
      contentAlignment: 'Alinhamento do conteúdo',
      cardLayout: 'Layout do card',
      cardWidth: 'Largura do card',
      slideTitle: 'Título',
      slideText: 'Texto',
      imagePrompt: 'Prompt da Imagem',
      imageModel: 'Modelo de Imagem',
      generateNew: 'Gerar Novo',
      regenerate: 'Regenerar',
      loadingPresentation: 'Carregando Apresentação',
      gettingSlidesReady: 'Preparando seus slides...',
      presentationTheme: 'Tema da Apresentação',
      chooseThemeForPresentation: 'Escolha um tema para sua apresentação',
      createNewTheme: 'Criar Novo Tema',
      myThemes: 'Meus Temas',
      builtInThemes: 'Temas Integrados',
      darkMode: 'Modo Escuro',
      primaryColor: 'Cor Primária',
      secondaryColor: 'Cor Secundária',
      accentColor: 'Cor de Destaque',
      backgroundColor: 'Cor de Fundo',
      textColor: 'Cor do Texto',
      headingColor: 'Cor do Título',
      mutedColor: 'Cor Suave',
      headingFont: 'Fonte do Título',
      bodyFont: 'Fonte do Corpo',
      uploadLogo: 'Enviar Logo',
      addLogoToCustomize: 'Adicione um logo para personalizar seu tema. Isto é opcional.',
      themeLogo: 'Logo do Tema',
      finishYourTheme: 'Finalize Seu Tema',
      themeName: 'Nome do Tema',
      enterThemeName: 'Digite o nome do tema',
      themeDescription: 'Descrição',
      enterThemeDescription: 'Digite a descrição do tema',
      presentationStyles: {
        professional: 'Profissional',
        creative: 'Criativo',
        minimal: 'Minimalista',
        bold: 'Ousado',
        elegant: 'Elegante',
      },
      themeDescriptions: {
        modern: 'Moderno e limpo',
        professional: 'Profissional e marcante',
        futuristic: 'Futurista e dinâmico',
        classic: 'Clássico e elegante',
        dark: 'Escuro e sofisticado',
        highContrast: 'Alto contraste',
        boldPassionate: 'Ousado e apaixonante',
        warm: 'Caloroso e convidativo',
        natural: 'Natural e sereno',
      },
      themeNames: {
        daktilo: 'Daktilo',
        cornflower: 'Centáurea',
        orbit: 'Órbita',
        piano: 'Piano',
        mystique: 'Místico',
        gammaDark: 'Gamma Dark',
        crimson: 'Carmesim',
        sunset: 'Pôr do Sol',
        forest: 'Floresta',
      },
      themeModal: {
        youHaventCreated: 'Você ainda não criou nenhum tema',
        createFirstTheme: 'Criar Seu Primeiro Tema',
        chooseBaseTheme: 'Escolha um Tema Base',
        startFromScratch: 'Começar do zero',
        createBlankTheme: 'Criar um tema em branco com configurações padrão',
        yourThemePreview: 'Visualização do Seu Tema',
        themePreviewDescription: 'Assim é como seu tema ficará. Você pode ver o texto, botões e outros elementos estilizados de acordo com as configurações do seu tema.',
        primaryButton: 'Botão Primário',
        secondaryButton: 'Botão Secundário',
        baseTheme: 'Tema Base',
        colors: 'Cores',
        typography: 'Tipografia',
        logo: 'Logo',
        finish: 'Finalizar',
        continue: 'Continuar',
      },
      colorLabels: {
        primaryColor: 'Cor Primária',
        secondaryColor: 'Cor Secundária',
        accentColor: 'Cor de Destaque',
        backgroundColor: 'Cor de Fundo',
        textColor: 'Cor do Texto',
        headingColor: 'Cor do Título',
        mutedColor: 'Cor Discreta',
      },
      fontLabels: {
        headingFont: 'Fonte do Título',
        bodyFont: 'Fonte do Corpo',
        heading: 'Título',
        body: 'Corpo',
      },
      logoUpload: {
        uploadLogo: 'Enviar Logo',
        addLogoDescription: 'Adicione um logo para personalizar seu tema. Isso é opcional.',
        themeLogo: 'Logo do Tema',
      },
      finishTheme: {
        finishYourTheme: 'Finalizar Seu Tema',
        themeName: 'Nome do Tema',
        enterThemeName: 'Digite o nome do tema',
        description: 'Descrição',
        enterThemeDescription: 'Digite a descrição do tema',
      },
    },
    navigation: {
      dashboard: 'Dashboard',
      presentations: 'Apresentações',
      profile: 'Perfil',
      settings: 'Configurações',
      help: 'Ajuda',
      documentation: 'Documentação',
    },
    plans: {
      free: 'Gratuito',
      pro: 'Pro',
      premium: 'Premium',
      upgrade: 'Fazer upgrade',
      currentPlan: 'Plano atual',
      features: 'Recursos',
      unlimited: 'Aumentados!',
      popular: 'Mais popular',
      mostPowerful: 'Mais poderoso',
      upgradeSuccess: 'Upgrade realizado com sucesso!',
      upgradeError: 'Erro ao processar upgrade',
      monthlyCredits: 'créditos/mês',
      maxCards: 'Máximo de cards',
      basicImage: 'Imagem básica',
      advancedImage: 'Imagem avançada',
      premiumImage: 'Imagem premium',
      prioritySupport: 'Suporte prioritário',
      customThemes: 'Temas customizados',
      earlyAccess: 'Acesso antecipado',
      whiteLabel: 'Marca personalizada',
    },
    errors: {
      generic: 'Ocorreu um erro inesperado',
      network: 'Erro de conexão',
      unauthorized: 'Não autorizado',
      notFound: 'Não encontrado',
      serverError: 'Erro interno do servidor',
      validationError: 'Erro de validação',
      fileTooBig: 'Arquivo muito grande',
      invalidFormat: 'Formato inválido',
      uploadFailed: 'Falha no upload',
      saveFailed: 'Falha ao salvar',
      loadFailed: 'Falha ao carregar',
    },
    images: {
      uploadImage: 'Enviar imagem',
      changeAvatar: 'Alterar Avatar',
      selectImage: 'Escolher nova imagem',
      imageUploaded: 'Imagem enviada com sucesso',
      uploadError: 'Erro ao enviar imagem',
      copyImage: 'Copiar imagem',
      copyUrl: 'Copiar URL',
      downloadImage: 'Baixar imagem',
      imageCopied: 'Imagem copiada para a área de transferência',
      urlCopied: 'URL da imagem copiada para a área de transferência',
      downloadStarted: 'Download da imagem iniciado',
      maxFileSize: 'Máximo 5MB',
      supportedFormats: 'PNG, JPG ou GIF',
      editDescription: 'Descreva o que você gostaria de modificar na imagem',
      editingWithAI: 'Peça à IA para editar a imagem',
      aiWillEdit: 'A IA irá editar sua imagem preservando a composição original e aplicando apenas as modificações solicitadas',
      costPerEdit: 'créditos por edição',
      editPromptPlaceholder: 'Por exemplo: Adicione um chapéu azul na pessoa, remova o fundo e substitua por uma paisagem montanhosa, mude a cor da camisa para verde...',
    },
    imageContextMenu: {
      editImage: 'Editar imagem...',
      askAI: 'Peça à IA para...',
      adjustImage: 'Ajustar imagem',
      copy: 'Copiar',
      copyImageUrl: 'Copiar endereço da imagem',
      openInNewTab: 'Abrir imagem em nova aba',
      downloadImage: 'Baixar imagem',
      removeImage: 'Remover imagem de destaque',
    },
    presentationsDashboard: {
      yourPresentations: 'Suas Apresentações',
      createNewPresentation: 'Criar Nova Apresentação',
      select: 'Selecionar',
      cancel: 'Cancelar',
      selectAll: 'Selecionar Todas',
      deselectAll: 'Desmarcar Todas',
      delete: 'Excluir',
      failedToLoad: 'Falha ao carregar apresentações',
      noPresentationsFound: 'Nenhuma apresentação encontrada',
      deleteConfirmTitle: 'Tem certeza absoluta?',
      deleteConfirmDescription: 'Esta ação não pode ser desfeita. Isso excluirá permanentemente {count} {itemType} selecionado(s).',
      item: 'item',
      items: 'itens',
      success: 'Sucesso',
      deletedMessage: 'Apresentações selecionadas excluídas',
      error: 'Erro',
      deleteFailedMessage: 'Falha ao excluir apresentações',
    },
    home: {
      inputPlaceholder: 'Digite o que você gostaria de criar...',
    },
    credits: {
      accountBalance: 'Saldo da conta',
      unlimitedCredits: 'Créditos aumentados!',
      creditsAllowAI: 'Os créditos permitem que você crie e edite com a IA.',
      howManyCosts: 'Quantos créditos custa para usar a IA?',
      createPresentation: 'Criar apresentação completa:',
      generateImage: 'Gerar/regenerar imagem:',
      editImage: 'Editar imagem:',
      generateSlide: 'Gerar slide com IA:',
      regenerateTopic: 'Regenerar tópico:',
      generateCard: 'Gerar novo card:',
      howToGetMore: 'Como posso ganhar mais créditos?',
      unlimitedWithPlan: 'Você poderá obter créditos aumentados! ao assinar um plano pago.',
      viewPlans: 'Ver planos e preços',
      error: 'Erro',
    },
  },
  'en-US': {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      search: 'Search',
      create: 'Create',
      update: 'Update',
      remove: 'Remove',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      required: 'Required',
      optional: 'Optional',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
      tryAgain: 'Try again',
      currentImage: 'Current image',
      cmdEnterToSubmit: 'Press Cmd/Ctrl + Enter to edit quickly',
    },
    auth: {
      signIn: 'Sign In',
      signOut: 'Sign Out',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password',
      resetPassword: 'Reset Password',
      loginSuccess: 'Login successful',
      loginError: 'Login error',
      logoutSuccess: 'Logout successful',
      accountCreated: 'Account created successfully',
      invalidCredentials: 'Invalid credentials',
      passwordResetSent: 'Password reset email sent',
      loginModal: {
        title: 'Almost there! ✨',
        subtitle: 'To generate your presentation about "{prompt}", you need to sign in quickly.',
        benefits: {
          aiSlides: 'AI slide creation in seconds',
          secureStorage: 'Your presentations safely stored',
          unlimitedThemes: 'Unlimited themes and customizations',
        },
        continueWithGoogle: 'Continue with Google',
        createFreeAccount: 'Create free account',
        alreadyHaveAccount: 'Already have an account? Sign in',
        or: 'or',
        freeToStart: '100% free to start • No credit card required',
        loggingIn: 'Signing in...',
      },
    },
    profile: {
      title: 'Profile',
      accountSettings: 'Account Settings',
      personalInfo: 'Personal Information',
      name: 'Name',
      surname: 'Surname',
      fullName: 'Full name',
      language: 'Language',
      notifications: 'Email and notifications',
      deleteAccount: 'Delete my account',
      confirmDelete: 'Confirm deletion',
      settingsSaved: 'Settings saved successfully!',
      settingsError: 'Error saving settings',
      yourCredits: 'Your Credits',
      creditsRemaining: 'credits remaining',
      resetIn: 'Reset in',
      upgradeCredits: 'Increase your credits',
      unlimitedCredits: 'Unlimited credits',
      manageAccount: 'Manage your account settings and preferences',
      backToSlides: 'Back to create slides',
      youHaveMaxPlan: 'You already have the best plan!',
      creditReset: 'Credit Reset',
      creditResetInfo: 'Information about your credit renewal cycle',
      nextReset: 'Next Reset',
      resetCycle: 'Reset Cycle',
      resetType: 'Reset Type',
      automatic: 'Automatic',
      every30Days: 'Every 30 days',
      dataNotAvailable: 'Data not available',
      loading: 'Loading...',
      used: 'used',
      viewHistory: 'View History',
      howItWorks: 'How it works:',
      creditsResetEvery30Days: 'Credits are automatically reset every 30 days',
      resetHappensAfterLimit: 'Reset happens when you use the system after the limit date',
      unusedCreditsNotAccumulated: 'Unused credits are not accumulated',
      resetHistoryMaintained: 'History of all resets is maintained',
      days: 'days',
      dangerZone: 'Danger Zone',
      irreversibleActions: 'Irreversible actions related to your account',
      deleteAccountAction: 'Delete account',
      cannotBeUndone: 'This action cannot be undone. All your data, presentations, images and settings will be permanently removed.',
      deleteMyAccount: 'Delete my account',
      attention: 'Attention:',
      considerBackup: 'Consider backing up your important presentations before deleting your account.',
      allPresentationsDeleted: 'All presentations will be deleted',
      generatedImagesRemoved: 'Generated images will be removed',
      creditHistoryLost: 'Credit history will be lost',
      customThemesDeleted: 'Custom themes will be deleted',
      actionIsIrreversible: 'This action is irreversible',
    },
    userMenu: {
      changeTheme: 'Change Theme',
      profile: 'Profile',
      logOut: 'Log out',
      unlimited: 'Unlimited',
      credits: 'credits',
      resetIn: 'Reset in',
      day: 'day',
      days: 'days',
    },
    presentation: {
      create: 'Create',
      createNew: 'Create new presentation',
      myPresentations: 'My presentations',
      generateButton: 'Generate presentation',
      title: 'Title',
      imageTools: {
        zoomOut: 'Zoom out',
        zoomIn: 'Zoom in',
        center: 'Center',
        reset: 'Reset',
        done: 'Done',
        dragToAdjust: 'Drag to adjust position',
        noImageAvailable: 'No image available',
      },
      regenerateSlide: 'Regenerate slide',
      generateSlideWithAI: 'Generate slide with AI',
      description: 'Description',
      slides: 'Slides',
      themes: 'Themes',
      language: 'Language',
      style: 'Style',
      generatePresentation: 'Generate presentation',
      generating: 'Generating...',
      selectTheme: 'Select theme',
      selectModel: 'Select model',
      quality: 'Quality',
      aspectRatio: 'Aspect ratio',
      numberOfSlides: 'Number of slides',
      presentationGenerated: 'Presentation generated successfully',
      presentationError: 'Error generating presentation',
      slideGenerated: 'Slide generated successfully',
      slideError: 'Error generating slide',
      addSlide: 'Add slide',
      deleteSlide: 'Delete slide',
      duplicateSlide: 'Duplicate slide',
      moveSlide: 'Move slide',
      editSlide: 'Edit slide',
      preview: 'Preview',
      present: 'Present',
      export: 'Export',
      share: 'Share',
      download: 'Download',
      editImage: 'Edit Image',
      generateImage: 'Generate image',
      imageGenerated: 'Image generated successfully',
      imageError: 'Error generating image',
      editingImage: 'Editing image...',
      imageEdited: 'Image edited successfully',
      insufficientCredits: 'Insufficient credits',
      creditsRequired: 'Required',
      creditsAvailable: 'available',
      creditsModal: {
        title: 'Insufficient Credits',
        currentStatus: 'Current Status',
        action: 'Action',
        required: 'Required',
        available: 'Available',
        missing: 'Missing',
        credits: 'credits',
        whatYouCanDo: 'What you can do:',
        waitNextMonth: 'Wait for next month',
        creditsRenewIn: 'Your credits will renew in',
        upgradeYourPlan: 'Upgrade your plan',
        freePlanCredits: 'Pro Plan: 2,000 credits/month',
        proPlanCredits: 'Premium Plan: Unlimited credits',
        premiumPlanCredits: 'You already have the best plan!',
        understood: 'Understood',
        upgrade: 'Upgrade',
        alreadyBestPlan: 'You already have the best plan!'
      },
      back: 'Back',
      prompt: 'Prompt',
      slide: 'slide',
          regenerateOutline: 'Regenerate Outline',
    regenerating: 'Regenerating...',
    outline: 'Outline',
    generatingOutline: 'Generating outline...',
    regenerateTopic: 'Regenerate Topic',
    regeneratingTopic: 'Regenerating topic...',
    topicRegenerated: 'Topic regenerated successfully',
    topicRegenerationError: 'Error regenerating topic',
      addCard: 'Add card',
      cardsTotal: 'cards total',
      customizeTheme: 'Customize Theme',
      themeLayout: 'Theme & Layout',
      moreThemes: 'More Themes',
      imageGenerationModel: 'Image Generation Model',
      presentationStyle: 'Presentation Style',
      modelInfo: {
        speed: 'Speed',
        bestFor: 'Best for',
        description: 'Description',
        speedLabel: 'Generation speed',
      },
      modelDescriptions: {
        "ideogram-v2-turbo": "Good prompt understanding and text rendering.",
        "google-imagen-3-fast": "Fastest model, works well with detailed instructions and prompts",
        "ideogram-v3-turbo": "Fastest Ideogram model with more realism than v2",
        "google-imagen-3": "High-quality model, excellent in photorealism, details, fewer artifacts and text rendering, with editing capabilities",
        "dall-e-3": "Previous generation OpenAI model, creates highly stylized images",
        "ideogram-v3-quality": "Highest quality Ideogram model",
        "google-imagen-4": "Recent Google model, high image quality",
        "gpt-image-1": "Great for complex prompts and details",
      },
      modelBestFor: {
        rapidIdeation: "Rapid ideation",
        texts: "Texts",
        colors: "Colors",
        artisticStyle: "Artistic style",
        people: "People",
        photorealism: "Photorealism",
        highQuality: "High quality",
        realisticStyle: "Realistic style",
        ultraRealisticImages: "Ultra realistic images",
        details: "Details",
      },
      loadingPresentationOutline: 'Loading Presentation Outline',
      pleaseWaitMoment: 'Please wait a moment...',
      cardColor: 'Card color',
      contentAlignment: 'Content alignment',
      cardLayout: 'Card layout',
      cardWidth: 'Card width',
      slideTitle: 'Title',
      slideText: 'Text',
      imagePrompt: 'Image Prompt',
      imageModel: 'Image Model',
      generateNew: 'Generate New',
      regenerate: 'Regenerate',
      loadingPresentation: 'Loading Presentation',
      gettingSlidesReady: 'Getting your slides ready...',
      presentationTheme: 'Presentation Theme',
      chooseThemeForPresentation: 'Choose a theme for your presentation',
      createNewTheme: 'Create New Theme',
      myThemes: 'My Themes',
      builtInThemes: 'Built-in Themes',
      darkMode: 'Dark Mode',
      primaryColor: 'Primary Color',
      secondaryColor: 'Secondary Color',
      accentColor: 'Accent Color',
      backgroundColor: 'Background Color',
      textColor: 'Text Color',
      headingColor: 'Heading Color',
      mutedColor: 'Muted Color',
      headingFont: 'Heading Font',
      bodyFont: 'Body Font',
      uploadLogo: 'Upload Logo',
      addLogoToCustomize: 'Add a logo to customize your theme. This is optional.',
      themeLogo: 'Theme Logo',
      finishYourTheme: 'Finish Your Theme',
      themeName: 'Theme Name',
      enterThemeName: 'Enter theme name',
      themeDescription: 'Description',
      enterThemeDescription: 'Enter theme description',
      presentationStyles: {
        professional: 'Professional',
        creative: 'Creative',
        minimal: 'Minimal',
        bold: 'Bold',
        elegant: 'Elegant',
      },
      themeDescriptions: {
        modern: 'Modern and clean',
        professional: 'Professional and bold',
        futuristic: 'Futuristic and dynamic',
        classic: 'Classic and elegant',
        dark: 'Dark and sophisticated',
        highContrast: 'High contrast',
        boldPassionate: 'Bold and passionate',
        warm: 'Warm and inviting',
        natural: 'Natural and serene',
      },
      themeNames: {
        daktilo: 'Daktilo',
        cornflower: 'Cornflower',
        orbit: 'Orbit',
        piano: 'Piano',
        mystique: 'Mystique',
        gammaDark: 'Gamma Dark',
        crimson: 'Crimson',
        sunset: 'Sunset',
        forest: 'Forest',
      },
      themeModal: {
        youHaventCreated: 'You haven\'t created any themes yet',
        createFirstTheme: 'Create Your First Theme',
        chooseBaseTheme: 'Choose a Base Theme',
        startFromScratch: 'Start from scratch',
        createBlankTheme: 'Create a blank theme with default settings',
        yourThemePreview: 'Your Theme Preview',
        themePreviewDescription: 'This is how your theme will look. You can see the text, buttons, and other elements styled according to your theme settings.',
        primaryButton: 'Primary Button',
        secondaryButton: 'Secondary Button',
        baseTheme: 'Base Theme',
        colors: 'Colors',
        typography: 'Typography',
        logo: 'Logo',
        finish: 'Finish',
        continue: 'Continue',
      },
      colorLabels: {
        primaryColor: 'Primary Color',
        secondaryColor: 'Secondary Color',
        accentColor: 'Accent Color',
        backgroundColor: 'Background Color',
        textColor: 'Text Color',
        headingColor: 'Heading Color',
        mutedColor: 'Muted Color',
      },
      fontLabels: {
        headingFont: 'Heading Font',
        bodyFont: 'Body Font',
        heading: 'Heading',
        body: 'Body',
      },
      logoUpload: {
        uploadLogo: 'Upload Logo',
        addLogoDescription: 'Add a logo to customize your theme. This is optional.',
        themeLogo: 'Theme Logo',
      },
      finishTheme: {
        finishYourTheme: 'Finish Your Theme',
        themeName: 'Theme Name',
        enterThemeName: 'Enter theme name',
        description: 'Description',
        enterThemeDescription: 'Enter theme description',
      },
    },
    navigation: {
      dashboard: 'Dashboard',
      presentations: 'Presentations',
      profile: 'Profile',
      settings: 'Settings',
      help: 'Help',
      documentation: 'Documentation',
    },
    plans: {
      free: 'Free',
      pro: 'Pro',
      premium: 'Premium',
      upgrade: 'Upgrade',
      currentPlan: 'Current plan',
      features: 'Features',
      unlimited: 'Unlimited',
      popular: 'Most popular',
      mostPowerful: 'Most powerful',
      upgradeSuccess: 'Upgrade successful!',
      upgradeError: 'Error processing upgrade',
      monthlyCredits: 'credits/month',
      maxCards: 'Max cards',
      basicImage: 'Basic image',
      advancedImage: 'Advanced image',
      premiumImage: 'Premium image',
      prioritySupport: 'Priority support',
      customThemes: 'Custom themes',
      earlyAccess: 'Early access',
      whiteLabel: 'White label',
    },
    errors: {
      generic: 'An unexpected error occurred',
      network: 'Connection error',
      unauthorized: 'Unauthorized',
      notFound: 'Not found',
      serverError: 'Internal server error',
      validationError: 'Validation error',
      fileTooBig: 'File too large',
      invalidFormat: 'Invalid format',
      uploadFailed: 'Upload failed',
      saveFailed: 'Save failed',
      loadFailed: 'Load failed',
    },
    images: {
      uploadImage: 'Upload image',
      changeAvatar: 'Change Avatar',
      selectImage: 'Choose new image',
      imageUploaded: 'Image uploaded successfully',
      uploadError: 'Error uploading image',
      copyImage: 'Copy image',
      copyUrl: 'Copy URL',
      downloadImage: 'Download image',
      imageCopied: 'Image copied to clipboard',
      urlCopied: 'Image URL copied to clipboard',
      downloadStarted: 'Image download started',
      maxFileSize: 'Maximum 5MB',
      supportedFormats: 'PNG, JPG or GIF',
      editDescription: 'Describe what you would like to modify in the image',
      editingWithAI: 'Ask AI to edit the image',
      aiWillEdit: 'AI will edit your image preserving the original composition and applying only the requested modifications',
      costPerEdit: 'credits per edit',
      editPromptPlaceholder: 'For example: Add a blue hat to the person, remove the background and replace with a mountain landscape, change the shirt color to green...',
    },
    imageContextMenu: {
      editImage: 'Edit image...',
      askAI: 'Ask AI to...',
      adjustImage: 'Adjust image',
      copy: 'Copy',
      copyImageUrl: 'Copy image URL',
      openInNewTab: 'Open image in new tab',
      downloadImage: 'Download image',
      removeImage: 'Remove featured image',
    },
    presentationsDashboard: {
      yourPresentations: 'Your Presentations',
      createNewPresentation: 'Create New Presentation',
      select: 'Select',
      cancel: 'Cancel',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      delete: 'Delete',
      failedToLoad: 'Failed to load presentations',
      noPresentationsFound: 'No presentations found',
      deleteConfirmTitle: 'Are you absolutely sure?',
      deleteConfirmDescription: 'This action cannot be undone. This will permanently delete {count} selected {itemType}.',
      item: 'item',
      items: 'items',
      success: 'Success',
      deletedMessage: 'Selected presentations deleted',
      error: 'Error',
      deleteFailedMessage: 'Failed to delete presentations',
    },
    home: {
      inputPlaceholder: 'Type what you would like to create...',
    },
    credits: {
      accountBalance: 'Account Balance',
      unlimitedCredits: 'Unlimited credits',
      creditsAllowAI: 'Credits allow you to create and edit with AI.',
      howManyCosts: 'How many credits does it cost to use AI?',
      createPresentation: 'Create complete presentation:',
      generateImage: 'Generate/regenerate image:',
      editImage: 'Edit image:',
      generateSlide: 'Generate slide with AI:',
      regenerateTopic: 'Regenerate topic:',
      generateCard: 'Generate new card:',
      howToGetMore: 'How can I get more credits?',
      unlimitedWithPlan: 'You can get unlimited credits by subscribing to a paid plan.',
      viewPlans: 'View plans and pricing',
      error: 'Error',
    },
  },
  'es-ES': {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      loading: 'Cargando...',
      back: 'Volver',
      next: 'Siguiente',
      previous: 'Anterior',
      close: 'Cerrar',
      search: 'Buscar',
      create: 'Crear',
      update: 'Actualizar',
      remove: 'Eliminar',
      confirm: 'Confirmar',
      yes: 'Sí',
      no: 'No',
      required: 'Requerido',
      optional: 'Opcional',
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información',
      tryAgain: 'Intentar de nuevo',
      currentImage: 'Imagen actual',
      cmdEnterToSubmit: 'Presiona Cmd/Ctrl + Enter para editar rápidamente',
    },
    auth: {
      signIn: 'Iniciar Sesión',
      signOut: 'Cerrar Sesión',
      signUp: 'Registrarse',
      email: 'Correo',
      password: 'Contraseña',
      confirmPassword: 'Confirmar Contraseña',
      forgotPassword: 'Olvidé mi Contraseña',
      resetPassword: 'Restablecer Contraseña',
      loginSuccess: 'Inicio de sesión exitoso',
      loginError: 'Error al iniciar sesión',
      logoutSuccess: 'Cierre de sesión exitoso',
      accountCreated: 'Cuenta creada exitosamente',
      invalidCredentials: 'Credenciales inválidas',
      passwordResetSent: 'Correo de restablecimiento enviado',
      loginModal: {
        title: '¡Casi listo! ✨',
        subtitle: 'Para generar tu presentación sobre "{prompt}", necesitas iniciar sesión rápidamente.',
        benefits: {
          aiSlides: 'Creación de diapositivas con IA en segundos',
          secureStorage: 'Tus presentaciones guardadas de forma segura',
          unlimitedThemes: 'Temas y personalizaciones ilimitadas',
        },
        continueWithGoogle: 'Continuar con Google',
        createFreeAccount: 'Crear cuenta gratis',
        alreadyHaveAccount: '¿Ya tienes cuenta? Iniciar sesión',
        or: 'o',
        freeToStart: '100% gratis para empezar • Sin tarjeta de crédito',
        loggingIn: 'Iniciando sesión...',
      },
    },
    profile: {
      title: 'Perfil',
      accountSettings: 'Configuración de Cuenta',
      personalInfo: 'Información Personal',
      name: 'Nombre',
      surname: 'Apellido',
      fullName: 'Nombre completo',
      language: 'Idioma',
      notifications: 'Correos y notificaciones',
      deleteAccount: 'Eliminar mi cuenta',
      confirmDelete: 'Confirmar eliminación',
      settingsSaved: '¡Configuración guardada exitosamente!',
      settingsError: 'Error al guardar configuración',
      yourCredits: 'Tus Créditos',
      creditsRemaining: 'créditos restantes',
      resetIn: 'Reinicio en',
      upgradeCredits: 'Aumenta tus créditos',
      unlimitedCredits: 'Créditos aumentados!',
      manageAccount: 'Gestiona la configuración de tu cuenta y preferencias',
      backToSlides: 'Volver a crear diapositivas',
      youHaveMaxPlan: '¡Ya tienes el mejor plan!',
      creditReset: 'Reinicio de Créditos',
      creditResetInfo: 'Información sobre el ciclo de renovación de tus créditos',
      nextReset: 'Próximo Reinicio',
      resetCycle: 'Ciclo de Reinicio',
      resetType: 'Tipo de Reinicio',
      automatic: 'Automático',
      every30Days: 'Cada 30 días',
      dataNotAvailable: 'Datos no disponibles',
      loading: 'Cargando...',
      used: 'usado',
      viewHistory: 'Ver Historial',
      howItWorks: 'Cómo funciona:',
      creditsResetEvery30Days: 'Los créditos se reinician automáticamente cada 30 días',
      resetHappensAfterLimit: 'El reinicio ocurre cuando usas el sistema después de la fecha límite',
      unusedCreditsNotAccumulated: 'Los créditos no utilizados no se acumulan',
      resetHistoryMaintained: 'El historial de todos los reinicios se mantiene',
      days: 'días',
      dangerZone: 'Zona de Peligro',
      irreversibleActions: 'Acciones irreversibles relacionadas con tu cuenta',
      deleteAccountAction: 'Eliminar cuenta',
      cannotBeUndone: 'Esta acción no se puede deshacer. Todos tus datos, presentaciones, imágenes y configuraciones serán eliminados permanentemente.',
      deleteMyAccount: 'Eliminar mi cuenta',
      attention: 'Atención:',
      considerBackup: 'Considera hacer una copia de seguridad de tus presentaciones importantes antes de eliminar tu cuenta.',
      allPresentationsDeleted: 'Todas las presentaciones serán eliminadas',
      generatedImagesRemoved: 'Las imágenes generadas serán eliminadas',
      creditHistoryLost: 'El historial de créditos se perderá',
      customThemesDeleted: 'Los temas personalizados serán eliminados',
      actionIsIrreversible: 'Esta acción es irreversible',
    },
    userMenu: {
      changeTheme: 'Cambiar Tema',
      profile: 'Perfil',
      logOut: 'Cerrar sesión',
      unlimited: 'aumentados!',
      credits: 'créditos',
      resetIn: 'Reinicio en',
      day: 'día',
      days: 'días',
    },
    presentation: {
      create: 'Crear',
      createNew: 'Crear nueva presentación',
      myPresentations: 'Mis presentaciones',
      generateButton: 'Generar presentación',
      title: 'Título',
      imageTools: {
        zoomOut: 'Reducir zoom',
        zoomIn: 'Aumentar zoom',
        center: 'Centrar',
        reset: 'Reiniciar',
        done: 'Completado',
        dragToAdjust: 'Arrastra para ajustar la posición',
        noImageAvailable: 'No hay imagen disponible',
      },
      regenerateSlide: 'Regenerar diapositiva',
      generateSlideWithAI: 'Generar diapositiva con IA',
      description: 'Descripción',
      slides: 'Diapositivas',
      themes: 'Temas',
      language: 'Idioma',
      style: 'Estilo',
      generatePresentation: 'Generar presentación',
      generating: 'Generando...',
      selectTheme: 'Seleccionar tema',
      selectModel: 'Seleccionar modelo',
      quality: 'Calidad',
      aspectRatio: 'Proporción',
      numberOfSlides: 'Número de diapositivas',
      presentationGenerated: 'Presentación generada exitosamente',
      presentationError: 'Error al generar presentación',
      slideGenerated: 'Diapositiva generada exitosamente',
      slideError: 'Error al generar diapositiva',
      addSlide: 'Agregar diapositiva',
      deleteSlide: 'Eliminar diapositiva',
      duplicateSlide: 'Duplicar diapositiva',
      moveSlide: 'Mover diapositiva',
      editSlide: 'Editar diapositiva',
      preview: 'Vista previa',
      present: 'Presentar',
      export: 'Exportar',
      share: 'Compartir',
      download: 'Descargar',
      editImage: 'Editar Imagen',
      generateImage: 'Generar imagen',
      imageGenerated: 'Imagen generada exitosamente',
      imageError: 'Error al generar imagen',
      editingImage: 'Editando imagen...',
      imageEdited: 'Imagen editada exitosamente',
      insufficientCredits: 'Créditos insuficientes',
      creditsRequired: 'Requerido',
      creditsAvailable: 'disponible',
      creditsModal: {
        title: 'Créditos Insuficientes',
        currentStatus: 'Estado Actual',
        action: 'Acción',
        required: 'Requerido',
        available: 'Disponible',
        missing: 'Faltan',
        credits: 'créditos',
        whatYouCanDo: 'Lo que puedes hacer:',
        waitNextMonth: 'Esperar al próximo mes',
        creditsRenewIn: 'Tus créditos se renovarán en',
        upgradeYourPlan: 'Actualizar tu plan',
        freePlanCredits: 'Plan Pro: 2,000 créditos/mes',
        proPlanCredits: 'Plan Premium: Créditos aumentados!',
        premiumPlanCredits: '¡Ya tienes el mejor plan!',
        understood: 'Entendido',
        upgrade: 'Actualizar',
        alreadyBestPlan: '¡Ya tienes el mejor plan!'
      },
      back: 'Atrás',
      prompt: 'Prompt',
      slide: 'diapositiva',
          regenerateOutline: 'Regenerar Esquema',
    regenerating: 'Regenerando...',
    outline: 'Esquema',
    generatingOutline: 'Generando esquema...',
    regenerateTopic: 'Regenerar Tema',
    regeneratingTopic: 'Regenerando tema...',
    topicRegenerated: 'Tema regenerado exitosamente',
    topicRegenerationError: 'Error al regenerar tema',
      addCard: 'Añadir tarjeta',
      cardsTotal: 'tarjetas en total',
      customizeTheme: 'Personalizar Tema',
      themeLayout: 'Tema y Diseño',
      moreThemes: 'Más Temas',
      imageGenerationModel: 'Modelo de Generación de Imagen',
      presentationStyle: 'Estilo de Presentación',
      modelInfo: {
        speed: 'Velocidad',
        bestFor: 'Mejor para',
        description: 'Descripción',
        speedLabel: 'Velocidad de generación',
      },
      modelDescriptions: {
        "ideogram-v2-turbo": "Buena comprensión de prompts y renderizado de texto.",
        "google-imagen-3-fast": "Modelo más rápido, funciona bien con instrucciones y prompts detallados",
        "ideogram-v3-turbo": "Modelo más rápido de Ideogram con más realismo que v2",
        "google-imagen-3": "Modelo de alta calidad, excelente en fotorrealismo, detalles, menos artefactos y renderizado de texto, con capacidades de edición",
        "dall-e-3": "Modelo de generación anterior de OpenAI, crea imágenes altamente estilizadas",
        "ideogram-v3-quality": "Modelo de mayor calidad de Ideogram",
        "google-imagen-4": "Modelo reciente de Google, alta calidad de imagen",
        "gpt-image-1": "Excelente para prompts complejos y detalles",
      },
      modelBestFor: {
        rapidIdeation: "Ideación rápida",
        texts: "Textos",
        colors: "Colores",
        artisticStyle: "Estilo artístico",
        people: "Personas",
        photorealism: "Fotorrealismo",
        highQuality: "Alta calidad",
        realisticStyle: "Estilo realista",
        ultraRealisticImages: "Imágenes ultra realistas",
        details: "Detalles",
      },
      loadingPresentationOutline: 'Cargando Esquema de Presentación',
      pleaseWaitMoment: 'Por favor, espere un momento...',
      cardColor: 'Color de tarjeta',
      contentAlignment: 'Alineación de contenido',
      cardLayout: 'Diseño de tarjeta',
      cardWidth: 'Ancho de tarjeta',
      slideTitle: 'Título',
      slideText: 'Texto',
      imagePrompt: 'Prompt de Imagen',
      imageModel: 'Modelo de Imagen',
      generateNew: 'Generar Nuevo',
      regenerate: 'Regenerar',
      loadingPresentation: 'Cargando Presentación',
      gettingSlidesReady: 'Preparando tus diapositivas...',
      presentationTheme: 'Tema de Presentación',
      chooseThemeForPresentation: 'Elige un tema para tu presentación',
      createNewTheme: 'Crear Nuevo Tema',
      myThemes: 'Mis Temas',
      builtInThemes: 'Temas Integrados',
      darkMode: 'Modo Oscuro',
      primaryColor: 'Color Primario',
      secondaryColor: 'Color Secundario',
      accentColor: 'Color de Acento',
      backgroundColor: 'Color de Fondo',
      textColor: 'Color de Texto',
      headingColor: 'Color de Título',
      mutedColor: 'Color Suave',
      headingFont: 'Fuente de Título',
      bodyFont: 'Fuente de Cuerpo',
      uploadLogo: 'Subir Logo',
      addLogoToCustomize: 'Añade un logo para personalizar tu tema. Esto es opcional.',
      themeLogo: 'Logo del Tema',
      finishYourTheme: 'Finaliza Tu Tema',
      themeName: 'Nombre del Tema',
      enterThemeName: 'Introduce el nombre del tema',
      themeDescription: 'Descripción',
      enterThemeDescription: 'Introduce la descripción del tema',
      presentationStyles: {
        professional: 'Profesional',
        creative: 'Creativo',
        minimal: 'Minimalista',
        bold: 'Audaz',
        elegant: 'Elegante',
      },
      themeDescriptions: {
        modern: 'Moderno y limpio',
        professional: 'Profesional y audaz',
        futuristic: 'Futurista y dinámico',
        classic: 'Clásico y elegante',
        dark: 'Oscuro y sofisticado',
        highContrast: 'Alto contraste',
        boldPassionate: 'Audaz y apasionado',
        warm: 'Cálido y acogedor',
        natural: 'Natural y sereno',
      },
      themeNames: {
        daktilo: 'Daktilo',
        cornflower: 'Aciano',
        orbit: 'Órbita',
        piano: 'Piano',
        mystique: 'Místico',
        gammaDark: 'Gamma Dark',
        crimson: 'Carmesí',
        sunset: 'Atardecer',
        forest: 'Bosque',
      },
      themeModal: {
        youHaventCreated: 'Aún no has creado ningún tema',
        createFirstTheme: 'Crear Tu Primer Tema',
        chooseBaseTheme: 'Elige un Tema Base',
        startFromScratch: 'Empezar desde cero',
        createBlankTheme: 'Crear un tema en blanco con configuraciones predeterminadas',
        yourThemePreview: 'Vista Previa de Tu Tema',
        themePreviewDescription: 'Así es como se verá tu tema. Puedes ver el texto, botones y otros elementos estilizados según la configuración de tu tema.',
        primaryButton: 'Botón Primario',
        secondaryButton: 'Botón Secundario',
        baseTheme: 'Tema Base',
        colors: 'Colores',
        typography: 'Tipografía',
        logo: 'Logo',
        finish: 'Finalizar',
        continue: 'Continuar',
      },
      colorLabels: {
        primaryColor: 'Color Primario',
        secondaryColor: 'Color Secundario',
        accentColor: 'Color de Acento',
        backgroundColor: 'Color de Fondo',
        textColor: 'Color del Texto',
        headingColor: 'Color del Título',
        mutedColor: 'Color Silenciado',
      },
      fontLabels: {
        headingFont: 'Fuente del Título',
        bodyFont: 'Fuente del Cuerpo',
        heading: 'Título',
        body: 'Cuerpo',
      },
      logoUpload: {
        uploadLogo: 'Subir Logo',
        addLogoDescription: 'Añade un logo para personalizar tu tema. Esto es opcional.',
        themeLogo: 'Logo del Tema',
      },
      finishTheme: {
        finishYourTheme: 'Finalizar Tu Tema',
        themeName: 'Nombre del Tema',
        enterThemeName: 'Introduce el nombre del tema',
        description: 'Descripción',
        enterThemeDescription: 'Introduce la descripción del tema',
      },
    },
    navigation: {
      dashboard: 'Panel',
      presentations: 'Presentaciones',
      profile: 'Perfil',
      settings: 'Configuración',
      help: 'Ayuda',
      documentation: 'Documentación',
    },
    plans: {
      free: 'Gratuito',
      pro: 'Pro',
      premium: 'Premium',
      upgrade: 'Actualizar',
      currentPlan: 'Plan actual',
      features: 'Características',
      unlimited: 'Aumentado',
      popular: 'Más popular',
      mostPowerful: 'Más poderoso',
      upgradeSuccess: '¡Actualización exitosa!',
      upgradeError: 'Error procesando actualización',
      monthlyCredits: 'créditos/mes',
      maxCards: 'Máximo de tarjetas',
      basicImage: 'Imagen básica',
      advancedImage: 'Imagen avanzada',
      premiumImage: 'Imagen premium',
      prioritySupport: 'Soporte prioritario',
      customThemes: 'Temas personalizados',
      earlyAccess: 'Acceso temprano',
      whiteLabel: 'Marca blanca',
    },
    errors: {
      generic: 'Ocurrió un error inesperado',
      network: 'Error de conexión',
      unauthorized: 'No autorizado',
      notFound: 'No encontrado',
      serverError: 'Error interno del servidor',
      validationError: 'Error de validación',
      fileTooBig: 'Archivo muy grande',
      invalidFormat: 'Formato inválido',
      uploadFailed: 'Fallo en la subida',
      saveFailed: 'Fallo al guardar',
      loadFailed: 'Fallo al cargar',
    },
    images: {
      uploadImage: 'Subir imagen',
      changeAvatar: 'Cambiar Avatar',
      selectImage: 'Elegir nueva imagen',
      imageUploaded: 'Imagen subida exitosamente',
      uploadError: 'Error al subir imagen',
      copyImage: 'Copiar imagen',
      copyUrl: 'Copiar URL',
      downloadImage: 'Descargar imagen',
      imageCopied: 'Imagen copiada al portapapeles',
      urlCopied: 'URL de imagen copiada al portapapeles',
      downloadStarted: 'Descarga de imagen iniciada',
      maxFileSize: 'Máximo 5MB',
      supportedFormats: 'PNG, JPG o GIF',
      editDescription: 'Describe qué te gustaría modificar en la imagen',
      editingWithAI: 'Pide a la IA que edite la imagen',
      aiWillEdit: 'La IA editará tu imagen preservando la composición original y aplicando solo las modificaciones solicitadas',
      costPerEdit: 'créditos por edición',
      editPromptPlaceholder: 'Por ejemplo: Añade un sombrero azul a la persona, elimina el fondo y reemplázalo con un paisaje montañoso, cambia el color de la camisa a verde...',
    },
    imageContextMenu: {
      editImage: 'Editar imagen...',
      askAI: 'Pedir a la IA...',
      adjustImage: 'Ajustar imagen',
      copy: 'Copiar',
      copyImageUrl: 'Copiar dirección de la imagen',
      openInNewTab: 'Abrir imagen en nueva pestaña',
      downloadImage: 'Descargar imagen',
      removeImage: 'Eliminar imagen destacada',
    },
    presentationsDashboard: {
      yourPresentations: 'Tus Presentaciones',
      createNewPresentation: 'Crear Nueva Presentación',
      select: 'Seleccionar',
      cancel: 'Cancelar',
      selectAll: 'Seleccionar Todas',
      deselectAll: 'Deseleccionar Todas',
      delete: 'Eliminar',
      failedToLoad: 'Error al cargar presentaciones',
      noPresentationsFound: 'No se encontraron presentaciones',
      deleteConfirmTitle: '¿Estás absolutamente seguro?',
      deleteConfirmDescription: 'Esta acción no se puede deshacer. Esto eliminará permanentemente {count} {itemType} seleccionado(s).',
      item: 'elemento',
      items: 'elementos',
      success: 'Éxito',
      deletedMessage: 'Presentaciones seleccionadas eliminadas',
      error: 'Error',
      deleteFailedMessage: 'Error al eliminar presentaciones',
    },
    home: {
      inputPlaceholder: 'Escribe lo que te gustaría crear...',
    },
    credits: {
      accountBalance: 'Saldo de la cuenta',
      unlimitedCredits: 'Créditos aumentados!',
      creditsAllowAI: 'Los créditos te permiten crear y editar con IA.',
      howManyCosts: '¿Cuántos créditos cuesta usar la IA?',
      createPresentation: 'Crear presentación completa:',
      generateImage: 'Generar/regenerar imagen:',
      editImage: 'Editar imagen:',
      generateSlide: 'Generar diapositiva con IA:',
      regenerateTopic: 'Regenerar tema:',
      generateCard: 'Generar nueva tarjeta:',
      howToGetMore: '¿Cómo puedo obtener más créditos?',
      unlimitedWithPlan: 'Puedes obtener créditos aumentados! suscribiéndote a un plan de pago.',
      viewPlans: 'Ver planes y precios',
      error: 'Error',
    },
  } as const,
};
