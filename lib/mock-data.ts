// AgentHub Mock Data

export type Agent = {
  id: string
  name: string
  author: string
  avatar: string
  description: string
  price: number | null // null = 免费
  category: string
  provider: string
  capabilities: string[]
  rating: number
  runs: number
  featured?: boolean
}

export type RunRecord = {
  id: string
  agentId: string
  agentName: string
  timestamp: Date
  status: 'success' | 'error' | 'running'
  duration: number // ms
  cost: number // tokens
  input: string
  output: string
  traces: TraceNode[]
}

export type TraceNode = {
  id: string
  name: string
  type: 'llm' | 'tool' | 'chain' | 'retriever' | 'agent'
  startTime: number
  duration: number
  status: 'success' | 'error'
  tokens?: number
  children?: TraceNode[]
}

export type PricingPlan = {
  id: string
  name: string
  price: number | null
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}

export const categories = [
  '代码助手',
  '写作助手',
  '数据分析',
  '客服机器人',
  '翻译工具',
  '图像处理',
  '搜索增强',
  '知识问答',
  '任务自动化',
  '创意生成',
]

export const providers = ['OpenAI', 'Anthropic', 'Google', 'Meta', 'DeepSeek']

export const capabilities = [
  'MCP',
  'Tool Use',
  'RAG',
  'Code Execution',
  'Web Search',
  'Image Generation',
  'Voice',
  'Multi-modal',
]

export const featuredAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'CodePilot Pro',
    author: 'AgentHub 官方',
    avatar: '/agents/codepilot.svg',
    description: '智能代码助手，支持多语言代码生成、重构和调试。集成 MCP 协议，可直接操作你的代码库。',
    price: null,
    category: '代码助手',
    provider: 'Anthropic',
    capabilities: ['MCP', 'Code Execution', 'Tool Use'],
    rating: 4.9,
    runs: 125000,
    featured: true,
  },
  {
    id: 'agent-2',
    name: 'DataSense',
    author: 'DataLab',
    avatar: '/agents/datasense.svg',
    description: '专业数据分析 Agent，支持 SQL 生成、数据可视化建议和异常检测。',
    price: 20,
    category: '数据分析',
    provider: 'OpenAI',
    capabilities: ['Tool Use', 'Code Execution'],
    rating: 4.7,
    runs: 89000,
    featured: true,
  },
  {
    id: 'agent-3',
    name: 'DocWriter',
    author: '文墨工作室',
    avatar: '/agents/docwriter.svg',
    description: '专业写作助手，擅长技术文档、营销文案和学术论文。支持多种风格和语气定制。',
    price: 15,
    category: '写作助手',
    provider: 'Anthropic',
    capabilities: ['RAG', 'Web Search'],
    rating: 4.8,
    runs: 156000,
    featured: true,
  },
  {
    id: 'agent-4',
    name: 'SearchMaster',
    author: 'SeekAI',
    avatar: '/agents/searchmaster.svg',
    description: '智能搜索增强 Agent，整合多个搜索引擎和知识库，提供精准答案。',
    price: null,
    category: '搜索增强',
    provider: 'Google',
    capabilities: ['Web Search', 'RAG'],
    rating: 4.6,
    runs: 234000,
    featured: true,
  },
  {
    id: 'agent-5',
    name: 'PolyTranslate',
    author: 'LinguaAI',
    avatar: '/agents/polytranslate.svg',
    description: '多语言翻译 Agent，支持 50+ 语言互译，保持原文风格和专业术语准确性。',
    price: 10,
    category: '翻译工具',
    provider: 'DeepSeek',
    capabilities: ['Multi-modal'],
    rating: 4.5,
    runs: 178000,
    featured: true,
  },
  {
    id: 'agent-6',
    name: 'VisionCraft',
    author: 'PixelMind',
    avatar: '/agents/visioncraft.svg',
    description: '图像理解和处理 Agent，支持图像分析、编辑建议和创意生成。',
    price: 25,
    category: '图像处理',
    provider: 'OpenAI',
    capabilities: ['Multi-modal', 'Image Generation'],
    rating: 4.8,
    runs: 92000,
    featured: true,
  },
]

