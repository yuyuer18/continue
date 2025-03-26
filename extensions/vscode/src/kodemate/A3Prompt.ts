import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export type TemplateType = 'prompt' | 'completion' | 'conversation';

export class A3Prompt {
    private readonly baseDir: string = '.continue';

    constructor(
        public prompt: string,
        private readonly serverUrl: string
    ) { }

    public async createTemplateFile(fileName: string): Promise<boolean> {
        try {
            // 确保.continue目录存在
            if (!fs.existsSync(this.baseDir)) {
                fs.mkdirSync(this.baseDir, { recursive: true });
            }

            fileName = fileName + ".prompt";
            const targetPath = path.join(this.baseDir, fileName);

            // 检查目标文件是否已存在
            if (fs.existsSync(targetPath)) {
                await vscode.window.showInformationMessage(`提示词文件 ${fileName} 已存在。`);
                return false;
            }

            // 从服务器下载模板文件
            try {
                const fileUrl = `${this.serverUrl}/templates/${fileName}`;
                const response = await vscode.workspace.fs.readFile(vscode.Uri.parse(fileUrl));

                // 写入文件
                await vscode.workspace.fs.writeFile(
                    vscode.Uri.file(targetPath),
                    response
                );

                await vscode.window.showInformationMessage(`已创建模板文件: ${fileName}`);
                return true;
            } catch (downloadError) {
                await vscode.window.showErrorMessage(`下载模板文件失败: ${fileName}`);
                return false;
            }
        } catch (error) {
            await vscode.window.showErrorMessage(`创建提示词文件时出错: ${error}`);
            return false;
        }
    }
}