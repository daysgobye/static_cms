import { App } from "@octokit/app";
import type { Endpoints } from "@octokit/types";
import { Octokit as OctokitCore } from "@octokit/core";
import { matter } from 'md-front-matter';
import type { SettingsFile } from "@lib/types";
import { toBinary, fromBinary } from "@lib/utils";


type Octokit = InstanceType<typeof OctokitCore>;
type RepoResponce = Endpoints["GET /installation/repositories"]["response"]
type FlatTreeItem = {
    path: string
    mode: string
    type: 'blob' | 'tree'
    sha: string
    url: string
    size?: number
}
export type TreeNode = {
    name: string;
    path: string;
    mode: string;
    type: 'blob' | 'tree';
    sha: string;
    url: string;
    size?: number;
    children?: Record<string, TreeNode>;
};
export type FileItem = {
    frontMatter?: Record<string, any>
    fileType: "image" | "string"
    name: string;
    path: string;
    type: 'blob' | 'tree';
    content: string;
    repoItem?: FlatTreeItem | TreeNode
}
export class GhApp {
    appId: number
    app: App
    octokit: Octokit | undefined
    installId: number
    settingsFileName = "flat-cms.json"
    flatTrees: Record<string, FlatTreeItem[]> = {}
    privateKey: string
    constructor(installId: number, env: Record<string, string>) {
        this.privateKey = env.GITHUB_PRIVATE_KEY
        this.appId = Number(env.GITHUB_APPID)
        this.installId = installId
        this.app = new App({
            appId: this.appId,
            privateKey: this.privateKey,
            oauth: {
                //@ts-ignore
                clientId: env.GITHUB_CLIENT_ID,
                //@ts-ignore
                clientSecret: env.GITHUB_CLIENT_SECRET,
            },
        });
    }
    async getInstallationUrl(githubId: number) {
        return await this.app.getInstallationUrl({
            target_id: githubId,
        });
    }
    async getOctoKit(): Promise<Octokit> {
        if (this.octokit) {
            return this.octokit
        } else {
            const octokit = await this.app.getInstallationOctokit(this.installId)
            this.octokit = await this.app.getInstallationOctokit(this.installId)
            return this.octokit
        }
    }
    async getRepoList() {
        const octokit = await this.getOctoKit()
        const repos = await octokit.request("GET /installation/repositories", {
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });
        return repos.data.repositories
    }
    async getRepo(repoName: string) {
        const repos = await this.getRepoList()
        const repo = repos.filter(
            (repo) => repo.name === repoName,
        )[0];
        if (repo) {
            return repo
        } else {
            return undefined
        }
    }

    async getFlatTree(repo: Awaited<ReturnType<typeof this.getRepo>>) {
        if (repo) {

            if (this.flatTrees.hasOwnProperty(repo.name)) {
                return this.flatTrees[repo.name]
            }
            const octokit = await this.getOctoKit()
            const flatTree: FlatTreeItem[] = await octokit.request(
                "GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1",
                {
                    owner: repo.owner.login,
                    repo: repo.name,
                    tree_sha: repo.default_branch,
                    headers: {
                        "X-GitHub-Api-Version": "2022-11-28",
                    },
                },
            ).then(res => res.data.tree)
            this.flatTrees[repo.name] = flatTree
            return flatTree
        } else {
            throw new Error("repo undefined")
        }
    }


    async getSettingsFile(repo: Awaited<ReturnType<typeof this.getRepo>>): Promise<FileItem | undefined> {
        const flatTree = await this.getFlatTree(repo)
        const settingsFile = flatTree.find(treeItem => treeItem.path.includes(this.settingsFileName))
        if (settingsFile) {
            const file = await this.getFileContent(settingsFile, repo)
            return file
        } else {
            return undefined
        }
    }
    async getSettings(repo: Awaited<ReturnType<typeof this.getRepo>>): Promise<SettingsFile | undefined> {

        const file = await this.getSettingsFile(repo)
        if (file) {
            return JSON.parse(file.content)
        } else {
            return undefined
        }
    }