// 生成 24 个 Agents 用于 Gallery
export const allAgents: Agent[] = [
  ...featuredAgents,
  {
    id: 'agent-7',
    name: 'SupportBot',
    author: 'ServiceAI',
    avatar: '/agents/supportbot.svg',
    description: '智能客服机器人，支持多轮对话、情感识别和工单系统集成。',
    price: 30,
    category: '客服机器人',
    provider: 'Anthropic',
    capabilities: ['Tool Use', 'RAG'],
    rating: 4.4,
    runs: 67000,
  },
  {
    id: 'agent-8',
    name: 'TaskFlow',
    author: 'AutomateHQ',
    avatar: '/agents/taskflow.svg',
    description: '任务自动化 Agent，连接多个 SaaS 平台，实现跨应用工作流自动化。',
    price: 35,
    category: '任务自动化',
    provider: 'OpenAI',
    capabilities: ['MCP', 'Tool Use'],
    rating: 4.6,
    runs: 45000,
  },
  {
    id: 'agent-9',
    name: 'CreativeGen',
    author: '灵感工厂',
    avatar: '/agents/creativegen.svg',
    description: '创意生成助手，帮助你头脑风暴、构思创意和完善想法。',
    price: null,
    category: '创意生成',
    provider: 'Anthropic',
    capabilities: ['Multi-modal'],
    rating: 4.3,
    runs: 88000,
  },
  {
    id: 'agent-10',
    name: 'KnowledgeBase',
    author: 'WikiAI',
    avatar: '/agents/knowledgebase.svg',
    description: '知识问答专家，基于海量知识库提供准确、引用完整的答案。',
    price: 12,
    category: '知识问答',
    provider: 'Google',
    capabilities: ['RAG', 'Web Search'],
    rating: 4.7,
    runs: 134000,
  },
  {
    id: 'agent-11',
    name: 'CodeReviewer',
    author: 'DevTools',
    avatar: '/agents/codereviewer.svg',
    description: '代码审查助手，自动检测代码问题、安全漏洞和性能瓶颈。',
    price: 18,
    category: '代码助手',
    provider: 'Anthropic',
    capabilities: ['Code Execution', 'Tool Use'],
    rating: 4.5,
    runs: 56000,
  },
  {
    id: 'agent-12',
    name: 'SQLWizard',
    author: 'DataLab',
    avatar: '/agents/sqlwizard.svg',
    description: '自然语言转 SQL，支持复杂查询生成和查询优化建议。',
    price: 15,
    category: '数据分析',
    provider: 'OpenAI',
    capabilities: ['Code Execution'],
    rating: 4.6,
    runs: 78000,
  },
  {
    id: 'agent-13',
    name: 'BlogMaster',
    author: '文墨工作室',
    avatar: '/agents/blogmaster.svg',
    description: '博客写作专家，从选题到成稿一站式服务，SEO 优化内置。',
    price: 20,
    category: '写作助手',
    provider: 'Anthropic',
    capabilities: ['Web Search', 'RAG'],
    rating: 4.4,
    runs: 67000,
  },
  {
    id: 'agent-14',
    name: 'ResearchBot',
    author: 'AcademicAI',
    avatar: '/agents/researchbot.svg',
    description: '学术研究助手，文献检索、论文摘要和研究方向建议。',
    price: 25,
    category: '搜索增强',
    provider: 'Google',
    capabilities: ['Web Search', 'RAG'],
    rating: 4.8,
    runs: 45000,
  },
  {
    id: 'agent-15',
    name: 'LegalTranslate',
    author: 'LinguaAI',
    avatar: '/agents/legaltranslate.svg',
    description: '法律文档专业翻译，确保术语准确和格式规范。',
    price: 30,
    category: '翻译工具',
    provider: 'DeepSeek',
    capabilities: ['RAG'],
    rating: 4.6,
    runs: 34000,
  },
  {
    id: 'agent-16',
    name: 'ImageAnalyzer',
    author: 'PixelMind',
    avatar: '/agents/imageanalyzer.svg',
    description: '图像分析专家，物体检测、场景理解和图像描述生成。',
    price: 18,
    category: '图像处理',
    provider: 'Google',
    capabilities: ['Multi-modal'],
    rating: 4.5,
    runs: 56000,
  },
  {
    id: 'agent-17',
    name: 'ChatAssist',
    author: 'ServiceAI',
    avatar: '/agents/chatassist.svg',
    description: '多渠道客服整合，支持微信、邮件、网页等多平台接入。',
    price: null,
    category: '客服机器人',
    provider: 'Meta',
    capabilities: ['Tool Use'],
    rating: 4.2,
    runs: 89000,
  },
  {
    id: 'agent-18',
    name: 'WorkflowAI',
    author: 'AutomateHQ',
    avatar: '/agents/workflowai.svg',
    description: '可视化工作流编排，无代码创建复杂自动化流程。',
    price: 40,
    category: '任务自动化',
    provider: 'OpenAI',
    capabilities: ['MCP', 'Tool Use', 'Code Execution'],
    rating: 4.7,
    runs: 38000,
  },
  {
    id: 'agent-19',
    name: 'IdeaStorm',
    author: '灵感工厂',
    avatar: '/agents/ideastorm.svg',
    description: '产品创意生成器，市场分析结合创意发散。',
    price: 15,
    category: '创意生成',
    provider: 'Anthropic',
    capabilities: ['Web Search'],
    rating: 4.4,
    runs: 52000,
  },
  {
    id: 'agent-20',
    name: 'FactChecker',
    author: 'WikiAI',
    avatar: '/agents/factchecker.svg',
    description: '事实核查助手，多源验证，标注可信度评分。',
    price: null,
    category: '知识问答',
    provider: 'Google',
    capabilities: ['Web Search', 'RAG'],
    rating: 4.3,
    runs: 78000,
  },
  {
    id: 'agent-21',
    name: 'APIBuilder',
    author: 'DevTools',
    avatar: '/agents/apibuilder.svg',
    description: '从自然语言描述生成 REST API 代码和文档。',
    price: 22,
    category: '代码助手',
    provider: 'OpenAI',
    capabilities: ['Code Execution', 'Tool Use'],
    rating: 4.6,
    runs: 43000,
  },
  {
    id: 'agent-22',
    name: 'ChartGen',
    author: 'DataLab',
    avatar: '/agents/chartgen.svg',
    description: '数据可视化生成器，从数据到图表一步到位。',
    price: 12,
    category: '数据分析',
    provider: 'OpenAI',
    capabilities: ['Code Execution', 'Image Generation'],
    rating: 4.5,
    runs: 67000,
  },
  {
    id: 'agent-23',
    name: 'EmailWriter',
    author: '文墨工作室',
    avatar: '/agents/emailwriter.svg',
    description: '商务邮件写作助手，专业、简洁、得体。',
    price: null,
    category: '写作助手',
    provider: 'Meta',
    capabilities: [],
    rating: 4.2,
    runs: 123000,
  },
  {
    id: 'agent-24',
    name: 'PaperFinder',
    author: 'AcademicAI',
    avatar: '/agents/paperfinder.svg',
    description: '学术论文检索专家，支持多数据库联合搜索。',
    price: 18,
    category: '搜索增强',
    provider: 'Google',
    capabilities: ['Web Search'],
    rating: 4.7,
    runs: 38000,
  },
]

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: '免费版',
    price: null,
    period: '永久免费',
    description: '适合个人开发者和小型项目试用',
    features: [
      '每月 1000 次 API 调用',
      '访问所有免费 Agent',
      '基础 Playground 功能',
      '社区支持',
      '7 天运行历史',
    ],
    cta: '免费开始',
  },
  {
    id: 'pro',
    name: '专业版',
    price: 20,
    period: '每月',
    description: '适合独立开发者和小团队',
    features: [
      '每月 10000 次 API 调用',
      '访问所有 Agent',
      '高级 Playground 功能',
      'Trace 执行分析',
      '优先邮件支持',
      '30 天运行历史',
      'API 密钥管理',
      'Webhook 集成',
    ],
    highlighted: true,
    cta: '升级到专业版',
  },
  {
    id: 'team',
    name: '团队版',
    price: 50,
    period: '每席位/每月',
    description: '适合中大型团队和企业',
    features: [
      '无限 API 调用',
      '访问所有 Agent + 优先体验新功能',
      '完整 Playground 和编排功能',
      '完整 Trace 分析 + 导出',
      '专属客户经理',
      '无限运行历史',
      '团队协作功能',
      'SSO 单点登录',
      '自定义 Agent 部署',
      'SLA 保障',
    ],
    cta: '联系销售',
  },
]

