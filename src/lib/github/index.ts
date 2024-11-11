import { App } from "@octokit/app";
import type { Endpoints } from "@octokit/types";
import { Octokit as OctokitCore } from "@octokit/core";

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
    name: string;
    path: string;
    type: 'blob' | 'tree';
    content: string;
    repoItem?: FlatTreeItem | TreeNode
}
export class GhApp {
    appId = 1046024
    app: App
    octokit: Octokit | undefined
    installId: number
    settingsFileName = "flat-cms.json"
    flatTrees: Record<string, FlatTreeItem[]> = {}
    constructor(installId: number) {
        this.installId = installId
        this.app = new App({
            appId: this.appId,
            privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAuOF+3CtOIRYWlzbUixzvXy1v3XCXOE2KTMltBpfK1IRWh2uZ
OFQ0Xt4esTW/SCoHHOk2l5HfNyei7DIiGX26r6LaIY6exU68xrpbxiFMaj0D/wCU
RoPKDJ7UlkPWrTeGPtGF1rBfuJoFJ9l1jGuLAGhqh2uAyUMWtpdtWGTxfw7M3Io5
5UAFNuFC70zgO+ABwjDRG6OEG6aGaGK5mdD3A57lkAF1S3CRvWh3e7JI6Jr1YnRa
U9usYIeFXHlS86JaiEUC86/WbldVx0ZdlVZEKM7L1W4W4NSB78ze/y2+bmIwJOdO
nReNrynDcU3rAMPR8SARSsCzMXoCkD0sWjjwTwIDAQABAoIBAAoN2URH5pvOA7R9
etmF3U6jve2g7dhV/ytl2NP+9TzRZZM/urlheued1LV2Ysyd3H0qAZoEiMsLEMUf
hNM2Dyz2Aj7I7sF0Irf78nm33dv5LXp0oZukFxzQlmcFkWsiFd7crhaayNnVJmqg
XNAiGREQnJp4siw/xcBwQ7YG50stfy5y9WH35Lm79he7O3pxBUxwl+6KrouMQa6p
n1IhGXnRnXCJbT6aV77rt2N6xKj57Q3CQsUnG+sX0mWWxACL+IxTg4ghNtG1KSsb
K55RRIxsgF+LGOHuCBtaaKFhP3Uvo/0EHg5rBbYYxObmHEZLzqGg/vAklwfbEE5J
9xeiwmECgYEA4/RMZRQKufc+RkFNLhGAuHbKprReRxlljKvQucfuUO+7lYbVlLH8
jA9V36tSJkvrxC5t/VWoZJSFhE5qwxijGe+nEpmZHXeNdN4XyOt9Nh8qSQGpDORH
jYew3Cvclgx5UKOdkPbOr0hS7jw60V16bgY/hjY5FxrGAq1zbQyZGOUCgYEAz6CL
tNu/TNsGstxy95N+n2KJMRLmDuC5RfQSkztM/BA31liNb/gCpnyxUFRi/5PhCiaR
9izl6kKwTISitBtbsKDx2Ie3+7L7qk0k503Xsx+wzvaSulNmBUJKRTYE9Vo3g4Qn
VE8mYaAf4ikUBX8UK4AFkQg1fwmflqFnYqwE1SMCgYA0/qKUDSjBOx2bL6tFvoPy
XouWXfBdDyZwobEQv85Durgddw9IVmikFxybtzSN+rCBF1oyvys61tyDeceQO7YP
XYu140eZdiXIualF6Jlfb7dg6aXnfVq1KIqRZREPQS8i9Ca5gOdkEKhXAmGaMuU3
lvRFu21iVbMbBEAFZhxhkQKBgHgHiRx6OUJ2EI5QMUp9AyOjNEqhcUxCj/kn26Ew
FBZYTd9lfAax6t5SkbMtxbmYxO04VQNq+1ONUBw8RU83za7zrDyQYUVqOGFAjcgG
UV9lP7K2CycaVY1OwF74lq88g4FNYes0gqzHhAcb1k5DI+bt8MniZALYDmFnV7xM
U9LfAoGBAMeo/grXBiV/f9l5YLsUzs/0DlDXy4dOisl6wa4WkfWJoUZVLWKCSafc
VKDztO87bZ0bSRV8BjqLmBB+O2pjNG3p6ulPK5T+Asu6V6S+yIIQwxE8phYmq3Ed
Q6ph5eGuGCuyOjj+qAWyk1YOqVrt5ozwQHtxs70fv7dQpxF6ED9k
-----END RSA PRIVATE KEY-----
`,
            oauth: {
                //@ts-ignore
                clientId: import.meta.env.GITHUB_CLIENT_ID,
                //@ts-ignore
                clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
            },
        });
    }
    async getInstallationUrl(githubId) {
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
    }
    async getSettingsFile(repo: Awaited<ReturnType<typeof this.getRepo>>) {
        const flatTree = await this.getFlatTree(repo)
        const settingsFile = flatTree.find(treeItem => treeItem.path.includes(this.settingsFileName))
        if (settingsFile) {
            return await this.getFileContent(settingsFile, repo)
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
        let decoded = ''
        //@ts-ignore
        if (res.data.type === 'file' && res.data.encoding === 'base64' && res.data.content) {
            //@ts-ignore
            decoded = atob(res.data.content)
        }
        return {
            repoItem,
            //@ts-ignore
            name: res.data.name,
            //@ts-ignore
            path: res.data.path,
            //@ts-ignore
            type: res.data.type,
            content: decoded
        }

    }
    async pushFile(message: string, email: string, name: string, fileItem: FileItem, repo: Awaited<ReturnType<typeof this.getRepo>>) {
        const octokit = await this.getOctoKit(),
            content = btoa(fileItem.content)
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
    }

}