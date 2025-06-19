# OpenWeb Proxy

OpenWeb Proxy is a free, open-source web proxy service built on Cloudflare Workers. It allows users to bypass network restrictions and access the global internet :earth_americas: securely and anonymously. With a modern, business-friendly interface, it supports bilingual (English and Chinese) navigation and is designed for easy deployment and customization. :fire:

OpenWeb 代理是一个基于 Cloudflare Workers 的免费开源网页代理服务。它帮助用户绕过网络限制，安全匿名地访问互联网 :earth_americas: 。项目采用现代化、商务友好的界面，支持中英文双语导航，易于部署和定制。 :fire:

:sparkles: For detailed tutorials, please search for "Dynaverse Lab" on bilibili. :sparkles:

:sparkles: 详细教程请在bilibili搜索“Dynaverse实验室” :sparkles:

## Features

**Secure Proxy Access**: Forward requests to target websites, rewriting URLs to ensure seamless navigation.

- **Bilingual Interface**: Supports English and Chinese with automatic language detection and user preference storage via cookies.
- **Modern UI**: Business-bright design with responsive layout for desktop and mobile devices.
- **Popular Sites**: Quick access to popular websites like Google, YouTube, and Wikipedia.
- **Password Protection** :lock: : Optional password-based access control for enhanced security.
- **Open Source**: Licensed under MIT, encouraging community contributions and forks.
- **Lightweight Deployment**: Runs on Cloudflare Workers, requiring minimal setup.
- ----------------------------------
- **安全代理访问**：将请求转发到目标网站，重写 URL 确保无缝导航。
- **双语界面**：支持英文和中文，自动检测语言并通过 cookie 存储用户偏好。
- **现代化界面**：商务明亮的设计，支持桌面和移动设备的响应式布局。
- **热门网站**：快速访问 Google、YouTube、Wikipedia 等热门网站。
- **密码保护** :lock: ：可选的密码访问控制，增强安全性。
- **开源**：采用 MIT 许可证，鼓励社区贡献和 fork。
- **轻量级部署**：基于 Cloudflare Workers，设置简单。

## Installation

### Prerequisites

- A Cloudflare account with Workers enabled.
- Basic knowledge of JavaScript and Cloudflare Workers.
- A GitHub account for forking the repository.

### Deployment Steps

1. **Fork the Repository**:

   - Fork this repository to your GitHub account: https://github.com/your-username/openweb-proxy.

2. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/openweb-proxy.git
   cd openweb-proxy
   ```

3. **Install Wrangler**:

   - Install the Cloudflare Wrangler CLI globally:

     ```bash
     npm install -g wrangler
     ```

4. **Authenticate Wrangler**:

   - Log in to your Cloudflare account:

     ```bash
     wrangler login
     ```

5. **Configure the Worker**:

   - Copy `wrangler.toml.example` to `wrangler.toml` and update the `name` and `account_id` fields.
   - Optionally, set a password in the Worker script by modifying the `password` variable (leave empty to disable password protection).

6. **Deploy to Cloudflare Workers**:

   - Deploy the Worker script:

     ```bash
     wrangler deploy
     ```

   - Your proxy will be available at `https://<worker-name>.<your-subdomain>.workers.dev`.

7. **Customize**:

   - Update the `index.html` and `error.html` files to replace placeholders (e.g., `https://example.com`, `your-username`) with your proxy domain and GitHub details.
   - Add or modify popular site cards in `index.html` as needed.

### 前提条件

- 启用了 Workers 的 Cloudflare 账户。
- 基本的 JavaScript 和 Cloudflare Workers 知识。
- 用于 fork 仓库的 GitHub 账户。

### 部署步骤

1. **Fork 仓库**：

   - 将此仓库 fork 到你的 GitHub 账户：https://github.com/your-username/openweb-proxy。

2. **克隆仓库**：

   ```bash
   git clone https://github.com/your-username/openweb-proxy.git
   cd openweb-proxy
   ```