export const faqItems = [
  {
    question: 'AgentHub 和传统 API 调用有什么区别？',
    answer:
      'AgentHub 提供的是经过优化和封装的 AI Agent，而不是原始的 API 调用。每个 Agent 都针对特定任务进行了提示词工程和工具集成，开箱即用，大大降低了开发复杂度。',
  },
  {
    question: '我可以在 AgentHub 上发布自己的 Agent 吗？',
    answer:
      '可以！我们欢迎开发者在 AgentHub 上发布自己的 Agent。通过我们的 SDK，你可以快速创建、测试和发布 Agent，并通过订阅模式获得收益。',
  },
  {
    question: '免费版有什么限制？',
    answer:
      '免费版每月提供 1000 次 API 调用额度，可以访问所有标记为免费的 Agent，并使用基础的 Playground 功能。运行历史保留 7 天。',
  },
  {
    question: '如何保证数据安全？',
    answer:
      '我们采用端到端加密传输，所有数据存储在符合 SOC 2 Type II 认证的数据中心。你可以选择数据不被用于模型训练，且支持数据导出和删除请求。',
  },
  {
    question: '支持哪些支付方式？',
    answer:
      '我们支持信用卡（Visa、Mastercard、American Express）、PayPal，以及对于中国用户，我们支持支付宝和微信支付。企业用户可以申请对公转账。',
  },
  {
    question: '可以随时取消订阅吗？',
    answer:
      '当然可以。你可以随时在账户设置中取消订阅，取消后将在当前计费周期结束后停止收费，你仍可以使用到周期结束。',
  },
]

