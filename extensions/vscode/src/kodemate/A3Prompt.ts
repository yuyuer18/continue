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

    public async createTemplateFile(selectedService: any): Promise<boolean> {
        try {
            console.log("selectedService", selectedService);
            let fileName = selectedService.data.fileName;
            let prompts = selectedService.data.prompts;
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage("No workspace folder is open.");
                return false;
            }
            const rootPath = workspaceFolders[0].name;
            const promptsFolderPath = vscode.Uri.joinPath(workspaceFolders[0].uri, ".continue", "prompts");
            if (!fs.existsSync(promptsFolderPath.fsPath)) {
                fs.mkdirSync(promptsFolderPath.fsPath, { recursive: true });
            }
            // 确保.continue目录存在
            if (!fs.existsSync(this.baseDir)) {
                fs.mkdirSync(this.baseDir, { recursive: true });
            }
            if (fileName === 'random') {
                fileName = (rootPath.length > 10 ? rootPath.substring(0, 9) : rootPath) + "_" + Math.floor(Math.random() * prompts.length)
            }
            fileName = fileName + ".prompt";
            const targetPath = path.join(promptsFolderPath.fsPath, fileName);

            // 检查目标文件是否已存在
            if (fs.existsSync(targetPath)) {
                await vscode.window.showInformationMessage(`提示词文件 ${fileName} 已存在。`);
                return false;
            }

            // 从服务器下载模板文件
            try {

                if (this.serverUrl) {
                    const fileUrl = `${this.serverUrl}/templates/${fileName}`;
                    prompts = await vscode.workspace.fs.readFile(vscode.Uri.parse(fileUrl));
                }
                // 写入文件
                let targetFile = vscode.Uri.file(targetPath);
                const encoder = new TextEncoder();
                const randNum = Math.floor(Math.random() * 1000000);
                prompts = prompts.replace("提示词主题", "提示词主题_" + randNum);
                const uint8Array = encoder.encode(prompts);
                await vscode.workspace.fs.writeFile(
                    targetFile,
                    uint8Array
                );
                const document = await vscode.workspace.openTextDocument(targetFile);
                await vscode.window.showTextDocument(document);

                await vscode.window.showInformationMessage(`已创建提示词文件: ${fileName}`);
                return true;
            } catch (downloadError) {
                await vscode.window.showErrorMessage(`下载提示词文件失败: ${fileName}`);
                return false;
            }
        } catch (error) {
            await vscode.window.showErrorMessage(`创建提示词文件时出错: ${error}`);
            return false;
        }
    }
}