    async getTree(repo: Awaited<ReturnType<typeof this.getRepo>>) {
        const flatTreeRaw = await this.getFlatTree(repo)
        const flatTree = flatTreeRaw.filter(item => {
            const tree = item.type === "tree"
            if (tree) {
                return true
            }
            const split = item.path.split(".")
            const fileType = split[split.length - 1]
            const acceptedFiletypes = ["md", "mdx", 'png', 'jpg', 'jpeg', 'gif', "webem"]
            return acceptedFiletypes.includes(fileType)

        })
        const root: TreeNode = {
            name: 'root',
            path: '/',
            mode: '',
            type: 'tree',
            sha: '',
            url: '',
            children: {},
        };

        flatTree.forEach((item) => {
            const pathParts = item.path.split('/');
            let currentNode = root;

            pathParts.forEach((part, index) => {
                if (!currentNode.children) {
                    currentNode.children = {};
                }

                if (!currentNode.children[part]) {
                    currentNode.children[part] = {
                        name: part,
                        path: pathParts.slice(0, index + 1).join('/'),
                        mode: item.mode,
                        type: index === pathParts.length - 1 ? item.type : 'tree',
                        sha: item.sha,
                        url: item.url,
                        ...(index === pathParts.length - 1 && item.size ? { size: item.size } : {}),
                        children: item.type === 'tree' && index !== pathParts.length - 1 ? {} : undefined,
                    };
                }

                currentNode = currentNode.children[part];
            });
        });
        return root;
    }
    async getFileContent(repoItem: FlatTreeItem | TreeNode, repo: Awaited<ReturnType<typeof this.getRepo>>): Promise<FileItem> {
        if (repo) {
            const octokit = await this.getOctoKit()
            if (repoItem.type !== 'blob') {
                throw new Error("Only request files not folders");
            }
            const res = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: repo.owner.login,
                repo: repo.name,
                path: repoItem.path,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            })
            const imageTypes = ['png', 'jpg', 'jpeg', 'gif', "webem"]
            //@ts-ignore
            const nameSplit = res.data.name.split(".")
            const fileType = nameSplit[nameSplit.length - 1]
            let decoded = ''
            //@ts-ignore
            if (res.data.type === 'file' && res.data.encoding === 'base64' && res.data.content) {

                if (imageTypes.includes(fileType)) {
                    //@ts-ignore
                    decoded = `data:image/${fileType};base64, ${res.data.content}`
                } else {
                    //@ts-ignore
                    decoded = fromBinary(res.data.content)
                }
            }

            let returnData: FileItem = {
                fileType: imageTypes.includes(fileType) ? "image" : "string",
                repoItem,
                //@ts-ignore
                name: res.data.name,
                //@ts-ignore
                path: res.data.path,
                //@ts-ignore
                type: res.data.type,
                content: decoded
            }
            if (fileType === "md" || fileType === "mdx") {
                const { content, data } = matter(returnData.content)
                returnData.content = content
                returnData.frontMatter = data
            }
            return returnData
        } else {
            throw new Error("repo undefined")
        }
    }
    async pushFile(message: string, email: string, name: string, fileItem: FileItem, repo: Awaited<ReturnType<typeof this.getRepo>>, isBinary?: boolean) {
        if (repo) {
            const octokit = await this.getOctoKit(),
                content = isBinary ? fileItem.content : toBinary(fileItem.content)
            let requestData = {
                owner: repo.owner.login,
                repo: repo.name,
                path: fileItem.path,
                message,
                committer: {
                    name,
                    email
                },
                content,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            }
            if (fileItem.repoItem !== undefined) {
                //@ts-ignore
                requestData.sha = fileItem.repoItem.sha
            }
            const res = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', requestData)
            return res.data
        } else {
            throw new Error("repo undefined")
        }
    }

}