export const mockRunHistory: RunRecord[] = [
  {
    id: 'run-1',
    agentId: 'agent-1',
    agentName: 'CodePilot Pro',
    timestamp: new Date('2024-01-15T14:32:00'),
    status: 'success',
    duration: 2340,
    cost: 1250,
    input: '帮我重构这个 React 组件，使用 TypeScript 和 hooks',
    output: '已完成组件重构，主要改动包括：\n1. 添加了 TypeScript 类型定义\n2. 将 class 组件转换为函数组件\n3. 使用 useState 和 useEffect 替代生命周期方法',
    traces: [
      {
        id: 't1',
        name: '解析输入',
        type: 'chain',
        startTime: 0,
        duration: 120,
        status: 'success',
      },
      {
        id: 't2',
        name: 'Claude 3.5 Sonnet',
        type: 'llm',
        startTime: 120,
        duration: 1800,
        status: 'success',
        tokens: 890,
        children: [
          {
            id: 't2-1',
            name: '代码分析',
            type: 'tool',
            startTime: 150,
            duration: 200,
            status: 'success',
          },
          {
            id: 't2-2',
            name: '重构建议',
            type: 'tool',
            startTime: 400,
            duration: 1400,
            status: 'success',
          },
        ],
      },
      {
        id: 't3',
        name: '格式化输出',
        type: 'chain',
        startTime: 1920,
        duration: 420,
        status: 'success',
      },
    ],
  },
  {
    id: 'run-2',
    agentId: 'agent-2',
    agentName: 'DataSense',
    timestamp: new Date('2024-01-15T13:15:00'),
    status: 'success',
    duration: 1560,
    cost: 780,
    input: '分析这份销售数据，找出季度趋势',
    output: '分析完成。Q3 销售额同比增长 23%，主要增长来自新用户获取...',
    traces: [
      {
        id: 't1',
        name: '数据解析',
        type: 'tool',
        startTime: 0,
        duration: 300,
        status: 'success',
      },
      {
        id: 't2',
        name: 'GPT-5',
        type: 'llm',
        startTime: 300,
        duration: 1100,
        status: 'success',
        tokens: 560,
      },
      {
        id: 't3',
        name: '生成报告',
        type: 'chain',
        startTime: 1400,
        duration: 160,
        status: 'success',
      },
    ],
  },
  {
    id: 'run-3',
    agentId: 'agent-3',
    agentName: 'DocWriter',
    timestamp: new Date('2024-01-15T11:45:00'),
    status: 'error',
    duration: 890,
    cost: 320,
    input: '写一篇关于微服务架构的技术博客',
    output: '错误：上下文长度超出限制',
    traces: [
      {
        id: 't1',
        name: '主题研究',
        type: 'retriever',
        startTime: 0,
        duration: 400,
        status: 'success',
      },
      {
        id: 't2',
        name: 'Claude 3.5 Sonnet',
        type: 'llm',
        startTime: 400,
        duration: 490,
        status: 'error',
        tokens: 320,
      },
    ],
  },
  {
    id: 'run-4',
    agentId: 'agent-4',
    agentName: 'SearchMaster',
    timestamp: new Date('2024-01-15T10:20:00'),
    status: 'success',
    duration: 3200,
    cost: 450,
    input: '搜索最新的 Next.js 15 新特性',
    output: 'Next.js 15 主要新特性包括：\n1. Turbopack 稳定版\n2. 改进的缓存策略\n3. React 19 支持...',
    traces: [
      {
        id: 't1',
        name: 'Web 搜索',
        type: 'tool',
        startTime: 0,
        duration: 1200,
        status: 'success',
      },
      {
        id: 't2',
        name: '结果聚合',
        type: 'chain',
        startTime: 1200,
        duration: 800,
        status: 'success',
      },
      {
        id: 't3',
        name: 'Gemini 3 Flash',
        type: 'llm',
        startTime: 2000,
        duration: 1200,
        status: 'success',
        tokens: 380,
      },
    ],
  },
  {
    id: 'run-5',
    agentId: 'agent-1',
    agentName: 'CodePilot Pro',
    timestamp: new Date('2024-01-15T09:05:00'),
    status: 'success',
    duration: 1890,
    cost: 920,
    input: '给这个函数添加单元测试',
    output: '已生成 5 个测试用例，覆盖主要分支和边界情况...',
    traces: [
      {
        id: 't1',
        name: '代码分析',
        type: 'tool',
        startTime: 0,
        duration: 200,
        status: 'success',
      },
      {
        id: 't2',
        name: 'Claude 3.5 Sonnet',
        type: 'llm',
        startTime: 200,
        duration: 1500,
        status: 'success',
        tokens: 750,
      },
      {
        id: 't3',
        name: '测试验证',
        type: 'tool',
        startTime: 1700,
        duration: 190,
        status: 'success',
      },
    ],
  },
]