3. **安装 Wrangler**：

   - 全局安装 Cloudflare Wrangler CLI：

     ```bash
     npm install -g wrangler
     ```

4. **认证 Wrangler**：

   - 登录你的 Cloudflare 账户：

     ```bash
     wrangler login
     ```

5. **配置 Worker**：

   - 将 `wrangler.toml.example` 复制为 `wrangler.toml`，并更新 `name` 和 `account_id` 字段。
   - 可选：在 Worker 脚本中修改 `password` 变量设置密码（留空以禁用密码保护）。

6. **部署到 Cloudflare Workers**：

   - 部署 Worker 脚本：

     ```bash
     wrangler deploy
     ```

   - 你的代理将可通过 `https://<worker-name>.<your-subdomain>.workers.dev` 访问。

7. **自定义**：

   - 更新 `index.html` 和 `error.html` 文件，将占位符（例如 `https://example.com`、`your-username`）替换为你的代理域名和 GitHub 信息。
   - 根据需要添加或修改 `index.html` 中的热门网站卡片。

## Usage

1. **Access the Proxy**:
   - Visit your deployed Worker URL (e.g., `https://your-proxy-domain.workers.dev`).
   - If password protection is enabled, enter the configured password.
2. **Navigate Websites**:
   - Enter a website URL in the input box and click "Go" to access it via the proxy.
   - Click on popular site cards for quick access.
3. **Language Switching**:
   - Toggle between English and Chinese using the language buttons in the header.
   - Your preference is saved for future visits.
4. **Error Handling**:
   - If an invalid URL is entered, you'll be redirected to an error page with options to try again or return to the homepage.

### 使用说明

1. **访问代理**：
   - 访问你部署的 Worker URL（例如，`https://your-proxy-domain.workers.dev`）。
   - 如果启用了密码保护，输入配置的密码。
2. **浏览网站**：
   - 在输入框中输入网站地址，点击“前往”通过代理访问。
   - 点击热门网站卡片进行快速访问。
3. **语言切换**：
   - 使用头部语言按钮在英文和中文之间切换。
   - 你的偏好将被保存以供后续访问。
4. **错误处理**：
   - 如果输入了无效 URL，你将被重定向到错误页面，可选择重试或返回主页。

## Disclaimer

OpenWeb Proxy is provided "as is" without any warranties. The authors and contributors are not responsible for any damages, data loss, or legal consequences arising from the use of this service. Users are solely responsible for ensuring compliance with local laws and regulations. Avoid using this proxy for illegal activities or accessing sensitive accounts, as it may expose your data to risks. Always verify the authenticity of websites accessed through this proxy.

OpenWeb 代理按“原样”提供，不提供任何担保。作者及贡献者对因使用本服务而导致的任何损害、数据丢失或法律后果不承担责任。用户需自行确保遵守当地法律法规。禁止使用此代理进行非法活动或访问敏感账户，因其可能导致数据风险。始终验证通过此代理访问的网站的真实性。

## Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a Pull Request with a detailed description of your changes.

Please follow the Code of Conduct and check the Issues for existing tasks or bugs.

### 贡献指南

我们欢迎社区贡献！贡献步骤如下：

1. Fork 本仓库。
2. 创建新分支（`git checkout -b feature/your-feature`）。
3. 进行更改并提交（`git commit -m "Add your feature"`）。
4. 推送至你的分支（`git push origin feature/your-feature`）。
5. 提交 Pull Request，并详细描述你的更改。

请遵循行为准则，并查看Issues了解现有任务或错误。

## License

This project is licensed under the MIT License. See the LICENSE file for details.

本项目采用 MIT 许可证。详情见 LICENSE 文件。

## Contact

For questions or feedback, please open an issue on GitHub: https://github.com/Solaina888/OpenWeb/issues.

如有问题或反馈，请在 GitHub 上提交 issue： https://github.com/Solaina888/OpenWeb/issue。

---

Created by Solaina. Contributions welcome!
