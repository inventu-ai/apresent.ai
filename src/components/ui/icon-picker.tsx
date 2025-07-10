"use client";
import React, { useState, type ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type IconType } from "react-icons";

// Define interfaces for type safety
interface IconItem {
  name: string;
  component: ReactNode;
}

type IconModule = Record<string, IconType>;

// Lista de ícones de fallback alternativos
const FALLBACK_ICONS = [
  // Ícones gerais/conceituais
  "FaLightbulb", "FaInfo", "FaBookOpen", "FaCompass", "FaGem", 
  "FaCube", "FaPuzzlePiece", "FaThumbsUp", "FaStar", "FaCheckCircle",
  // Ícones para tópicos de negócios
  "FaChartLine", "FaBriefcase", "FaHandshake", "FaMoneyBillWave", 
  "FaBuilding", "FaFileContract", "FaCalculator", "FaChartPie", 
  // Ícones para tópicos de tecnologia
  "FaMicrochip", "FaDatabase", "FaServer", "FaCode", "FaCogs",
  "FaNetworkWired", "FaMobile", "FaCloudUploadAlt", 
  // Ícones para tópicos de educação/acadêmicos
  "FaGraduationCap", "FaBook", "FaUniversity", "FaAtom", "FaFlask", 
  "FaChalkboardTeacher", "FaPencilAlt", "FaSchool", 
  // Ícones para tópicos de saúde/medicina
  "FaHeartbeat", "FaMedkit", "FaHospital", "FaStethoscope", "FaPills", 
  "FaUserMd", "FaDna", "FaBrain", 
  // Ícones para tópicos de meio ambiente/sustentabilidade
  "FaLeaf", "FaSeedling", "FaTree", "FaSun", "FaWater", 
  "FaWind", "FaRecycle", "FaMountain", 
  // Ícones para tópicos de comunicação/mídia
  "FaComments", "FaEnvelope", "FaMicrophone", "FaPhone", "FaVideo", 
  "FaBullhorn", "FaNewspaper", "FaRss", 
  // Ícones para tópicos de transporte/logística
  "FaCar", "FaTruck", "FaShip", "FaPlane", "FaTrain", 
  "FaBus", "FaMotorcycle", "FaBicycle", 
  // Ícones para tópicos de segurança/proteção
  "FaShieldAlt", "FaLock", "FaUserShield", "FaFingerprint", "FaKey", 
  "FaEye", "FaUserSecret", "FaIdCard", 
  // Ícones para tópicos de arte/design
  "FaPaintBrush", "FaMusic", "FaCamera", "FaFilm", "FaTheaterMasks", 
  "FaGuitar", "FaPalette", "FaPhotoVideo"
];

// Manter um registro dos ícones já usados para evitar repetições
const usedFallbackIcons: Record<string, Set<string>> = {};

// Função melhorada para obter um ícone de fallback aleatório sem repetições
export const getRandomFallbackIcon = (contextId = 'global'): string => {
  // Inicializar o conjunto de ícones usados para este contexto se não existir
  if (!usedFallbackIcons[contextId]) {
    usedFallbackIcons[contextId] = new Set<string>();
  }
  
  // Se todos os ícones já foram usados neste contexto, resetar o conjunto
  if (usedFallbackIcons[contextId]?.size >= FALLBACK_ICONS.length - 5) {
    usedFallbackIcons[contextId]?.clear();
  }
  
  // Filtrar ícones que ainda não foram usados neste contexto
  const availableIcons = FALLBACK_ICONS.filter(icon => !usedFallbackIcons[contextId]?.has(icon));
  
  // Se não houver ícones disponíveis (caso improvável), usar qualquer um
  if (availableIcons.length === 0) {
    const randomIndex = Math.floor(Math.random() * FALLBACK_ICONS.length);
    return FALLBACK_ICONS[randomIndex] || "FaLightbulb";
  }
  
  // Selecionar um ícone aleatório dos disponíveis
  const randomIndex = Math.floor(Math.random() * availableIcons.length);
  const selectedIcon = availableIcons[randomIndex] || "FaLightbulb";
  
  // Registrar que este ícone foi usado neste contexto
  usedFallbackIcons[contextId]?.add(selectedIcon);
  
  return selectedIcon;
};

