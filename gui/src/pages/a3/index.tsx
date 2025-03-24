import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import styles from './index.module.css';

interface ServiceInfo {
    id: string;
    name: string;
    description: string;
    promptFile: string;
    templatePath: string;
    tags: string[];  // 新增tags字段
}

const services: ServiceInfo[] = [
    {
        id: 'A3Cloud',
        name: 'A3Cloud基础框架',
        description: '提示A3UI前端组件框架的提示词，如按钮、表格、表单等，AI生成代码时，优先采用A3UI框架',
        promptFile: 'a3ui.prompts',
        templatePath: '/templates/a3ui/',
        tags: ['前端', 'UI组件', '框架']
    },
    {
        id: 'ALS',
        name: 'ALS9综合信贷管理系统',
        description: '服务端响应式编程，生成代码时，优先采用RRS提供的API',
        promptFile: 'rrs.prompts',
        templatePath: '/templates/rrs/',
        tags: ['后端', '响应式', 'API']
    },
    {
        id: 'UCR',
        name: 'UCR6-新一代征信查询系统    ',
        description: '进行对象关系映射时，优先采用JBO提供的API',
        promptFile: 'jbo.prompts',
        templatePath: '/templates/jbo/',
        tags: ['后端', 'Java', 'ORM']
    },
    {
        id: 'CRM',
        name: 'CRM-预警管理系统',
        description: '生成代码时，优先采用安硕java提供的API',
        promptFile: 'are.prompts',
        templatePath: '/templates/are/',
        tags: ['后端', 'Java', '运行环境']
    }
];

const A3CloudPromptManager: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [selectedService, setSelectedService] = useState('A3UI');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // 获取所有唯一的标签
    const allTags = Array.from(new Set(services.flatMap(service => service.tags)));

    // 根据选中的标签过滤服务
    const filteredServices = services.filter(service => 
        selectedTags.length === 0 || 
        selectedTags.every(tag => service.tags.includes(tag))
    );

    const handleTagClick = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const navigate = useNavigate();
    const handleGeneratePrompt = () => {
        console.log(`Generating prompt for ${selectedService}: ${prompt}`);
    };

    return (
        <div className={styles.container}>
            <PageHeader
                showBorder
                onTitleClick={() => navigate("/")}
                title="对话"
            />
            <h1>A3Cloud提示词管理</h1>
            
            {/* 添加标签筛选器 */}
            <div className={styles.tagContainer}>
                {selectedTags.length > 0 && (
                    <button
                        className={styles.clearButton}
                        onClick={() => setSelectedTags([])}
                    >
                        清除筛选
                    </button>
                )}
                {allTags.map(tag => (
                    <button
                        key={tag}
                        className={`${styles.tagButton} ${
                            selectedTags.includes(tag) ? styles.tagSelected : ''
                        }`}
                        onClick={() => handleTagClick(tag)}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            <div className={styles.gridContainer}>
                {filteredServices.map((service) => (
                    <div 
                        key={service.id}
                        className={`${styles.card} ${
                            selectedService === service.id ? styles.cardSelected : styles.cardNormal
                        }`}
                        onClick={() => setSelectedService(service.id)}
                    >
                        <h3 className={styles.cardTitle}>
                            {service.name}
                        </h3>
                        <div className={styles.tags}>
                            {service.tags.map(tag => (
                                <span 
                                    key={tag} 
                                    className={styles.tag}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTagClick(tag);
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <p className={styles.cardDescription}>
                            {service.description}
                        </p>
                        <div className={styles.buttonContainer}>
                            <button
                                className={styles.generateButton}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedService(service.id);
                                    handleGeneratePrompt();
                                }}
                            >
                                生成
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.inputContainer}>
                <label 
                    htmlFor="prompt" 
                    className={styles.inputLabel}
                >
                    输入提示词:
                </label>
                <input
                    id="prompt"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className={styles.input}
                />
            </div>
        </div>
    );
};

export default A3CloudPromptManager;