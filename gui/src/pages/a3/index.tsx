import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import styles from "./index.module.css";

interface PlatformInfo {
  id: string;
  name: string;
  description: string;
  url: string;
  installation: string;
  tags: string[];
}

const platforms: PlatformInfo[] = [
  {
    id: "A3Cloud",
    name: "A3Cloud 开发平台",
    description:
      "安硕科技自主研发的企业级开发平台，提供完整的开发工具链和微服务架构支持",
    url: "http://192.168.65.231",
    installation: "在 IntelliJ IDEA 插件市场中搜索 'A3Cloud' 并安装",
    tags: ["开发平台", "微服务", "企业级"],
  },
  {
    id: "A3UI",
    name: "A3UI 技术架构",
    description:
      "基于 React + TypeScript 的前端组件库，提供丰富的 UI 组件和开发规范",
    url: "http://192.168.65.227:3000",
    installation: "访问文档网站查看详细技术文档和使用指南",
    tags: ["前端", "React", "组件库"],
  },
];

const A3CloudDocumentation: React.FC = () => {
  const ideMessenger = useContext(IdeMessengerContext);
  const navigate = useNavigate();

  const handleOpenUrl = (url: string) => {
    ideMessenger.post("openUrl", url);
  };

  return (
    <div className={styles.container}>
      <PageHeader showBorder onTitleClick={() => navigate("/")} title="对话" />
      <h1>A3Cloud 开发平台文档</h1>
      <p className={styles.intro}>
        A3Cloud
        是安硕科技自主研发的企业级开发平台，为金融行业提供完整的开发解决方案。
      </p>

      <div className={styles.gridContainer}>
        {platforms.map((platform) => (
          <div key={platform.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{platform.name}</h3>
            <div className={styles.tags}>
              {platform.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
            <p className={styles.cardDescription}>{platform.description}</p>

            <div className={styles.platformInfo}>
              <div className={styles.infoRow}>
                <strong>访问地址:</strong>
                <span
                  className={styles.link}
                  onClick={() => handleOpenUrl(platform.url)}
                >
                  {platform.url}
                </span>
              </div>
              <div className={styles.infoRow}>
                <strong>安装方式:</strong>
                <span>{platform.installation}</span>
              </div>
            </div>

            <div className={styles.buttonContainer}>
              <button
                className={styles.openButton}
                onClick={() => handleOpenUrl(platform.url)}
              >
                打开文档
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.features}>
        <h2>平台特性</h2>
        <ul className={styles.featureList}>
          <li>
            🚀 <strong>微服务架构</strong> - 支持分布式系统开发和部署
          </li>
          <li>
            🔧 <strong>开发工具链</strong> - 提供完整的开发、测试、部署工具
          </li>
          <li>
            📚 <strong>技术文档</strong> - 详细的使用指南和最佳实践
          </li>
          <li>
            🎯 <strong>企业级支持</strong> - 专为金融行业定制开发
          </li>
          <li>
            ⚡ <strong>高性能</strong> - 优化的前端组件和后台服务
          </li>
        </ul>
      </div>
    </div>
  );
};

export default A3CloudDocumentation;