// Define the prop types
interface IconPickerProps {
  onIconSelect?: (iconName: string, iconComponent?: ReactNode) => void;
  defaultIcon?: string;
  searchTerm?: string; // Added prop to automatically search and select the first matching icon
  size?: "sm" | "md" | "lg";
  className?: string;
  contextId?: string; // Identificador único para o contexto onde o ícone está sendo usado
  isOpen?: boolean; // Propriedade opcional para controlar o estado do modal externamente
  onOpenChange?: (isOpen: boolean) => void; // Callback opcional para notificar mudanças no estado do modal
}

// Main Icon Picker Component
const IconPicker = ({
  onIconSelect,
  defaultIcon = "FaHome",
  searchTerm = "",
  size = "md",
  className,
  contextId = "default", // Valor padrão para compatibilidade com código existente
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange
}: IconPickerProps) => {
  const [icon, setIcon] = useState<string>(defaultIcon);
  const [iconComponent, setIconComponent] = useState<ReactNode>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [internalSearchTerm, setInternalSearchTerm] = useState<string>("");
  const [filteredIcons, setFilteredIcons] = useState<IconItem[]>([]);
  const [availableIcons, setAvailableIcons] = useState<IconItem[]>([]);
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);
  
  // Determinar se o componente está controlado externamente ou internamente
  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;
  
  // Função para lidar com mudanças no estado do modal
  const handleOpenChange = (open: boolean) => {
    // Se o componente estiver sendo controlado externamente, chamar o callback
    if (isControlled && externalOnOpenChange) {
      externalOnOpenChange(open);
    } else {
      // Caso contrário, atualizar o estado interno
      setInternalIsOpen(open);
    }
  };

  // Size mappings for the trigger button
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  // Load some initial popular icons when the sheet opens
  useEffect(() => {
    if (isOpen && availableIcons.length === 0) {
      void loadPopularIcons();
    }
  }, [isOpen, availableIcons.length]);

  // Carregar mais ícones iniciais quando o componente montar
  useEffect(() => {
    if (availableIcons.length === 0) {
      void loadPopularIcons();
    }
  }, []);

  // Function to load popular icons when the sheet first opens
  const loadPopularIcons = async () => {
    setIsLoading(true);
    try {
      // Carregar ícones de múltiplas bibliotecas para ter mais opções iniciais
      const [faModule, mdModule, giModule] = await Promise.all([
        import("react-icons/fa"),
        import("react-icons/md"),
        import("react-icons/gi")
      ]);

      // Ícones gerais (interface, ações comuns)
      const generalIcons = [
        "FaHome", "FaUser", "FaCog", "FaSearch", "FaBell", "FaCalendar", 
        "FaEnvelope", "FaHeart", "FaStar", "FaBookmark", "FaCheck", 
        "FaTimes", "FaEdit", "FaTrash", "FaDownload", "FaUpload", 
        "FaShare", "FaLink", "FaMapMarker", "FaClock", "FaCamera", 
        "FaVideo", "FaMusic", "FaFile", "FaFolder", "FaComments", 
        "FaThumbsUp", "FaPhone", "FaLock", "FaUserPlus", "FaQuestion",
        "FaExclamation", "FaInfo", "FaLightbulb", "FaBrain", "FaGlobe",
        "FaGraduationCap", "FaBook", "FaNewspaper", "FaChartBar", "FaChartLine"
      ];

      // Ícones para apresentações (temas específicos)
      const presentationIcons = [
        // Ícones de guerra/militar
        "FaFighterJet", "FaPlane", "FaBomb", "FaShip", "FaChess", "FaBolt",
        "FaTruck", "FaMap", "FaMapMarkedAlt", "FaGlobeAmericas", "FaGlobeEurope",
        "FaUserTie", "FaUsers", "FaHandshake", "FaPeace", "FaFistRaised",
        "FaSkullCrossbones", "FaBalanceScale", "FaGavel", "FaFileAlt",
        
        // Ícones de tecnologia/ciência
        "FaMicrochip", "FaMicroscope", "FaIndustry", "FaCity", "FaBuilding",
        "FaMoneyBillWave", "FaAward", "FaMedal", "FaRocket", "FaShieldAlt",
        "FaFlag", "FaRadiation", "FaAtom", "FaFlask", "FaDna", "FaVirus",
        
        // Ícones de comunicação/mídia
        "FaNewspaper", "FaTv", "FaRadio", "FaMicrophone", "FaHeadphones",
        "FaFilm", "FaPhotoVideo", "FaPodcast", "FaBullhorn", "FaRss"
      ];

      // Ícones do Material Design para mais variedade
      const materialIcons = [
        "MdDashboard", "MdSettings", "MdPerson", "MdPeople", "MdSchool",
        "MdWork", "MdBusiness", "MdLocalHospital", "MdRestaurant", "MdLocalCafe",
        "MdLocalBar", "MdLocalMall", "MdLocalGroceryStore", "MdDirectionsBus",
        "MdDirectionsCar", "MdFlight", "MdHotel", "MdWifi", "MdComputer",
        "MdSmartphone", "MdTablet", "MdSecurity", "MdNotifications", "MdEvent",
        "MdShoppingCart", "MdPayment", "MdAttachMoney", "MdTrendingUp", "MdTrendingDown"
      ];

      // Ícones de jogos para temas específicos (Game Icons)
      const gameIcons = [
        "GiSwordman", "GiCrossedSwords", "GiSwordsEmblem", "GiShield", "GiCastle",
        "GiCrown", "GiTrophy", "GiLaurelCrown", "GiMedal", "GiTank", "GiJetFighter",
        "GiMissileLauncher", "GiMissileSwarm", "GiNuclearBomb", "GiRadarSweep",
        "GiSatelliteCommunication", "GiSpaceship", "GiRocket", "GiChemicalTank",
        "GiChemicalDrop", "GiGasMask", "GiHazardSign"
      ];

      // Criar lista de ícones com componentes
      const iconList: IconItem[] = [];

      // Processar ícones FontAwesome
      const faIcons = [...generalIcons, ...presentationIcons]
        .map((name) => ({
          name,
          component: faModule[name]
            ? React.createElement(faModule[name], { size: 24 })
            : null,
        }))
        .filter((item) => item.component);
      
      iconList.push(...faIcons);

      // Processar ícones Material Design
      const mdIcons = materialIcons
        .map((name) => ({
          name,
          component: mdModule[name]
            ? React.createElement(mdModule[name], { size: 24 })
            : null,
        }))
        .filter((item) => item.component);
      
      iconList.push(...mdIcons);

      // Processar ícones Game Icons
      const giIcons = gameIcons
        .map((name) => ({
          name,
          component: giModule[name]
            ? React.createElement(giModule[name], { size: 24 })
            : null,
        }))
        .filter((item) => item.component);
      
      iconList.push(...giIcons);

      // Aumentar o limite para 200 ícones para mostrar mais opções
      const limitedIconList = iconList.slice(0, 200);

      setAvailableIcons(limitedIconList);
      setFilteredIcons(limitedIconList);
        } catch (error) {
          // Silenciar erro
        } finally {
          setIsLoading(false);
        }
  };

  // Function to dynamically load icons based on search
  const searchIcons = async (term: string) => {
    if (!term || term.length < 2) {
      setFilteredIcons(availableIcons);
      return;
    }

    setIsLoading(true);
    try {
      const termLower = term.toLowerCase();
      const modules: IconModule[] = [];

      // Carregar mais bibliotecas de ícones para busca
      if (termLower.startsWith("fa")) {
        const mod = await import("react-icons/fa");
        modules.push(mod as unknown as IconModule);
      } else if (termLower.startsWith("fi")) {
        const mod = await import("react-icons/fi");
        modules.push(mod as unknown as IconModule);
      } else if (termLower.startsWith("ai")) {
        const mod = await import("react-icons/ai");
        modules.push(mod as unknown as IconModule);
      } else if (termLower.startsWith("bs")) {
        const mod = await import("react-icons/bs");
        modules.push(mod as unknown as IconModule);
      } else if (termLower.startsWith("bi")) {
        const mod = await import("react-icons/bi");
        modules.push(mod as unknown as IconModule);
      } else if (termLower.startsWith("md")) {
        const mod = await import("react-icons/md");
        modules.push(mod as unknown as IconModule);
      } else if (termLower.startsWith("gi")) {
        const mod = await import("react-icons/gi");
        modules.push(mod as unknown as IconModule);
      } else if (termLower.startsWith("hi")) {
        const mod = await import("react-icons/hi");
        modules.push(mod as unknown as IconModule);
      } else if (termLower.startsWith("io")) {
        const mod = await import("react-icons/io");
        modules.push(mod as unknown as IconModule);
      } else if (termLower.startsWith("ri")) {
        const mod = await import("react-icons/ri");
        modules.push(mod as unknown as IconModule);
      } else {
        // Se não houver correspondência de prefixo, buscar em bibliotecas comuns
        // Aumentamos o número de bibliotecas para busca
        const [fa, md, gi, bs, fi] = await Promise.all([
          import("react-icons/fa"),
          import("react-icons/md"),
          import("react-icons/gi"),
          import("react-icons/bs"),
          import("react-icons/fi"),
        ]);
        modules.push(
          fa as unknown as IconModule, 
          md as unknown as IconModule,
          gi as unknown as IconModule,
          bs as unknown as IconModule,
          fi as unknown as IconModule
        );
      }

      // Buscar ícones que correspondam ao termo de pesquisa
      let results: IconItem[] = [];

      // Busca semântica - mapear termos comuns para prefixos de ícones
      const semanticMappings: Record<string, string[]> = {
        // Guerra/Militar
        "guerra": ["sword", "tank", "bomb", "fighter", "military", "army", "weapon"],
        "militar": ["sword", "tank", "bomb", "fighter", "military", "army", "weapon"],
        "tanque": ["tank", "military", "army"],
        "avião": ["plane", "fighter", "jet"],
        "arma": ["weapon", "sword", "gun", "bomb"],
        "bomba": ["bomb", "explosion"],
        
        // Comunicação
        "comunicação": ["phone", "message", "mail", "chat", "comment"],
        "telefone": ["phone", "call"],
        "mensagem": ["message", "mail", "chat", "comment"],
        "email": ["mail", "envelope"],
        
        // Química
        "química": ["flask", "vial", "lab", "atom", "radiation"],
        "laboratório": ["flask", "vial", "lab"],
        "átomo": ["atom", "radiation"],
        
        // Geral
        "pergunta": ["question"],
        "ajuda": ["question", "help", "info"],
        "informação": ["info", "question"],
        "alerta": ["exclamation", "warning", "alert"],
        "sucesso": ["check", "success"],
        "erro": ["times", "error", "close"],
        "editar": ["edit", "pencil"],
        "deletar": ["trash", "delete", "remove"],
        "adicionar": ["plus", "add"],
        "remover": ["minus", "remove"],
        "configurar": ["cog", "settings", "gear"],
        "usuário": ["user", "person", "profile"],
        "grupo": ["users", "group", "team"],
        "tempo": ["clock", "time", "watch"],
        "local": ["map", "location", "marker"],
        "dinheiro": ["money", "dollar", "coin"],
        "documento": ["file", "document", "paper"],
        "pasta": ["folder", "directory"],
        "imagem": ["image", "photo", "picture"],
        "vídeo": ["video", "movie", "film"],
        "música": ["music", "note", "song"],
        "download": ["download", "arrow-down"],
        "upload": ["upload", "arrow-up"],
        "link": ["link", "chain"],
        "favorito": ["star", "favorite", "bookmark"],
        "coração": ["heart", "love"],
        "comentário": ["comment", "chat", "message"],
        "notificação": ["bell", "notification", "alert"],
        "calendário": ["calendar", "date", "event"],
        "busca": ["search", "magnify", "find"],
        "casa": ["home", "house"],
        "loja": ["shop", "store", "cart"],
        "segurança": ["lock", "security", "shield"],
      };

      // Verificar se o termo de busca corresponde a algum mapeamento semântico
      let semanticTerms: string[] = [];
      for (const [key, values] of Object.entries(semanticMappings)) {
        if (termLower.includes(key)) {
          semanticTerms = [...semanticTerms, ...values];
        }
      }

      modules.forEach((module) => {
        // Primeiro, tentar correspondência direta
        let matches = Object.keys(module)
          .filter((key) => key.toLowerCase().includes(termLower))
          .slice(0, 40)
          .map((name) => ({
            name,
            component: module[name]
              ? React.createElement(module[name], { size: 24 })
              : null,
          }))
          .filter((item) => item.component);

        // Se temos termos semânticos e poucos resultados diretos, adicionar resultados semânticos
        if (semanticTerms.length > 0 && matches.length < 10) {
          const semanticMatches = Object.keys(module)
            .filter((key) => 
              semanticTerms.some(term => key.toLowerCase().includes(term))
            )
            .slice(0, 30)
            .map((name) => ({
              name,
              component: module[name]
                ? React.createElement(module[name], { size: 24 })
                : null,
            }))
            .filter((item) => item.component);
          
          matches = [...matches, ...semanticMatches];
        }

        results = [...results, ...matches];
      });

      // Aumentar o limite para mostrar mais resultados
      setFilteredIcons(results.slice(0, 100));
    } catch (error) {
      // Silenciar erro
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load a specific icon component
  const loadIconComponent = async (iconName: string): Promise<ReactNode> => {
    setIsLoading(true);
    try {
      // Extract the library prefix
      const prefix = iconName.slice(0, 2).toLowerCase();

      // Dynamic import based on the prefix
      let iconModule: IconModule;
      switch (prefix) {
        case "fa": {
          const mod = await import("react-icons/fa");
          iconModule = mod as unknown as IconModule;
          break;
        }
        case "fi": {
          const mod = await import("react-icons/fi");
          iconModule = mod as unknown as IconModule;
          break;
        }
        case "ai": {
          const mod = await import("react-icons/ai");
          iconModule = mod as unknown as IconModule;
          break;
        }
        case "bs": {
          const mod = await import("react-icons/bs");
          iconModule = mod as unknown as IconModule;
          break;
        }
        case "bi": {
          const mod = await import("react-icons/bi");
          iconModule = mod as unknown as IconModule;
          break;
        }
        case "gi": {
          const mod = await import("react-icons/gi");
          iconModule = mod as unknown as IconModule;
          break;
        }
        case "hi": {
          const mod = await import("react-icons/hi");
          iconModule = mod as unknown as IconModule;
          break;
        }
        case "im": {
          const mod = await import("react-icons/im");
          iconModule = mod as unknown as IconModule;
          break;
        }
        case "io": {
          const mod = await import("react-icons/io");
          iconModule = mod as unknown as IconModule;
          break;
        }
        case "md": {
          const mod = await import("react-icons/md");
          iconModule = mod as unknown as IconModule;
          break;
        }
        case "ri": {
          const mod = await import("react-icons/ri");
          iconModule = mod as unknown as IconModule;
          break;
        }
        case "si": {
          const mod = await import("react-icons/si");
          iconModule = mod as unknown as IconModule;
          break;
        }
        case "ti": {
          const mod = await import("react-icons/ti");
          iconModule = mod as unknown as IconModule;
          break;
        }
        case "vsc": {
          const mod = await import("react-icons/vsc");
          iconModule = mod as unknown as IconModule;
          break;
        }
        case "wi": {
          const mod = await import("react-icons/wi");
          iconModule = mod as unknown as IconModule;
          break;
        }
        default: {
          const mod = await import("react-icons/fa");
          iconModule = mod as unknown as IconModule;
          break;
        }
      }

      const IconComponent = iconModule[iconName];
      return IconComponent ? <IconComponent size={24} /> : null;
    } catch (error) {
      // Silenciar erro
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle initializing with searchTerm or defaultIcon
  useEffect(() => {
    const findAndSelectIcon = async () => {
      // Inicializar diretamente com searchTerm ou defaultIcon
      if (searchTerm) {
        // If a searchTerm is provided, search and select the first result
        setIsLoading(true);
        try {
          // Use a simpler search approach for initialization to prevent loading too many libraries
          const prefix = searchTerm.toLowerCase().slice(0, 2);
          let iconModule: IconModule;

          if (prefix === "fa" || !prefix) {
            const mod = await import("react-icons/fa");
            iconModule = mod as unknown as IconModule;
          } else if (prefix === "md") {
            const mod = await import("react-icons/md");
            iconModule = mod as unknown as IconModule;
          } else if (prefix === "bs") {
            const mod = await import("react-icons/bs");
            iconModule = mod as unknown as IconModule;
          } else if (prefix === "gi") {
            const mod = await import("react-icons/gi");
            iconModule = mod as unknown as IconModule;
          } else {
            // Default to FA
            const mod = await import("react-icons/fa");
            iconModule = mod as unknown as IconModule;
          }

          // Find first matching icon
          const termLower = searchTerm.toLowerCase();
          const matchingIconName = Object.keys(iconModule).find((key) =>
            key.toLowerCase().includes(termLower),
          );

          if (matchingIconName) {
            setIcon(matchingIconName);
            const MatchedIconComponent = iconModule[matchingIconName]!;
            const component = React.createElement(MatchedIconComponent, {
              size: 24,
            });
            setIconComponent(component);

            // Also notify the parent if onIconSelect is provided
            if (onIconSelect) {
              onIconSelect(matchingIconName, component);
            }
          } else {
            // Se não encontrou correspondência, usar um ícone de fallback aleatório
            // em vez de sempre usar o ícone padrão
            const fallbackIconName = getRandomFallbackIcon();
            setIcon(fallbackIconName);
            const component = await loadIconComponent(fallbackIconName);
            setIconComponent(component);
            
            // Notificar o componente pai
            if (onIconSelect && component) {
              onIconSelect(fallbackIconName, component);
            }
          }
        } catch (error) {
          // Silenciar erro
          // Fall back to default icon
          const component = await loadIconComponent(defaultIcon);
          setIconComponent(component);
        } finally {
          setIsLoading(false);
          setInitialLoadDone(true);
        }
      } else {
        // Just load the default icon
        const component = await loadIconComponent(defaultIcon);
        setIconComponent(component);
        setInitialLoadDone(true);
      }
    };

    void findAndSelectIcon();
  }, [searchTerm, defaultIcon, onIconSelect, contextId]);

  // Handle search input changes
  useEffect(() => {
    // Skip during the initial load if we're handling searchTerm prop
    if (!initialLoadDone && searchTerm) {
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      void searchIcons(internalSearchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [internalSearchTerm, initialLoadDone]);

  const handleSelectIcon = async (selectedName: string) => {
    setIcon(selectedName);

    // Load the new icon component
    const component = await loadIconComponent(selectedName);
    setIconComponent(component);

    // If we have an external handler, call it with both the name and component
    if (onIconSelect) {
      onIconSelect(selectedName, component);
    }

    // Close the sheet after selection
    handleOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            sizeClasses[size],
            "flex items-center justify-center rounded-md border shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
          aria-label="Select icon"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            (iconComponent ?? <div className="h-4 w-4" />)
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="mb-5">
          <SheetTitle>Choose an Icon</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search icons..."
            value={internalSearchTerm}
            onChange={(e) => setInternalSearchTerm(e.target.value)}
            className="w-full"
            autoFocus
          />

          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid max-h-[65vh] grid-cols-5 gap-2 overflow-y-auto p-1">
              {filteredIcons.length > 0 ? (
                filteredIcons.map((item, index) => (
                  <Button
                    key={`${item.name}-${index}`}
                    variant={icon === item.name ? "default" : "outline"}
                    className="flex aspect-square h-12 items-center justify-center p-2"
                    onClick={() => handleSelectIcon(item.name)}
                    title={item.name}
                  >
                    {item.component}
                  </Button>
                ))
              ) : (
                <div className="col-span-5 py-8 text-center text-muted-foreground">
                  No icons found. Try a different search term.
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Export the component
export { IconPicker };