export const stats = [
  { label: '个 Agent', value: '500+' },
  { label: '开发者', value: '1 万+' },
  { label: '次运行', value: '5000 万+' },
  { label: '可用性', value: '99.9%' },
]

export const valueProps = [
  {
    title: '生成式 UI 流式渲染',
    description: '实时流式输出，支持 Markdown、代码高亮、图表等富内容渲染，交互体验媲美原生应用。',
    icon: 'Sparkles',
  },
  {
    title: 'Token 用量事前预估',
    description: '发送前预估 Token 消耗和费用，避免意外超支。智能截断和压缩策略，优化成本效率。',
    icon: 'Calculator',
  },
  {
    title: 'Trace 执行瀑布图',
    description: '完整的执行链路追踪，可视化每一步耗时和 Token 消耗。快速定位性能瓶颈，优化 Agent 表现。',
    icon: 'Activity',
  },
]

export const footerLinks = {
  产品: [
    { label: 'Agent 商店', href: '/gallery' },
    { label: 'Playground', href: '/gallery' },
    { label: '定价', href: '/pricing' },
    { label: 'API 文档', href: '#' },
    { label: 'SDK', href: '#' },
  ],
  资源: [
    { label: '开发者文档', href: '#' },
    { label: '教程', href: '#' },
    { label: '博客', href: '#' },
    { label: '更新日志', href: '#' },
    { label: '状态页面', href: '#' },
  ],
  公司: [
    { label: '关于我们', href: '#' },
    { label: '加入我们', href: '#' },
    { label: '联系我们', href: '#' },
    { label: '合作伙伴', href: '#' },
  ],
  法律: [
    { label: '服务条款', href: '#' },
    { label: '隐私政策', href: '#' },
    { label: '安全说明', href: '#' },
  ],
}
