"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Save,
  X,
  Trash2,
  Star,
  Users,
  Calendar,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import styles from "./styles/bento.module.css";
import { STORAGE_KEYS, DATA_VERSION, initializeAppData } from "./config";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Card {
  id: number;
  title: string;
  description: string;
  image: string;
  type?: string;
  tags?: string[];
  skills?: string[];
  metrics?: string;
  timeline?: string;
  priority?: string;
}

interface Section {
  id: number;
  title: string;
  content: Card[];
}

const TrialShowcase = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<
    (Card & { sectionId: number }) | null
  >(null);
  const [editForm, setEditForm] = useState<Partial<Card>>({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR);
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [userHasManuallyToggled, setUserHasManuallyToggled] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const checkMobile = () => {
      const isMobileView = window.innerWidth < 1024;
      setIsMobile(isMobileView);

      // Only auto-manage sidebar if user hasn't manually toggled
      if (!userHasManuallyToggled) {
        if (isMobileView) {
          setIsSidebarCollapsed(true);
        } else {
          // Restore from localStorage or default to open on desktop
          const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR);
          setIsSidebarCollapsed(saved ? JSON.parse(saved) : false);
        }
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [userHasManuallyToggled]);

  // Save sidebar state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && !isMobile) {
      localStorage.setItem(
        STORAGE_KEYS.SIDEBAR,
        JSON.stringify(isSidebarCollapsed),
      );
    }
  }, [isSidebarCollapsed, isMobile]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const loadSectionsData = () => {
    if (typeof window === "undefined") {
      return null;
    }

    // Check for new deployment or version change
    const dataWasCleared = initializeAppData();
    if (dataWasCleared) {
      return null; // Use initial data
    }

    const saved = localStorage.getItem(STORAGE_KEYS.SECTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved data:", e);
      }
    }
    return null;
  };

  const initialSectionsData: Section[] = [
    {
      id: 0,
      title: "Introduction",
      content: [
        {
          id: 1,
          title: "👋",
          description:
            "LLM算法工程师，相信实现AI原生需要持续的工程迭代，每天都在被新的AI技术鼓舞（RAG->ARAG,Prompt->Context,Inference-Time scaling,A2A...）,和所有人一起探索如何发挥AI的所有潜能。",
          image: "👨‍💻关于我",
          type: "个人介绍",
        },
        {
          id: 2,
          title: "学历",
          description:
            "柏林工大本硕-计算机工程。\n 论文：\n 1. HabitatDyn Dataset \n 2. Odometry-Less Indoor Dynamic Object Detection and Localization.",
          image: "⚡",
          tags: ["CV", "LLM", "PyTorch", "LiteLLM"],
        },
        {
          id: 3,
          title: "工作经历",
          description:
            "1. Bosch-亚太中央研究院-检测算法工程师实习生\n 2. Axera爱芯-车载算法工程师 \n Prompt Engineering, LLM Evaluation, and Production AI Systems",
          image: "🎯",
          skills: ["Prompt Design", "Evaluation", "RAG Systems"],
        },
      ],
    },
    {
      id: 1,
      title: "试用期项目",
      content: [
        {
          id: 4,
          title: "意图识别优化",
          description: `优化意图识别，对意图识别模块做了在180个样本上做了回归与调优：
          Good:
            1. 通过标注180个样本，了解了公司intent-based的Workflow，意图的分类
            2. 对意图做了小范围的优化，尝试了不同的结构、不同的模型、不同的参数的影响，180个样本回归61% -> 63%
            3. 发现了一些潜在的问题例如意图字面意思的影响*
          Bad:
            1. 没有从根本上尝试大的修改是否可以突破意图识别的瓶颈做大的优化
            2. 发现意图名称有轻微限制性能但是没有提出解决办法
            3. 意图结构化输出可能加长了意图识别的推理时间`,
          image: "🤖",
          metrics: "Easycase准确率 +8% Hardcase准确率 +2%*",
          type: "Evaluation Framework",
        },
        {
          id: 5,
          title: "询问优化+新场景开发",
          description: `询问实体属性的结构化调整（route子意图），价格1。0，价格2.0，活动模块优化整理
          Good:
            1. 询问+活动+价格场景下，大模型推理过程归因更明确
          Bad:
            1. 新场景尤其价格2.0受模型不稳定影响，进度比较慢影响了其他项目（意图优化，模版化）的开发`,
          image: "🔄",
          timeline: "一周+2天完成上线",
          type: "Infrastructure",
        },
        {
          id: 6,
          title: "详情页解析",
          description:
            "作为进入公司的首个项目，在公司AI能力中台的VL模型模型做了几种测试，最终选型豆包的VLM支持线上商品详情页的解析。",
          image: "📊",
          priority: "High",
          type: "Automation Pipeline",
        },
      ],
    },
    {
      id: 2,
      title: "两月目标与学习",
      content: [
        {
          id: 7,
          title: "Prompt优化策略",
          description:
            "学习并实践了各种prompt engineering技术：包括2-shot examples, role-playing, constraint setting, output formatting等。深入理解了不同LLM对prompt的敏感度差异。\n Promptinging is Fragil when the context got too long",
          image: "💡",
          tags: ["Prompt Engineering", "LLM Optimization"],
          type: "Learning & Development",
        },
        {
          id: 8,
          title: "场景拓展：生成",
          description:
            "完成了全场景Prompt配置，并实现了可配置、可回归、可复用的架构。重点优化了生成场景的prompt，探索了few-shot learning在音乐推荐场景的应用。\n1. context org kind help 2. duplicated prompt increase when the context got long 3. carefully desgined example boosting significantly 4. a slightest ambiguity can lead to unexpected results",
          image: "🎨",
          metrics: "覆盖15+场景",
          type: "Feature Development",
        },
        {
          id: 9,
          title: "Eval对话case还原",
          description:
            "建立了完整的对话日志采集、清洗、标注、评测的pipeline。实现了基于真实用户对话的自动化测试框架，支持新版本上线前的回归测试。",
          image: "🔍",
          skills: ["Data Pipeline", "Testing Framework", "Quality Assurance"],
          type: "Quality Engineering",
        },
        {
          id: 10,
          title: "行业调研与视野拓展",
          description:
            "深入调研了OpenAI、Anthropic、Google的最新LLM进展，学习了RAG、Agent、Fine-tuning等技术方向。参与了多个AI技术分享会，保持技术视野的前沿性。",
          image: "🌐",
          skills: ["Market Analysis", "User Research", "Data Analysis"],
          type: "Strategic Thinking",
        },
        {
          id: 11,
          title: "协作",
          description:
            "1. expect the unexpected: 算法开发的工作输出不再是是与否，而是百分比，与其他同学需要明确这点 2. backwards compatibility: 确保新算法与旧算法兼容，减少对现有系统的冲击",
          image: "🌐",
          skills: ["Market Analysis", "User Research", "Data Analysis"],
          type: "Strategic Thinking",
        },
        {
          id: 12,
          title: "工作方式",
          description:
            "1. 由于LLM的输出不是是与否，而是概率黑盒，持续的迭代和优化，做corner-case和模型能力的中间人",
          image: "🌐",
          skills: ["Market Analysis", "User Research", "Data Analysis"],
          type: "Strategic Thinking",
        },
      ],
    },
    {
      id: 3,
      title: "Future Plans",
      content: [
        {
          id: 11,
          title: "Eval驱动的算法开发: 评估器",
          description:
            "1. Eval定义与回归，保证新的版本不会导致旧的覆盖场景失败 \n2. 单模块/单场景可直接指标化评估 \n 3. Emphasize on ground factual recall on both prompts and chat history",
          image: "🚀",
          timeline: "Next 3 months",
          priority: "High",
          type: "Project Leadership",
        },
        {
          id: 12,
          title: "可迁移的Prompt架构: DSPy",
          description:
            "1. 结构化Prompt,兼容线上与算法开发 2.提升Prompt模版在不同LLM之间的可迁移性 3. Auto-prompting: 以数据归因的提示词自动优化 4. structured Outputs",
          image: "🧠",
          timeline: "6 months",
          priority: "Medium",
          type: "Technical Development",
        },
        {
          id: 13,
          title: "场景持续迭代",
          description:
            "Mentor new team members and build high-performing engineering culture.",
          image: "🌟",
          timeline: "Ongoing",
          priority: "High",
          type: "People Development",
        },
        {
          id: 14,
          title: "模拟对话-用户模拟",
          description:
            "Contributing back to open source community with internal tools.",
          image: "💡",
          timeline: "Ongoing",
          priority: "Medium",
          type: "Community",
        },
        {
          id: 15,
          title: "Future",
          description:
            "1. Red Teaming for testing/synthetic Data \n 2. CAI-ICAL for synthetic Data \n 3. Human-in-the-loop与prompt优化的闭环实现自动优化\n 4. chat history memory management 5. tool use, info retrieval, and data augmentation",
          image: "🏗️",
          timeline: "12 months",
          priority: "High",
          type: "Career Growth",
        },
      ],
    },
  ];

  const [sectionsData, setSectionsData] =
    useState<Section[]>(initialSectionsData);

  useEffect(() => {
    const savedData = loadSectionsData();
    if (savedData) {
      setSectionsData(savedData);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sectionsData));
    }
  }, [sectionsData]);

  const stats = [
    { number: "+8%/+2%", label: "意图", icon: Target },
    { number: "2+", label: "新场景", icon: TrendingUp },
    { number: "1", label: "详情页解析", icon: Users },
    { number: "1", label: "复现线上-Eval", icon: Calendar },
  ];

  const openEditModal = (card: Card, sectionId: number) => {
    setEditingCard({ ...card, sectionId });
    setEditForm({ ...card });
  };

  const closeEditModal = () => {
    setEditingCard(null);
    setEditForm({});
  };

  const saveCard = () => {
    if (!editingCard) return;

    setSectionsData((prev) =>
      prev.map((section) =>
        section.id === editingCard.sectionId
          ? {
              ...section,
              content: section.content.map((card) =>
                card.id === editingCard.id
                  ? { ...card, ...editForm, id: card.id }
                  : card,
              ),
            }
          : section,
      ),
    );
    closeEditModal();
  };

  const deleteCard = () => {
    if (!editingCard) return;

    setSectionsData((prev) =>
      prev.map((section) =>
        section.id === editingCard.sectionId
          ? {
              ...section,
              content: section.content.filter(
                (card) => card.id !== editingCard.id,
              ),
            }
          : section,
      ),
    );
    closeEditModal();
  };

  const addNewCard = (sectionId: number) => {
    const newCard: Card = {
      id: Date.now(),
      title: "New Card",
      description: "Add your content here",
      image: "📝",
    };

    setSectionsData((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, content: [...section.content, newCard] }
          : section,
      ),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSectionsData((prev) =>
        prev.map((section) =>
          section.id === activeSection
            ? {
                ...section,
                content: arrayMove(
                  section.content,
                  section.content.findIndex((card) => card.id === active.id),
                  section.content.findIndex((card) => card.id === over?.id),
                ),
              }
            : section,
        ),
      );
    }
  };

  const resetData = () => {
    if (
      confirm(
        "Are you sure you want to reset all data? This will clear all your customizations.",
      )
    ) {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      initializeAppData(); // Re-initialize with current version
      setSectionsData(initialSectionsData);
      setIsSidebarCollapsed(false);
      setActiveSection(0);
    }
  };

  const getLayoutClass = (cardCount: number) => {
    switch (cardCount) {
      case 0:
        return styles.emptyState;
      case 1:
        return styles.singleCard;
      case 2:
        return styles.twoCardBento;
      case 3:
        return styles.threeCardBento;
      case 4:
        return styles.fourCardBento;
      default:
        return styles.multiCardGrid;
    }
  };

  const SortableCard: React.FC<{
    card: Card;
    sectionId: number;
    isHero?: boolean;
    index: number;
    totalCards: number;
  }> = ({ card, sectionId, isHero = false, totalCards }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: card.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`card-wrapper h-full ${isDragging ? "opacity-50" : ""}`}
        {...attributes}
        {...listeners}
      >
        <div
          className={`
            card group relative h-full bg-white rounded-2xl p-6
            shadow-lg hover:shadow-xl transition-all duration-300
            border border-gray-100 hover:border-gray-200
            flex flex-col overflow-hidden
            ${isHero ? "hero-card" : ""}
            ${totalCards > 4 ? "min-h-[320px]" : ""}
          `}
        >
          <button
            onClick={() => openEditModal(card, sectionId)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-white/20 rounded-lg"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <div className="flex flex-col h-full overflow-hidden">
            <div className="text-4xl mb-4 flex-shrink-0">{card.image}</div>

            <h3
              className={`font-semibold text-gray-800 mb-3 flex-shrink-0 ${isHero ? "text-2xl" : "text-lg"}`}
            >
              {card.title}
            </h3>

            <p
              className={`text-gray-600 mb-4 flex-grow whitespace-pre-line overflow-y-auto min-h-0 ${isHero ? "text-base" : "text-sm"}`}
            >
              {card.description}
            </p>

            <div className="mt-auto space-y-3 flex-shrink-0">
              {card.metrics && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-green-600 font-medium text-sm truncate">
                    {card.metrics}
                  </span>
                </div>
              )}

              {card.skills && (
                <div className="flex flex-wrap gap-2">
                  {card.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {card.tags && (
                <div className="flex flex-wrap gap-2">
                  {card.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {card.timeline && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600 text-sm">{card.timeline}</span>
                </div>
              )}

              {card.priority && (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${card.priority === "High" ? "bg-red-500" : "bg-yellow-500"}`}
                  ></div>
                  <span className="text-gray-600 text-sm">
                    {card.priority} Priority
                  </span>
                </div>
              )}

              {card.type && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    {card.type}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentSection =
    sectionsData.find((section) => section.id === activeSection) ||
    sectionsData[0];
  const layoutClass = getLayoutClass(currentSection.content.length);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Background blur effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-60"></div>
      <div className="fixed inset-4 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/30"></div>

      <div
        className={`
        relative z-10 flex h-screen p-4 gap-4
        transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
      `}
      >
        {/* Left Sidebar */}
        <div
          className={`
            ${isSidebarCollapsed ? (isMobile ? "w-0" : "w-16") : "w-72"}
            transition-all duration-300 bg-white rounded-3xl shadow-2xl
            overflow-hidden flex flex-col relative
          `}
        >
          {/* Collapse Toggle Button */}
          <button
            onClick={() => {
              setUserHasManuallyToggled(true);
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }}
            className={`
              absolute ${isSidebarCollapsed ? "right-2" : "right-4"} top-4 z-10
              p-2 hover:bg-gray-100 rounded-lg transition-all duration-200
              ${isMobile && isSidebarCollapsed ? "hidden" : ""}
            `}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>

          <div
            className={`p-8 flex flex-col h-full ${isSidebarCollapsed && !isMobile ? "p-4" : ""}`}
          >
            {/* Header */}
            <div
              className={`mb-8 ${isSidebarCollapsed && !isMobile ? "text-center" : ""}`}
            >
              <h1
                className={`font-bold text-gray-800 mb-2 ${isSidebarCollapsed ? "text-sm" : "text-3xl"}`}
              >
                {isSidebarCollapsed && !isMobile ? "试" : "试用期汇报"}
              </h1>
              {!isSidebarCollapsed && (
                <p className="text-gray-600">高1 - LLM算法工程师</p>
              )}
            </div>

            {/* Stats Grid */}
            {!isSidebarCollapsed && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-3 text-center transform hover:scale-105 transition-transform duration-300 flex flex-col items-center justify-center min-h-[110px]"
                  >
                    <stat.icon className="w-7 h-7 mb-2 text-blue-600" />
                    <div className="text-base font-bold text-gray-800 whitespace-nowrap">
                      {stat.number}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 leading-tight">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <nav className="space-y-2 flex-grow">
              {sectionsData.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    w-full text-left rounded-xl transition-all duration-300
                    ${
                      activeSection === section.id
                        ? "bg-blue-100 text-blue-700 shadow-md transform scale-105"
                        : "hover:bg-gray-100 text-gray-700"
                    }
                    ${isSidebarCollapsed && !isMobile ? "p-2 text-center" : "p-4"}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-medium ${isSidebarCollapsed && !isMobile ? "text-xs" : ""}`}
                    >
                      {isSidebarCollapsed && !isMobile
                        ? section.title.slice(0, 2)
                        : section.title}
                    </span>
                    {!isSidebarCollapsed && (
                      <span className="text-sm opacity-60">
                        {section.content.length}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </nav>

            {/* Icons at bottom */}
            {!isSidebarCollapsed && (
              <div className="mt-8 grid grid-cols-4 gap-2">
                {[Star, Award, BookOpen, Lightbulb].map((Icon, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 rounded-lg p-3 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 h-full flex flex-col">
            {/* Content Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentSection.title}
                </h2>
                <p className="text-gray-600 mt-1">
                  {currentSection.content.length} items
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => addNewCard(currentSection.id)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Add Card
                </button>
                <button
                  onClick={resetData}
                  className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <X className="w-5 h-5" />
                  Reset Data
                </button>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="flex-1 overflow-y-auto">
              {currentSection.content.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No cards yet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Start by adding your first card
                    </p>
                    <button
                      onClick={() => addNewCard(currentSection.id)}
                      className="bg-blue-100 text-blue-700 px-6 py-3 rounded-xl hover:bg-blue-200 transition-colors"
                    >
                      <Plus className="w-5 h-5 inline mr-2" />
                      Create Card
                    </button>
                  </div>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={currentSection.content.map((card) => card.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div
                      className={`${styles.contentGrid} ${layoutClass}`}
                      style={{
                        // Ensure proper minimum height for grid items to prevent overlap
                        gridAutoRows:
                          currentSection.content.length > 4
                            ? "minmax(320px, max-content)"
                            : undefined,
                      }}
                    >
                      {currentSection.content.map((card, index) => (
                        <SortableCard
                          key={card.id}
                          card={card}
                          sectionId={currentSection.id}
                          isHero={
                            index === 0 && currentSection.content.length === 3
                          }
                          index={index}
                          totalCards={currentSection.content.length}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-modal">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Edit Card</h3>
              <button
                onClick={closeEditModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image/Emoji
                </label>
                <input
                  type="text"
                  value={editForm.image || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, image: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="📝"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editForm.title || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Card title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Card description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <input
                  type="text"
                  value={editForm.type || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Card type"
                />
              </div>

              {editForm.tags && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editForm.tags?.join(", ") || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        tags: e.target.value
                          .split(", ")
                          .filter((tag) => tag.trim()),
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              )}

              {editForm.skills && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editForm.skills?.join(", ") || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        skills: e.target.value
                          .split(", ")
                          .filter((skill) => skill.trim()),
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="skill1, skill2, skill3"
                  />
                </div>
              )}

              {editForm.metrics && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metrics
                  </label>
                  <input
                    type="text"
                    value={editForm.metrics || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, metrics: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="40% increase"
                  />
                </div>
              )}

              {editForm.timeline && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline
                  </label>
                  <input
                    type="text"
                    value={editForm.timeline || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, timeline: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Next 3 months"
                  />
                </div>
              )}

              {editForm.priority && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={editForm.priority || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, priority: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={saveCard}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={deleteCard}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={closeEditModal}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modal {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-modal {
          animation: modal 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TrialShowcase;
